/**
 * Graph Service
 * Bridge between the MongoDB layer and the algorithm layer.
 * Builds in-memory Graph instances from database data.
 */
const Connection = require('../models/Connection');
const User = require('../models/User');
const Graph = require('../algorithms/Graph');

/**
 * Build the full graph from ALL accepted connections in the database.
 * Used for: shortest-path, community detection, network stats, recommendations.
 * @returns {Promise<Graph>}
 */
async function buildFullGraph() {
  const [connections, users] = await Promise.all([
    Connection.find({ status: 'accepted' }),
    User.find({}).select('name branch year skills interests profileImage')
  ]);

  const graph = new Graph();

  // Add all users as vertices
  for (const user of users) {
    graph.addVertex(user._id.toString(), {
      name: user.name,
      branch: user.branch,
      year: user.year,
      skills: user.skills,
      interests: user.interests,
      profileImage: user.profileImage
    });
  }

  // Add all accepted connections as undirected edges
  for (const conn of connections) {
    graph.addEdge(conn.sender.toString(), conn.receiver.toString());
  }

  return graph;
}

/**
 * Build an ego graph (local neighborhood) centered on a specific user.
 * Includes: the user, their direct connections, and edges between them.
 * Used for: network visualization on the user's profile/network page.
 * @param {string} userId
 * @returns {Promise<Graph>}
 */
async function buildEgoGraph(userId) {
  const connections = await Connection.find({
    $or: [{ sender: userId }, { receiver: userId }],
    status: 'accepted'
  }).populate('sender', 'name branch year skills profileImage')
    .populate('receiver', 'name branch year skills profileImage');

  const nodeIds = new Set([userId]);
  for (const conn of connections) {
    const otherId = conn.sender._id.toString() === userId
      ? conn.receiver._id.toString()
      : conn.sender._id.toString();
    nodeIds.add(otherId);
  }

  const nodeIdArray = [...nodeIds];
  const [users, interConns] = await Promise.all([
    User.find({ _id: { $in: nodeIdArray } }).select('name branch year skills interests profileImage'),
    Connection.find({
      sender: { $in: nodeIdArray },
      receiver: { $in: nodeIdArray },
      status: 'accepted'
    })
  ]);

  const graph = new Graph();
  for (const user of users) {
    graph.addVertex(user._id.toString(), {
      name: user.name,
      branch: user.branch,
      year: user.year,
      skills: user.skills,
      interests: user.interests,
      profileImage: user.profileImage
    });
  }
  for (const conn of interConns) {
    graph.addEdge(conn.sender.toString(), conn.receiver.toString());
  }

  return graph;
}

module.exports = { buildFullGraph, buildEgoGraph };
