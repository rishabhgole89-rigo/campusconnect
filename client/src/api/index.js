import api from './axios';

// Auth
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Users
export const usersApi = {
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
};

// Connections
export const connectionsApi = {
  sendRequest: (receiverId) => api.post('/connections/request', { receiverId }),
  acceptRequest: (id) => api.post(`/connections/${id}/accept`),
  rejectRequest: (id) => api.post(`/connections/${id}/reject`),
  removeConnection: (id) => api.delete(`/connections/${id}`),
  getMyConnections: () => api.get('/connections'),
  getPendingRequests: () => api.get('/connections/pending'),
  getConnectionStatus: (otherId) => api.get(`/connections/status/${otherId}`),
  getMutualConnections: (otherId) => api.get(`/connections/mutual/${otherId}`),
};

// Graph
export const graphApi = {
  getEgoNetwork: (userId) => api.get(`/graph/network/${userId}`),
  getShortestPath: (source, target) => api.get(`/graph/shortest-path/${source}/${target}`),
  getCommunities: () => api.get('/graph/communities'),
  getNetworkStats: () => api.get('/graph/stats'),
};

// Recommendations
export const recommendationsApi = {
  getPeopleRecommendations: () => api.get('/recommendations/people'),
  getSimilarPeople: () => api.get('/recommendations/similar'),
  getCollaboratorRecommendations: (skills) =>
    api.get('/recommendations/collaborators', { params: { skills: skills.join(',') } }),
};

// Opportunities
export const opportunitiesApi = {
  create: (data) => api.post('/opportunities', data),
  getAll: (params) => api.get('/opportunities', { params }),
  getById: (id) => api.get(`/opportunities/${id}`),
  update: (id, data) => api.put(`/opportunities/${id}`, data),
  remove: (id) => api.delete(`/opportunities/${id}`),
  expressInterest: (id) => api.post(`/opportunities/${id}/interest`),
};
