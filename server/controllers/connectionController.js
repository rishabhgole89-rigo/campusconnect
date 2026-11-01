const Connection = require('../models/Connection');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

// Find any connection (in either direction) between two users
const findConnection = async (userA, userB) =>
  Connection.findOne({
    $or: [
      { sender: userA, receiver: userB },
      { sender: userB, receiver: userA }
    ]
  });

// POST /api/connections/request
exports.sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id.toString();

    if (senderId === receiverId) {
      return sendError(res, 'Cannot send connection request to yourself', 400, 'SELF_CONNECTION');
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) return sendError(res, 'User not found', 404, 'USER_NOT_FOUND');

    const existing = await findConnection(senderId, receiverId);
    if (existing) {
      if (existing.status === 'accepted') {
        return sendError(res, 'Already connected', 409, 'ALREADY_CONNECTED');
      }
      if (existing.status === 'pending') {
        return sendError(res, 'Request already pending', 409, 'REQUEST_PENDING');
      }
      // Re-send after rejection/cancellation
      existing.status = 'pending';
      existing.sender = senderId;
      existing.receiver = receiverId;
      await existing.save();
      return sendSuccess(res, { connection: existing }, 'Connection request sent');
    }

    const connection = await Connection.create({ sender: senderId, receiver: receiverId });
    return sendSuccess(res, { connection }, 'Connection request sent', 201);
  } catch (err) {
    if (err.code === 11000) return sendError(res, 'Connection already exists', 409, 'DUPLICATE');
    return sendError(res, err.message, 500);
  }
};

// POST /api/connections/:id/accept
exports.acceptRequest = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection) return sendError(res, 'Connection not found', 404);
    if (connection.receiver.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized', 403, 'FORBIDDEN');
    }
    if (connection.status !== 'pending') {
      return sendError(res, 'Request is not pending', 400, 'INVALID_STATE');
    }
    connection.status = 'accepted';
    await connection.save();
    return sendSuccess(res, { connection }, 'Connection accepted');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// POST /api/connections/:id/reject
exports.rejectRequest = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection) return sendError(res, 'Connection not found', 404);
    if (connection.receiver.toString() !== req.user._id.toString()) {
      return sendError(res, 'Not authorized', 403, 'FORBIDDEN');
    }
    connection.status = 'rejected';
    await connection.save();
    return sendSuccess(res, { connection }, 'Connection rejected');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// DELETE /api/connections/:id
exports.removeConnection = async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection) return sendError(res, 'Connection not found', 404);
    const uid = req.user._id.toString();
    if (connection.sender.toString() !== uid && connection.receiver.toString() !== uid) {
      return sendError(res, 'Not authorized', 403, 'FORBIDDEN');
    }
    await connection.deleteOne();
    return sendSuccess(res, {}, 'Connection removed');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// GET /api/connections
exports.getMyConnections = async (req, res) => {
  try {
    const userId = req.user._id;
    const connections = await Connection.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: 'accepted'
    }).populate('sender', 'name email branch year skills profileImage')
      .populate('receiver', 'name email branch year skills profileImage');

    const connectedUsers = connections.map(conn => {
      const otherUser = conn.sender._id.toString() === userId.toString()
        ? conn.receiver
        : conn.sender;
      return { connectionId: conn._id, user: otherUser, connectedAt: conn.updatedAt };
    });

    return sendSuccess(res, { connections: connectedUsers, total: connectedUsers.length }, 'Connections retrieved');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// GET /api/connections/pending
exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const [received, sent] = await Promise.all([
      Connection.find({ receiver: userId, status: 'pending' })
        .populate('sender', 'name email branch year skills profileImage'),
      Connection.find({ sender: userId, status: 'pending' })
        .populate('receiver', 'name email branch year skills profileImage')
    ]);
    return sendSuccess(res, { received, sent }, 'Pending requests retrieved');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// GET /api/connections/status/:otherId
exports.getConnectionStatus = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const otherId = req.params.otherId;
    const connection = await findConnection(userId, otherId);

    if (!connection) {
      return sendSuccess(res, { status: 'none', connection: null }, 'No connection');
    }

    let displayStatus = connection.status;
    if (connection.status === 'pending') {
      displayStatus = connection.sender.toString() === userId
        ? 'pending_sent'
        : 'pending_received';
    }

    return sendSuccess(res, { status: displayStatus, connection }, 'Status retrieved');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};

// GET /api/connections/mutual/:otherId
// Uses HashSet intersection — O(min(|setA|, |setB|))
exports.getMutualConnections = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const otherId = req.params.otherId;

    const getConnectionIds = async (uid) => {
      const conns = await Connection.find({
        $or: [{ sender: uid }, { receiver: uid }],
        status: 'accepted'
      });
      return new Set(conns.map(c =>
        c.sender.toString() === uid.toString() ? c.receiver.toString() : c.sender.toString()
      ));
    };

    const [setA, setB] = await Promise.all([
      getConnectionIds(userId),
      getConnectionIds(otherId)
    ]);

    // HashSet intersection
    const mutualIds = [];
    for (const id of setA) {
      if (setB.has(id)) mutualIds.push(id);
    }

    const mutualUsers = await User.find({ _id: { $in: mutualIds } })
      .select('name email branch year skills profileImage');

    return sendSuccess(res, {
      mutualConnections: mutualUsers,
      total: mutualUsers.length
    }, 'Mutual connections retrieved');
  } catch (err) {
    return sendError(res, err.message, 500);
  }
};
