/**
 * BFS — Breadth-First Search for Shortest Connection Path
 *
 * Purpose:
 *   Find the shortest connection (path) between two students in the network.
 *   This answers: "How are Student A and Student B connected?"
 *
 * Why BFS (not DFS)?
 *   BFS explores the graph level by level (all 1-hop neighbors first, then
 *   2-hop, etc.). This guarantees that the FIRST time we reach the target,
 *   we've found it via the shortest possible path.
 *   DFS would find A path, but NOT necessarily the shortest one.
 *
 * Data Structures:
 *   Queue       — FIFO order ensures level-by-level exploration
 *   Visited Set — O(1) lookup; prevents revisiting nodes
 *   Parent Map  — records "how did we get here" for path reconstruction
 *
 * Time Complexity:  O(V + E) — each vertex and edge visited at most once
 * Space Complexity: O(V)     — queue, visited, and parent maps each O(V)
 *
 * Example:
 *   Graph:  Rahul → Aman → Priya → Vikas
 *   Input:  source = "Rahul", target = "Vikas"
 *   Output: { path: ["Rahul","Aman","Priya","Vikas"], distance: 3 }
 */

/**
 * Find shortest path between source and target using BFS
 * @param {Graph} graph
 * @param {string} source - source user ID
 * @param {string} target - target user ID
 * @returns {{ path: string[], distance: number } | null}
 */
function bfsShortestPath(graph, source, target) {
  // Edge case: same node
  if (source === target) {
    return { path: [source], distance: 0 };
  }

  // Edge case: node not in graph
  if (!graph.adjacencyList.has(source) || !graph.adjacencyList.has(target)) {
    return null;
  }

  const queue = [source];              // BFS queue (FIFO)
  const visited = new Set([source]);   // Visited set for O(1) lookup
  const parent = new Map();            // parent[node] = how we got here
  parent.set(source, null);

  while (queue.length > 0) {
    const current = queue.shift(); // Dequeue

    for (const neighbor of graph.getNeighbors(current)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, current);
        queue.push(neighbor); // Enqueue

        // Found target — reconstruct path immediately
        if (neighbor === target) {
          return reconstructPath(parent, source, target);
        }
      }
    }
  }

  // Target unreachable (disconnected graph)
  return null;
}

/**
 * Reconstruct the actual path from source to target
 * using the parent map built during BFS.
 * Traces back from target → source, then reverses.
 *
 * @param {Map} parent
 * @param {string} source
 * @param {string} target
 * @returns {{ path: string[], distance: number }}
 */
function reconstructPath(parent, source, target) {
  const path = [];
  let current = target;

  // Walk backwards from target to source
  while (current !== null) {
    path.unshift(current); // prepend to build path in order
    current = parent.get(current);
  }

  return {
    path,
    distance: path.length - 1
  };
}

/**
 * BFS Distance Map — find distances from source to all reachable nodes
 * Useful for network proximity scoring in recommendations
 *
 * @param {Graph} graph
 * @param {string} source
 * @returns {Map<string, number>} userId → distance from source
 */
function bfsDistances(graph, source) {
  const distances = new Map([[source, 0]]);
  const queue = [source];

  while (queue.length > 0) {
    const current = queue.shift();
    const currentDist = distances.get(current);

    for (const neighbor of graph.getNeighbors(current)) {
      if (!distances.has(neighbor)) {
        distances.set(neighbor, currentDist + 1);
        queue.push(neighbor);
      }
    }
  }

  return distances;
}

module.exports = { bfsShortestPath, bfsDistances, reconstructPath };
