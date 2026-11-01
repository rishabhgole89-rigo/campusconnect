const Graph = require('../algorithms/Graph');
const { bfsShortestPath, bfsDistances } = require('../algorithms/bfs');
const { dfsIterative, findConnectedComponents, areConnected } = require('../algorithms/dfs');
const { peopleYouMayKnow, peopleLikeYou, skillBasedCollaborators } = require('../algorithms/recommendations');

// ─── Test Helpers ─────────────────────────────────────────────────────────────

/**
 * Build a standard test graph:
 * Component 1: A-B-C-D, A-E, B-F  (6 nodes)
 * Component 2: G-H                 (2 nodes, isolated)
 *
 * Visual:
 *   E - A - B - C - D
 *           |
 *           F
 *   G - H
 */
function buildTestGraph() {
  const graph = new Graph();
  const vertices = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const edges = [['A','B'],['B','C'],['C','D'],['A','E'],['B','F'],['G','H']];
  vertices.forEach(v => graph.addVertex(v, { name: v }));
  edges.forEach(([u, v]) => graph.addEdge(u, v));
  return graph;
}

// ─── Graph Tests ──────────────────────────────────────────────────────────────

describe('Graph (Adjacency List)', () => {
  test('addVertex creates entries correctly', () => {
    const g = new Graph();
    g.addVertex('X', { name: 'X' });
    expect(g.adjacencyList.has('X')).toBe(true);
    expect(g.adjacencyList.get('X').size).toBe(0);
  });

  test('addEdge creates undirected connection', () => {
    const g = buildTestGraph();
    expect(g.hasEdge('A', 'B')).toBe(true);
    expect(g.hasEdge('B', 'A')).toBe(true); // undirected
    expect(g.hasEdge('A', 'D')).toBe(false); // not directly connected
  });

  test('getDegree returns correct count', () => {
    const g = buildTestGraph();
    expect(g.getDegree('A')).toBe(2); // B, E
    expect(g.getDegree('B')).toBe(3); // A, C, F
    expect(g.getDegree('D')).toBe(1); // only C
  });

  test('getStats returns correct vertex and edge counts', () => {
    const g = buildTestGraph();
    const stats = g.getStats();
    expect(stats.vertices).toBe(8);
    expect(stats.edges).toBe(6);
  });
});

// ─── BFS Tests ────────────────────────────────────────────────────────────────

describe('BFS — Shortest Path', () => {
  let graph;
  beforeEach(() => { graph = buildTestGraph(); });

  test('finds path between adjacent nodes (distance 1)', () => {
    const result = bfsShortestPath(graph, 'A', 'B');
    expect(result).not.toBeNull();
    expect(result.distance).toBe(1);
    expect(result.path).toEqual(['A', 'B']);
  });

  test('finds shortest path at distance 3', () => {
    const result = bfsShortestPath(graph, 'A', 'D');
    expect(result).not.toBeNull();
    expect(result.distance).toBe(3);
    expect(result.path).toEqual(['A', 'B', 'C', 'D']);
  });

  test('finds path from E to D (distance 4)', () => {
    const result = bfsShortestPath(graph, 'E', 'D');
    expect(result).not.toBeNull();
    expect(result.distance).toBe(4);
    expect(result.path).toEqual(['E', 'A', 'B', 'C', 'D']);
  });

  test('returns null when no path exists (disconnected graph)', () => {
    const result = bfsShortestPath(graph, 'A', 'G');
    expect(result).toBeNull();
  });

  test('path from node to itself returns distance 0', () => {
    const result = bfsShortestPath(graph, 'A', 'A');
    expect(result.distance).toBe(0);
    expect(result.path).toEqual(['A']);
  });

  test('returns null for node not in graph', () => {
    const result = bfsShortestPath(graph, 'A', 'UNKNOWN');
    expect(result).toBeNull();
  });

  test('bfsDistances gives correct distances from source', () => {
    const distances = bfsDistances(graph, 'A');
    expect(distances.get('A')).toBe(0);
    expect(distances.get('B')).toBe(1);
    expect(distances.get('C')).toBe(2);
    expect(distances.get('D')).toBe(3);
    expect(distances.get('E')).toBe(1);
    expect(distances.get('F')).toBe(2);
    expect(distances.has('G')).toBe(false); // unreachable
  });
});

// ─── DFS Tests ────────────────────────────────────────────────────────────────

describe('DFS — Network Exploration', () => {
  let graph;
  beforeEach(() => { graph = buildTestGraph(); });

  test('dfsIterative finds all 6 nodes in component 1', () => {
    const visited = new Set();
    const comp = dfsIterative(graph, 'A', visited);
    expect(comp.sort()).toEqual(['A', 'B', 'C', 'D', 'E', 'F'].sort());
  });

  test('dfsIterative finds both nodes in component 2', () => {
    const visited = new Set();
    const comp = dfsIterative(graph, 'G', visited);
    expect(comp.sort()).toEqual(['G', 'H'].sort());
  });

  test('findConnectedComponents detects exactly 2 components', () => {
    const components = findConnectedComponents(graph);
    expect(components.length).toBe(2);
  });

  test('findConnectedComponents sorts by size (largest first)', () => {
    const components = findConnectedComponents(graph);
    expect(components[0].length).toBe(6);
    expect(components[1].length).toBe(2);
  });

  test('areConnected returns true for same component', () => {
    expect(areConnected(graph, 'A', 'D')).toBe(true);
    expect(areConnected(graph, 'A', 'F')).toBe(true);
  });

  test('areConnected returns false for different components', () => {
    expect(areConnected(graph, 'A', 'G')).toBe(false);
    expect(areConnected(graph, 'F', 'H')).toBe(false);
  });
});

// ─── Recommendations Tests ────────────────────────────────────────────────────

describe('peopleYouMayKnow — Mutual Friends Score', () => {
  let graph;
  beforeEach(() => {
    graph = new Graph();
    // u1 connected to u2, u3
    // u2 connected to u4, u5
    // u3 connected to u4
    // u4 should get score 2 (via u2 AND u3), u5 score 1 (via u2 only)
    ['u1','u2','u3','u4','u5'].forEach(id => graph.addVertex(id, { name: id }));
    graph.addEdge('u1', 'u2');
    graph.addEdge('u1', 'u3');
    graph.addEdge('u2', 'u4');
    graph.addEdge('u2', 'u5');
    graph.addEdge('u3', 'u4');
  });

  test('returns 2-hop candidates', () => {
    const recs = peopleYouMayKnow(graph, 'u1');
    const userIds = recs.map(r => r.userId);
    expect(userIds).toContain('u4');
    expect(userIds).toContain('u5');
  });

  test('scores by mutual connection count', () => {
    const recs = peopleYouMayKnow(graph, 'u1');
    const u4 = recs.find(r => r.userId === 'u4');
    const u5 = recs.find(r => r.userId === 'u5');
    expect(u4.score).toBe(2); // via u2 and u3
    expect(u5.score).toBe(1); // via u2 only
  });

  test('sorts by score descending (u4 before u5)', () => {
    const recs = peopleYouMayKnow(graph, 'u1');
    const u4idx = recs.findIndex(r => r.userId === 'u4');
    const u5idx = recs.findIndex(r => r.userId === 'u5');
    expect(u4idx).toBeLessThan(u5idx);
  });

  test('does not include self or direct connections', () => {
    const recs = peopleYouMayKnow(graph, 'u1');
    const userIds = recs.map(r => r.userId);
    expect(userIds).not.toContain('u1');
    expect(userIds).not.toContain('u2');
    expect(userIds).not.toContain('u3');
  });
});

describe('peopleLikeYou — Skill/Interest Similarity', () => {
  test('scores by skill overlap (weight 2) and interest overlap (weight 1)', () => {
    const current = { _id: 'u1', skills: ['React', 'Node.js', 'Python'], interests: ['AI/ML', 'Hackathons'] };
    const allUsers = [
      { _id: 'u2', skills: ['React', 'Node.js'], interests: ['Hackathons'] },   // 2×2 + 1×1 = 5
      { _id: 'u3', skills: ['Python'], interests: ['AI/ML', 'Research'] },       // 2×1 + 1×1 = 3
      { _id: 'u4', skills: ['Java'], interests: ['Gaming'] }                     // 0 → excluded
    ];
    const results = peopleLikeYou(current, allUsers, [], 10);
    expect(results.length).toBe(2);
    expect(results[0].userId).toBe('u2');
    expect(results[0].score).toBe(5);
    expect(results[1].userId).toBe('u3');
    expect(results[1].score).toBe(3);
  });

  test('excludes self and already-connected users', () => {
    const current = { _id: 'u1', skills: ['React'], interests: ['AI/ML'] };
    const allUsers = [
      { _id: 'u1', skills: ['React'], interests: ['AI/ML'] }, // self
      { _id: 'u2', skills: ['React'], interests: ['AI/ML'] }, // connected
      { _id: 'u3', skills: ['React'], interests: ['AI/ML'] }, // should appear
    ];
    const results = peopleLikeYou(current, allUsers, ['u2'], 10);
    expect(results.length).toBe(1);
    expect(results[0].userId).toBe('u3');
  });

  test('returns common skills and interests arrays', () => {
    const current = { _id: 'u1', skills: ['React', 'Python'], interests: ['AI/ML'] };
    const allUsers = [{ _id: 'u2', skills: ['React', 'Java'], interests: ['AI/ML', 'Gaming'] }];
    const results = peopleLikeYou(current, allUsers, [], 10);
    expect(results[0].commonSkills).toContain('react');
    expect(results[0].commonInterests).toContain('ai/ml');
  });
});

describe('skillBasedCollaborators — Skill Index Matching', () => {
  let graph;
  beforeEach(() => {
    graph = new Graph();
    ['requester', 'u2', 'u3', 'u4'].forEach(id => graph.addVertex(id, { name: id }));
    graph.addEdge('requester', 'u2');  // u2 is directly connected to requester
    // u3 is connected to u2 (mutual)
    graph.addEdge('u2', 'u3');
  });

  test('finds users matching required skills', () => {
    const allUsers = [
      { _id: 'u2', skills: ['Figma', 'UI/UX Design', 'React'] },
      { _id: 'u3', skills: ['Figma'] },
      { _id: 'u4', skills: ['Java', 'Spring Boot'] }
    ];
    const results = skillBasedCollaborators(['Figma', 'UI/UX Design'], allUsers, graph, 'requester', [], 10);
    const ids = results.map(r => r.userId);
    expect(ids).toContain('u2');
    expect(ids).toContain('u3');
    expect(ids).not.toContain('u4'); // no skill match
  });

  test('ranks by skill score × 3 + mutual score', () => {
    const allUsers = [
      { _id: 'u2', skills: ['Figma', 'UI/UX Design'] }, // 2 skills × 3 = 6, but directly connected (excluded from mutual)
      { _id: 'u3', skills: ['Figma', 'UI/UX Design'] }, // 2 skills × 3 = 6, +1 mutual = 7
      { _id: 'u4', skills: ['Figma'] }                  // 1 skill × 3 = 3
    ];
    const results = skillBasedCollaborators(['Figma', 'UI/UX Design'], allUsers, graph, 'requester', [], 10);
    expect(results[0].userId).toBe('u3'); // highest total score
  });

  test('does not include requester', () => {
    const allUsers = [{ _id: 'requester', skills: ['Figma'] }];
    const results = skillBasedCollaborators(['Figma'], allUsers, graph, 'requester', [], 10);
    expect(results.length).toBe(0);
  });
});
