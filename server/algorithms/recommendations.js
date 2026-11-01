/**
 * Recommendations Engine
 *
 * Three recommendation strategies, each using explicit DSA:
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 1. peopleYouMayKnow — "Mutual Friends" scoring
 *    Finds 2-hop neighbors and scores them by mutual-friend count.
 *    Data structure: HashMap<userId, score>
 *    Time: O(degree(u) × avg_degree)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 2. peopleLikeYou — "Skill/Interest Similarity" scoring
 *    Scores users by Set intersection of skills and interests.
 *    Data structure: HashSet for O(1) membership lookup
 *    Time: O(|skills_u| + |interest_u| per candidate)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 3. skillBasedCollaborators — "Skill Index" matching
 *    Uses HashMap<skill, Set<userId>> for efficient skill lookup.
 *    Combines: skill match count + mutual connection bonus.
 *    Time: O(|requiredSkills| + |candidates|)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

/**
 * Build a skill index (inverted index) from a list of users.
 * Maps each skill to the set of users who have that skill.
 * Enables O(1) lookup per skill instead of scanning all users.
 *
 * @param {object[]} users
 * @returns {Map<string, Set<string>>} skill → Set of userIds
 */
function buildSkillIndex(users) {
  const index = new Map();
  for (const user of users) {
    for (const skill of (user.skills || [])) {
      const k = skill.toLowerCase();
      if (!index.has(k)) index.set(k, new Set());
      index.get(k).add(user._id.toString());
    }
  }
  return index;
}

/**
 * Build an interest index from a list of users.
 * @param {object[]} users
 * @returns {Map<string, Set<string>>}
 */
function buildInterestIndex(users) {
  const index = new Map();
  for (const user of users) {
    for (const interest of (user.interests || [])) {
      const k = interest.toLowerCase();
      if (!index.has(k)) index.set(k, new Set());
      index.get(k).add(user._id.toString());
    }
  }
  return index;
}

/**
 * People You May Know — 2-hop neighbor scoring
 *
 * For each direct connection of `userId`, look at THEIR connections.
 * Any user who appears multiple times is a "mutual connection" candidate.
 * Score = number of mutual connections (higher = more likely to know).
 *
 * @param {Graph} graph
 * @param {string} userId
 * @param {number} limit
 * @returns {{ userId: string, score: number, mutualCount: number }[]}
 */
function peopleYouMayKnow(graph, userId, limit = 10) {
  const directConnections = graph.getNeighbors(userId);
  // HashMap: candidate userId → mutual friend count
  const scoreMap = new Map();

  for (const connId of directConnections) {
    const secondDegree = graph.getNeighbors(connId);
    for (const candidate of secondDegree) {
      // Skip self and existing direct connections
      if (candidate === userId || directConnections.has(candidate)) continue;
      scoreMap.set(candidate, (scoreMap.get(candidate) || 0) + 1);
    }
  }

  // Convert to array and sort by score descending — O(n log n)
  return [...scoreMap.entries()]
    .map(([uid, score]) => ({ userId: uid, score, mutualCount: score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * People Like You — skill and interest similarity scoring
 *
 * For each candidate user, compute Set intersection with current user's
 * skills and interests. Score = 2×(shared skills) + 1×(shared interests).
 * Skills weighted more heavily as they are more specific.
 *
 * @param {object} currentUser - { _id, skills, interests }
 * @param {object[]} allUsers
 * @param {string[]} excludeIds - already connected user IDs
 * @param {number} limit
 * @returns {{ userId, score, commonSkills, commonInterests }[]}
 */
function peopleLikeYou(currentUser, allUsers, excludeIds = [], limit = 10) {
  const userId = currentUser._id.toString();
  // Build HashSets for O(1) lookup
  const mySkills = new Set((currentUser.skills || []).map(s => s.toLowerCase()));
  const myInterests = new Set((currentUser.interests || []).map(i => i.toLowerCase()));
  const excludeSet = new Set([userId, ...excludeIds.map(id => id.toString())]);

  const scored = [];

  for (const user of allUsers) {
    const uid = user._id.toString();
    if (excludeSet.has(uid)) continue;

    // Set intersection — O(min(|mySkills|, |theirSkills|))
    const theirSkills = new Set((user.skills || []).map(s => s.toLowerCase()));
    const commonSkills = [...mySkills].filter(s => theirSkills.has(s));

    const theirInterests = new Set((user.interests || []).map(i => i.toLowerCase()));
    const commonInterests = [...myInterests].filter(i => theirInterests.has(i));

    const score = commonSkills.length * 2 + commonInterests.length;
    if (score > 0) {
      scored.push({ userId: uid, score, commonSkills, commonInterests });
    }
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Skill-Based Collaborator Recommendations
 *
 * Given a list of required skills, find students who match them.
 * Scoring formula:
 *   totalScore = (skill match count × 3) + (mutual connection bonus)
 *
 * Skill match is weighted 3× more than network proximity because
 * having the right skills is the primary requirement for collaboration.
 *
 * @param {string[]} requiredSkills
 * @param {object[]} allUsers
 * @param {Graph} graph
 * @param {string} requesterId
 * @param {string[]} excludeIds
 * @param {number} limit
 * @returns {{ userId, skillScore, mutualScore, totalScore, matchedSkills }[]}
 */
function skillBasedCollaborators(requiredSkills, allUsers, graph, requesterId, excludeIds = [], limit = 10) {
  const skillSet = new Set(requiredSkills.map(s => s.toLowerCase()));
  const requesterConns = graph.getNeighbors(requesterId);
  const excludeSet = new Set([requesterId, ...excludeIds.map(id => id.toString())]);

  const scored = [];

  for (const user of allUsers) {
    const uid = user._id.toString();
    if (excludeSet.has(uid)) continue;

    // Check skill match via HashSet intersection
    const userSkills = new Set((user.skills || []).map(s => s.toLowerCase()));
    const matchedSkills = [...skillSet].filter(s => userSkills.has(s));
    if (matchedSkills.length === 0) continue;

    // Network proximity bonus: count mutual connections
    let mutualScore = 0;
    for (const connId of requesterConns) {
      if (graph.hasEdge(connId, uid)) mutualScore++;
    }

    scored.push({
      userId: uid,
      skillScore: matchedSkills.length,
      mutualScore,
      totalScore: matchedSkills.length * 3 + mutualScore,
      matchedSkills
    });
  }

  return scored.sort((a, b) => b.totalScore - a.totalScore).slice(0, limit);
}

module.exports = {
  buildSkillIndex,
  buildInterestIndex,
  peopleYouMayKnow,
  peopleLikeYou,
  skillBasedCollaborators
};
