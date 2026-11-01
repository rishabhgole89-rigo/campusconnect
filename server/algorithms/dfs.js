/**
 * DFS — Depth-First Search for Network Exploration
 *
 * Purpose:
 *   1. Explore all nodes reachable from a given source
 *   2. Detect connected components (network groups)
 *
 * Why DFS for connected components?
 *   When we run DFS from any node in a connected subgraph, it visits
 *   ALL nodes in that subgraph before returning. So by running DFS from
 *   each unvisited node, we naturally partition the graph into components.
 *
 * Implementation: ITERATIVE (stack-based)
 *   We use an explicit stack instead of recursion to avoid call-stack overflow
 *   for large networks (JavaScript default stack: ~10,000 frames).
 *
 * Data Structures:
 *   Stack       — LIFO; drives depth-first exploration
 *   Visited Set — O(1) lookup; prevents infinite loops
 *
 * Time Complexity:  O(V + E) — each vertex and edge visited at most once
 * Space Complexity: O(V)     — stack and visited set
 *
 * Example:
 *   Graph has 2 components: {A,B,C,D,E,F} and {G,H}
 *   findConnectedComponents() returns [[A,B,C,D,E,F], [G,H]]
 */

/**
 * Iterative DFS — explore all nodes reachable from source
 * @param {Graph} graph
 * @param {string} source
 * @param {Set} visited - shared across calls for component detection
 * @returns {string[]} all node IDs in this component
 */
function dfsIterative(graph, source, visited = new Set()) {
  const stack = [source];
  const component = [];

  while (stack.length > 0) {
    const current = stack.pop(); // Pop from stack (LIFO = depth-first)

    if (visited.has(current)) continue;
    visited.add(current);
    component.push(current);

    // Push all unvisited neighbors onto the stack
    for (const neighbor of graph.getNeighbors(current)) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }

  return component;
}

/**
 * Find all connected components in the graph.
 * Each component contains students who can reach each other through connections.
 *
 * Algorithm:
 *   For each unvisited vertex, run DFS to find its entire component.
 *   Continue until all vertices are visited.
 *
 * @param {Graph} graph
 * @returns {string[][]} array of components, each is an array of user IDs, sorted by size desc
 */
function findConnectedComponents(graph) {
  const visited = new Set();
  const components = [];

  for (const vertex of graph.getVertices()) {
    if (!visited.has(vertex)) {
      // DFS fills `visited` with all nodes in this component
      const component = dfsIterative(graph, vertex, visited);
      components.push(component);
    }
  }

  // Sort by size descending (largest community first)
  components.sort((a, b) => b.length - a.length);

  return components;
}

/**
 * Check if two users are in the same connected component
 * (i.e., reachable from each other through any chain of connections)
 * @param {Graph} graph
 * @param {string} source
 * @param {string} target
 * @returns {boolean}
 */
function areConnected(graph, source, target) {
  const visited = new Set();
  const component = dfsIterative(graph, source, visited);
  return component.includes(target);
}

module.exports = { dfsIterative, findConnectedComponents, areConnected };
