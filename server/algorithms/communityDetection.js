/**
 * Community Detection — Connected Components with Metadata
 *
 * Uses DFS-based connected component detection and enriches each
 * component with aggregated skill/interest frequency data.
 *
 * Important note: These are NETWORK connectivity groups, not necessarily
 * social communities in the sociological sense. Students in the same
 * component can reach each other through chains of connections.
 */
const { findConnectedComponents } = require('./dfs');

/**
 * Detect communities and enrich with member data and common themes
 * @param {Graph} graph
 * @returns {object[]} enriched community objects
 */
function detectCommunities(graph) {
  const rawComponents = findConnectedComponents(graph);

  return rawComponents.map((componentUserIds, index) => {
    // Get user data from graph's internal userMap
    const members = componentUserIds.map(uid => ({
      userId: uid,
      ...graph.getUserData(uid)
    }));

    // Aggregate skill and interest frequencies using HashMap
    const skillFreq = new Map();
    const interestFreq = new Map();

    for (const member of members) {
      for (const skill of (member.skills || [])) {
        const s = skill.toLowerCase();
        skillFreq.set(s, (skillFreq.get(s) || 0) + 1);
      }
      for (const interest of (member.interests || [])) {
        const i = interest.toLowerCase();
        interestFreq.set(i, (interestFreq.get(i) || 0) + 1);
      }
    }

    // Sort by frequency and take top 5 — O(k log k) where k = unique skills
    const topSkills = [...skillFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([s]) => s);

    const topInterests = [...interestFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([i]) => i);

    return {
      communityId: index + 1,
      size: members.length,
      members,
      topSkills,
      topInterests
    };
  });
}

module.exports = { detectCommunities };
