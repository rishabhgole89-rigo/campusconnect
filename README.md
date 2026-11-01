# Campus Connect 

> **College Professional Networking & Collaboration Platform**
> Built with MERN Stack + Graph Algorithms (BFS, DFS, HashMap/HashSet)

Campus Connect is a production-quality full-stack web application that helps college students **discover like-minded peers**, **find hackathon teammates**, **trace network connections**, and **explore campus communities** — all powered by real Data Structures and Algorithms.

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB (local, running on port 27017)
- npm

### 1. Install dependencies
```bash
# From project root
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment
`server/.env` is pre-configured for local MongoDB. If needed, edit:
```
MONGODB_URI=mongodb://localhost:27017/campus-connect
JWT_SECRET=campus_connect_super_secret_jwt_key_2024
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 3. Seed the database
```bash
cd server && npm run seed
```
This creates 25 fictional students, 34 connections, and 5 opportunities.

### 4. Start the backend
```bash
cd server && npm run dev
```

### 5. Start the frontend (new terminal)
```bash
cd client && npm run dev
```

Visit **http://localhost:5173**

### 6. Log in with demo account
```
Email:    rahul@campus.edu
Password: password123
```

---

## 🏗️ Architecture

```
campus-connect/
├── server/                    # Express.js backend (port 5000)
│   ├── algorithms/            # Pure JS DSA implementations
│   │   ├── Graph.js           # Adjacency list graph
│   │   ├── bfs.js             # BFS — shortest connection path
│   │   ├── dfs.js             # DFS — connected components
│   │   ├── recommendations.js # Mutual friends, similarity, collaborators
│   │   └── communityDetection.js
│   ├── controllers/           # Route handlers
│   ├── models/                # Mongoose schemas
│   ├── routes/                # Express routers
│   ├── services/graphService.js  # MongoDB → Graph builder
│   ├── seed/seedData.js       # 25 students + 34 connections
│   └── __tests__/algorithms.test.js  # 27 Jest tests
│
└── client/                    # React/Vite frontend (port 5173)
    └── src/
        ├── pages/             # 12 full pages
        ├── components/        # Reusable UI components
        ├── api/               # Axios + API functions
        └── context/AuthContext.jsx
```

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | ✓ | Get current user |
| GET | `/api/users` | ✓ | Search/filter users |
| GET | `/api/users/:id` | ✓ | Get user profile |
| PUT | `/api/users/:id` | ✓ | Update profile |
| POST | `/api/connections/request` | ✓ | Send connection request |
| POST | `/api/connections/:id/accept` | ✓ | Accept request |
| POST | `/api/connections/:id/reject` | ✓ | Reject request |
| GET | `/api/connections` | ✓ | My connections |
| GET | `/api/connections/pending` | ✓ | Pending requests |
| GET | `/api/connections/status/:id` | ✓ | Connection status |
| GET | `/api/connections/mutual/:id` | ✓ | Mutual connections |
| GET | `/api/graph/shortest-path/:s/:t` | ✓ | **BFS shortest path** |
| GET | `/api/graph/communities` | ✓ | **DFS communities** |
| GET | `/api/graph/stats` | ✓ | Network statistics |
| GET | `/api/graph/network/:userId` | ✓ | Ego graph |
| GET | `/api/recommendations/people` | ✓ | Mutual friend recommendations |
| GET | `/api/recommendations/similar` | ✓ | Skill/interest similarity |
| GET | `/api/recommendations/collaborators?skills=...` | ✓ | Skill-based collaborators |
| CRUD | `/api/opportunities` | ✓ | Hackathons & projects |
| POST | `/api/opportunities/:id/interest` | ✓ | Express interest |

---

## 🧮 Data Structures & Algorithms

### 1. Graph — Adjacency List

**File:** [`server/algorithms/Graph.js`](server/algorithms/Graph.js)

```
Representation: Map<userId, Set<userId>>
Space:          O(V + E)  (sparse — ideal for social networks)
Add vertex:     O(1)
Add edge:       O(1)
Neighbor lookup: O(1) via HashSet
```

**Why adjacency list?** College networks are sparse. A student with 15 connections creates only 15 edges, not `(n-1)` like in a matrix. With 25 students, a matrix would be 25×25=625 cells vs ~34 adjacency entries.

---

### 2. BFS — Breadth-First Search

**File:** [`server/algorithms/bfs.js`](server/algorithms/bfs.js)

**Use case:** "How is Student A connected to Student B? Find the shortest chain."

```
Data structures: Queue (FIFO), Visited Set, Parent Map
Time:   O(V + E)
Space:  O(V)

Why BFS (not DFS)?
BFS explores all 1-hop neighbors before 2-hop, guaranteeing
the FIRST time we reach the target is via the SHORTEST path.
DFS would find A path but not necessarily the shortest one.
```

**Example path:** Rahul → Priya → Karan → Meera (3 hops)

---

### 3. DFS — Depth-First Search (Iterative, Stack-based)

**File:** [`server/algorithms/dfs.js`](server/algorithms/dfs.js)

**Use case:** "Detect network communities — groups of mutually reachable students."

```
Data structures: Explicit Stack (avoids JS call stack overflow), Visited Set
Time:   O(V + E)
Space:  O(V)

Algorithm:
  For each unvisited vertex, run DFS — it visits all nodes in
  that connected component. Repeat for all unvisited vertices.
  Result: list of components sorted by size.

Components in seed data:
  Component 1: 22 students (main campus network)
  Component 2: 3 students  (Suresh, Ravi, Shreya — isolated cluster)
```

---

### 4. HashMap / HashSet — Mutual Connections & Skill Index

**Files:** [`server/algorithms/recommendations.js`](server/algorithms/recommendations.js), [`server/controllers/connectionController.js`](server/controllers/connectionController.js)

```
HashSet intersection for mutual connections:
  setA = connections of User A  (HashSet for O(1) lookup)
  setB = connections of User B
  mutual = elements in setA that exist in setB
  Time: O(min(|setA|, |setB|))

HashMap (inverted index) for skill-based collaborators:
  index = Map<skill, Set<userId>>
  Built once: O(users × avg_skills)
  Lookup per skill: O(1)
```

---

### 5. Recommendation Algorithms

| Function | Algorithm | Complexity |
|----------|-----------|------------|
| `peopleYouMayKnow` | 2-hop BFS neighbor scoring | O(degree × avg_degree) |
| `peopleLikeYou` | Set intersection on skills+interests | O(users × avg_skills) |
| `skillBasedCollaborators` | HashMap skill index + network bonus | O(skills + users) |

Scoring:
- `peopleLikeYou`: skill match × 2 + interest match × 1
- `skillBasedCollaborators`: skill matches × 3 + mutual connections

---

## 🧪 Running Tests

```bash
cd server
npm test
```

**27 tests** covering:
- Graph: vertex, edge, degree, stats
- BFS: adjacent nodes, multi-hop paths, disconnected graph, path reconstruction
- DFS: component detection, connectivity check, isolated components
- Recommendations: mutual friend scoring, skill similarity, collaborator ranking

---

## 🌱 Seed Data

The seed script creates:

| Data | Count |
|------|-------|
| Students | 25 |
| Accepted connections | 34 |
| Network components | 2 |
| Opportunities | 5 |

**Connection topology:**
- Main component (22 students): Dense sub-clusters around Rahul, Priya, Aman, Neha, Rohan, and Akash/Ritika
- Isolated component (3 students): Suresh, Ravi, Shreya — not reachable from the main network

**Interesting BFS paths to try:**
- `rahul@campus.edu → meera@campus.edu` (3 hops: Rahul → Aman → Neha → Meera)
- `rahul@campus.edu → ritika@campus.edu` (2 hops: Rahul → Priya → Ritika)
- `rahul@campus.edu → dhruv@campus.edu` (no path — different component!)

---

## 🎨 Frontend Pages

| Route | Page | Feature |
|-------|------|---------|
| `/` | Landing | Marketing, feature overview, DSA showcase |
| `/login` | Login | JWT auth |
| `/register` | Register | New account |
| `/dashboard` | Dashboard | Stats, recommendations preview, quick actions |
| `/discover` | Discover | Search + filter all students |
| `/profile/:id` | Profile | Full student profile, mutual connections |
| `/profile/:id/edit` | Edit Profile | Tag-based skill/interest editor |
| `/network` | My Network | Connections, pending requests |
| `/recommendations` | Recommendations | People/Similar/Collaborators (3 algorithms) |
| `/connection-finder` | BFS Finder | Visual shortest path display |
| `/communities` | Communities | DFS-detected network groups |
| `/opportunities` | Opportunities | Hackathon/project board |
| `/opportunities/:id` | Opp Detail | Express interest, view team |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Frontend | React 18, Vite |
| Styling | Tailwind CSS |
| Auth | JWT (jsonwebtoken), bcryptjs |
| HTTP Client | Axios |
| UI Components | Lucide React icons |
| Notifications | React Hot Toast |
| Testing | Jest |

---

## 👥 Test Accounts

All accounts use password: `password123`

| Email | Name | Branch | Year |
|-------|------|--------|------|
| `rahul@campus.edu` | Rahul Sharma | Computer Science | 3 |
| `priya@campus.edu` | Priya Verma | Computer Science | 3 |
| `neha@campus.edu` | Neha Singh | Information Technology | 4 |
| `aman@campus.edu` | Aman Gupta | Computer Science | 2 |
| `ritika@campus.edu` | Ritika Bose | Computer Science | 3 |

---

*Campus Connect — Built with ❤️ using MERN Stack + Graph Algorithms*
