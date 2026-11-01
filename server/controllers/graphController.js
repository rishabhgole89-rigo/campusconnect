const { buildFullGraph, buildEgoGraph } = require('../services/graphService');
const { bfsShortestPath, bfsDistances } = require('../algorithms/bfs');
const { findConnectedComponents } = require('../algorithms/dfs');
const { detectCommunities } = require('../algorithms/communityDetection');
const { peopleYouMayKnow, peopleLikeYou, skillBasedCollaborators } = require('../algorithms/recommendations');
const Connection = require('../models/Connection');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

// GET /api/graph/network/:userId
exports.getEgoNetwork = async (req, res) => {
  try {
    const graph = await buildEgoGraph(req.params.userId);
    const nodes = [];
    const edges = [];
    const seen = new Set();

    for (const [userId, neighbors] of graph.adjacencyList.entries()) {
      nodes.push({ id: userId, ...graph.getUserData(userId) });
      for (const neighborId of neighbors) {
        const edgeKey = [userId, neighborId].sort().join('--');
        if (!seen.has(edgeKey)) {
          seen.add(edgeKey);
          edges.push({ source: userId, target: neighborId });
        }
      }
    }

    return sendSuccess(res, { nodes, edges, stats: graph.getStats() }, 'Ego network retrieved');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// GET /api/graph/shortest-path/:source/:target
exports.shortestPath = async (req, res) => {
  try {
    const { source, target } = req.params;
    const graph = await buildFullGraph();
    const result = bfsShortestPath(graph, source, target);

    if (!result) {
      return sendError(res, 'No connection path found between these users', 404, 'NO_PATH');
    }

    const enrichedPath = result.path.map(uid => ({ id: uid, ...graph.getUserData(uid) }));

    return sendSuccess(res, {
      source: { id: source, ...graph.getUserData(source) },
      target: { id: target, ...graph.getUserData(target) },
      path: enrichedPath,
      distance: result.distance,
      algorithm: 'BFS',
      complexity: { time: 'O(V + E)', space: 'O(V)' }
    }, 'Shortest connection found');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// GET /api/graph/communities
exports.getCommunities = async (req, res) => {
  try {
    const graph = await buildFullGraph();
    const communities = detectCommunities(graph);
    const stats = graph.getStats();

    return sendSuccess(res, {
      communities,
      totalCommunities: communities.length,
      totalStudents: stats.vertices,
      totalConnections: stats.edges,
      algorithm: 'DFS Connected Components',
      complexity: { time: 'O(V + E)', space: 'O(V)' }
    }, 'Communities detected');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// GET /api/graph/stats
exports.getNetworkStats = async (req, res) => {
  try {
    const graph = await buildFullGraph();
    const stats = graph.getStats();
    const components = findConnectedComponents(graph);
    const userId = req.user._id.toString();

    const degree = graph.getDegree(userId);
    const distances = bfsDistances(graph, userId);
    const reachable = distances.size - 1;

    const topConnected = graph.getVertices()
      .map(uid => ({ userId: uid, degree: graph.getDegree(uid), ...graph.getUserData(uid) }))
      .sort((a, b) => b.degree - a.degree)
      .slice(0, 5);

    return sendSuccess(res, {
      network: {
        totalStudents: stats.vertices,
        totalConnections: stats.edges,
        communities: components.length
      },
      myStats: {
        degree,
        reachableStudents: reachable
      },
      topConnected
    }, 'Network stats retrieved');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// GET /api/recommendations/people
exports.getPeopleRecommendations = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const graph = await buildFullGraph();
    const candidates = peopleYouMayKnow(graph, userId, 15);

    const userIds = candidates.map(c => c.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select('name email branch year skills interests profileImage');
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    const enriched = candidates
      .filter(c => userMap.has(c.userId))
      .map(c => ({
        user: userMap.get(c.userId),
        mutualCount: c.mutualCount,
        score: c.score,
        reason: `${c.mutualCount} mutual connection${c.mutualCount !== 1 ? 's' : ''}`
      }));

    return sendSuccess(res, {
      recommendations: enriched,
      algorithm: 'BFS 2-hop neighbor scoring'
    }, 'People recommendations retrieved');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// GET /api/recommendations/similar
exports.getSimilarPeople = async (req, res) => {
  try {
    const currentUser = req.user;
    const userId = currentUser._id.toString();

    const [allUsers, myConnections] = await Promise.all([
      User.find({ _id: { $ne: userId } }).select('name email branch year skills interests profileImage'),
      Connection.find({ $or: [{ sender: userId }, { receiver: userId }], status: 'accepted' })
    ]);

    const connectedIds = myConnections.map(c =>
      c.sender.toString() === userId ? c.receiver.toString() : c.sender.toString()
    );

    const candidates = peopleLikeYou(currentUser, allUsers, connectedIds, 15);

    const userIds = candidates.map(c => c.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select('name email branch year skills interests profileImage');
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    const enriched = candidates
      .filter(c => userMap.has(c.userId))
      .map(c => ({
        user: userMap.get(c.userId),
        commonSkills: c.commonSkills,
        commonInterests: c.commonInterests,
        score: c.score,
        reason: `${c.commonSkills.length} common skill${c.commonSkills.length !== 1 ? 's' : ''}, ${c.commonInterests.length} common interest${c.commonInterests.length !== 1 ? 's' : ''}`
      }));

    return sendSuccess(res, {
      recommendations: enriched,
      algorithm: 'Set intersection on skills and interests'
    }, 'Similar people retrieved');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// GET /api/recommendations/collaborators?skills=React,Node.js
exports.getCollaboratorRecommendations = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const skillsParam = req.query.skills || '';
    const requiredSkills = skillsParam.split(',').map(s => s.trim()).filter(Boolean);

    if (requiredSkills.length === 0) {
      return sendError(res, 'Please provide required skills as ?skills=React,Node.js', 400, 'NO_SKILLS');
    }

    const [allUsers, graph] = await Promise.all([
      User.find({ _id: { $ne: userId } }).select('name email branch year skills interests profileImage'),
      buildFullGraph()
    ]);

    const candidates = skillBasedCollaborators(requiredSkills, allUsers, graph, userId, [], 15);

    const userIds = candidates.map(c => c.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select('name email branch year skills interests profileImage');
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    const enriched = candidates
      .filter(c => userMap.has(c.userId))
      .map(c => ({
        user: userMap.get(c.userId),
        matchedSkills: c.matchedSkills,
        skillScore: c.skillScore,
        mutualScore: c.mutualScore,
        totalScore: c.totalScore,
        reason: `Matches ${c.matchedSkills.length} required skill${c.matchedSkills.length !== 1 ? 's' : ''}`
      }));

    return sendSuccess(res, {
      recommendations: enriched,
      requiredSkills,
      algorithm: 'Skill index HashMap + network proximity scoring'
    }, 'Collaborator recommendations retrieved');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};
