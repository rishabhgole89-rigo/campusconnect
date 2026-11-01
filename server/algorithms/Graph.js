/**
 * Graph — Adjacency List Representation of the Student Network
 *
 * Vertex: Student (user ID string)
 * Edge:   Accepted connection between two students
 *
 * Internal representation: Map<userId, Set<userId>>
 *
 * Why adjacency list?
 * - College networks are SPARSE: most students connect with a small fraction of total students
 * - Space: O(V + E) vs O(V²) for an adjacency matrix
 * - Neighbor lookup: O(1) per vertex
 * - Adding edge: O(1)
 */
class Graph {
  constructor() {
    /** @type {Map<string, Set<string>>} */
    this.adjacencyList = new Map();
    /** @type {Map<string, object>} stores user metadata for display */
    this.userMap = new Map();
  }

  /**
   * Add a vertex (student) to the graph
   * @param {string} userId
   * @param {object} userData - { name, branch, year, skills, interests, profileImage }
   */
  addVertex(userId, userData = {}) {
    if (!this.adjacencyList.has(userId)) {
      this.adjacencyList.set(userId, new Set());
    }
    this.userMap.set(userId, userData);
  }

  /**
   * Add an undirected edge (accepted connection) between two students
   * @param {string} userA
   * @param {string} userB
   */
  addEdge(userA, userB) {
    if (!this.adjacencyList.has(userA)) this.addVertex(userA);
    if (!this.adjacencyList.has(userB)) this.addVertex(userB);
    this.adjacencyList.get(userA).add(userB);
    this.adjacencyList.get(userB).add(userA);
  }

  /**
   * Get all neighbors of a vertex
   * @param {string} userId
   * @returns {Set<string>}
   */
  getNeighbors(userId) {
    return this.adjacencyList.get(userId) || new Set();
  }

  /**
   * Get all vertex IDs in the graph
   * @returns {string[]}
   */
  getVertices() {
    return [...this.adjacencyList.keys()];
  }

  /**
   * Check if two users are directly connected
   * @param {string} userA
   * @param {string} userB
   * @returns {boolean}
   */
  hasEdge(userA, userB) {
    return this.adjacencyList.has(userA) && this.adjacencyList.get(userA).has(userB);
  }

  /**
   * Get the degree (number of direct connections) of a user
   * @param {string} userId
   * @returns {number}
   */
  getDegree(userId) {
    return this.adjacencyList.has(userId) ? this.adjacencyList.get(userId).size : 0;
  }

  /**
   * Get stored user metadata
   * @param {string} userId
   * @returns {object}
   */
  getUserData(userId) {
    return this.userMap.get(userId) || {};
  }

  /**
   * Get basic graph statistics
   * @returns {{ vertices: number, edges: number }}
   */
  getStats() {
    let edgeCount = 0;
    for (const neighbors of this.adjacencyList.values()) {
      edgeCount += neighbors.size;
    }
    return {
      vertices: this.adjacencyList.size,
      edges: edgeCount / 2  // undirected: each edge counted twice
    };
  }
}

module.exports = Graph;
