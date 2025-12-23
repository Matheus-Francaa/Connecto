import express from 'express';
const app = express();
import cors from 'cors';
import { Server } from 'socket.io';
import { config } from './config/env';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { handelStart, handelDisconnect, getType } from './lib';
import { GetTypesResult, room } from './types';

// Middleware
app.use(cors({
  origin: config.clientUrl,
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(config.port, () => {
  logger.info(`🚀 Server is running on port ${config.port}`);
  logger.info(`📡 Environment: ${config.nodeEnv}`);
  logger.info(`🔗 Client URL: ${config.clientUrl}`);
});

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    credentials: true
  }
});

let online: number = 0;
let roomArr: Array<room> = [];
let matches: Map<string, any> = new Map(); // matchId -> Match data
let pendingLikes: Map<string, Set<string>> = new Map(); // userId -> Set of userIds who liked them

io.on('connection', (socket) => {
  online++;
  io.emit('online', online);
  logger.info(`✅ User connected: ${socket.id} | Total online: ${online}`);

  // on start
  socket.on('start', (preferences, cb) => {
    try {
      // Handle both old format (cb only) and new format (preferences, cb)
      const userPreferences = typeof preferences === 'function' ? undefined : preferences;
      const callback = typeof preferences === 'function' ? preferences : cb;

      // Detailed logging for debugging
      logger.info(`🔍 User ${socket.id} starting connection:`);
      logger.info(`   Mode: ${userPreferences?.mode || 'casual'}`);
      logger.info(`   Gender: ${userPreferences?.gender || 'not specified'}`);
      logger.info(`   Looking for: ${userPreferences?.lookingFor || 'not specified'}`);
      logger.info(`   Interests: ${userPreferences?.interests?.join(', ') || 'none'}`);

      handelStart(roomArr, socket, callback, io, userPreferences);
    } catch (error) {
      logger.error('Error in start event:', error);
    }
  })

  // On disconnection
  socket.on('disconnect', () => {
    online--;
    io.emit('online', online);
    logger.info(`❌ User disconnected: ${socket.id} | Total online: ${online}`);
    try {
      handelDisconnect(socket.id, roomArr, io);
    } catch (error) {
      logger.error('Error in disconnect event:', error);
    }
  });




  /// ------- logic for webrtc connection ------

  // on ice send
  socket.on('ice:send', ({ candidate }) => {
    try {
      let type: GetTypesResult = getType(socket.id, roomArr);
      if (type) {
        if (type?.type == 'p1') {
          typeof (type?.p2id) == 'string'
            && io.to(type.p2id).emit('ice:reply', { candidate, from: socket.id });
        }
        else if (type?.type == 'p2') {
          typeof (type?.p1id) == 'string'
            && io.to(type.p1id).emit('ice:reply', { candidate, from: socket.id });
        }
      }
    } catch (error) {
      logger.error('Error sending ICE candidate:', error);
    }
  });

  // on sdp send
  socket.on('sdp:send', ({ sdp }) => {
    try {
      let type = getType(socket.id, roomArr);
      if (type) {
        if (type?.type == 'p1') {
          typeof (type?.p2id) == 'string'
            && io.to(type.p2id).emit('sdp:reply', { sdp, from: socket.id });
        }
        if (type?.type == 'p2') {
          typeof (type?.p1id) == 'string'
            && io.to(type.p1id).emit('sdp:reply', { sdp, from: socket.id });
        }
      }
    } catch (error) {
      logger.error('Error sending SDP:', error);
    }
  })



  /// --------- Messages -----------

  // send message
  socket.on("send-message", (input, type, roomid) => {
    try {
      if (type == 'p1') type = 'You: ';
      else if (type == 'p2') type = 'Stranger: ';
      socket.to(roomid).emit('get-message', input, type);
      logger.debug(`💬 Message sent in room ${roomid}`);
    } catch (error) {
      logger.error('Error sending message:', error);
    }
  });



  /// --------- Match Requests -----------

  // Handle like button click
  socket.on('like:send', (data) => {
    try {
      const { to, roomId } = data;
      logger.info(`💗 Like sent from ${socket.id} to ${to}`);

      // Check if the other user already liked this user
      if (pendingLikes.has(to) && pendingLikes.get(to)?.has(socket.id)) {
        // MUTUAL MATCH!
        const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Get user preferences from room
        const room = roomArr.find(r => r.roomid === roomId);
        const user1Interests = room?.p1.id === socket.id ? room?.p1.preferences?.interests || [] : room?.p2.preferences?.interests || [];
        const user2Interests = room?.p1.id === to ? room?.p1.preferences?.interests || [] : room?.p2.preferences?.interests || [];

        const matchData = {
          matchId,
          user1: {
            socketId: socket.id,
            interests: user1Interests,
            lastSeen: Date.now()
          },
          user2: {
            socketId: to,
            interests: user2Interests,
            lastSeen: Date.now()
          },
          timestamp: Date.now(),
          messages: []
        };

        matches.set(matchId, matchData);

        // Remove from pending likes
        pendingLikes.get(to)?.delete(socket.id);
        if (pendingLikes.get(to)?.size === 0) {
          pendingLikes.delete(to);
        }

        // Notify both users
        io.to(socket.id).emit('match:mutual', {
          matchId,
          otherUser: matchData.user2
        });

        io.to(to).emit('match:mutual', {
          matchId,
          otherUser: matchData.user1
        });

        logger.info(`🎉 MUTUAL MATCH created: ${matchId} between ${socket.id} and ${to}`);
      } else {
        // Add to pending likes
        if (!pendingLikes.has(socket.id)) {
          pendingLikes.set(socket.id, new Set());
        }
        pendingLikes.get(socket.id)?.add(to);

        // Notify the other user they received a like
        io.to(to).emit('like:received', {
          from: socket.id
        });

        logger.info(`💗 Like stored as pending from ${socket.id} to ${to}`);
      }
    } catch (error) {
      logger.error('Error handling like:', error);
    }
  });

  // Handle chat messages between matches
  socket.on('match:message', (data) => {
    try {
      const { matchId, text } = data;
      const match = matches.get(matchId);

      if (!match) {
        logger.error(`Match ${matchId} not found`);
        return;
      }

      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const message = {
        id: messageId,
        matchId,
        senderId: socket.id,
        text,
        timestamp: Date.now(),
        read: false
      };

      match.messages.push(message);

      // Determine the other user
      const otherUserId = match.user1.socketId === socket.id ? match.user2.socketId : match.user1.socketId;

      // Send to the other user
      io.to(otherUserId).emit('match:message', {
        matchId,
        message
      });

      logger.info(`💬 Match message sent in ${matchId} from ${socket.id} to ${otherUserId}`);
    } catch (error) {
      logger.error('Error handling match message:', error);
    }
  });

  // Unmatch/desfazer match
  socket.on('match:unmatch', (data) => {
    try {
      const { matchId } = data;
      const match = matches.get(matchId);

      if (!match) {
        logger.error(`Match ${matchId} not found for unmatch`);
        return;
      }

      // Verify if the user is part of this match
      if (match.user1.socketId !== socket.id && match.user2.socketId !== socket.id) {
        logger.error(`User ${socket.id} is not part of match ${matchId}`);
        return;
      }

      // Determine the other user
      const otherUserId = match.user1.socketId === socket.id ? match.user2.socketId : match.user1.socketId;

      // Remove the match
      matches.delete(matchId);

      // Notify both users
      socket.emit('match:unmatched', { matchId });
      io.to(otherUserId).emit('match:unmatched', { matchId });

      logger.info(`💔 Match ${matchId} unmatched by ${socket.id}`);
    } catch (error) {
      logger.error('Error handling unmatch:', error);
    }
  });

  // Get user's matches
  socket.on('matches:get', (callback) => {
    try {
      const userMatches: any[] = [];

      matches.forEach((match, matchId) => {
        if (match.user1.socketId === socket.id || match.user2.socketId === socket.id) {
          const otherUser = match.user1.socketId === socket.id ? match.user2 : match.user1;
          const unreadCount = match.messages.filter(
            (msg: any) => msg.senderId !== socket.id && !msg.read
          ).length;

          userMatches.push({
            matchId,
            otherUser,
            messages: match.messages,
            unreadCount
          });
        }
      });

      callback(userMatches);
      logger.info(`📋 Sent ${userMatches.length} matches to ${socket.id}`);
    } catch (error) {
      logger.error('Error getting matches:', error);
      callback([]);
    }
  });

  // Mark messages as read
  socket.on('match:read', (data) => {
    try {
      const { matchId } = data;
      const match = matches.get(matchId);

      if (!match) {
        logger.error(`Match ${matchId} not found for read`);
        return;
      }

      // Verify if the user is part of this match
      if (match.user1.socketId !== socket.id && match.user2.socketId !== socket.id) {
        logger.error(`User ${socket.id} is not part of match ${matchId}`);
        return;
      }

      // Mark all messages from the other user as read
      let markedCount = 0;
      match.messages.forEach((msg: any) => {
        if (msg.senderId !== socket.id && !msg.read) {
          msg.read = true;
          markedCount++;
        }
      });

      // Notify the other user that messages were read
      const otherUserId = match.user1.socketId === socket.id ? match.user2.socketId : match.user1.socketId;
      io.to(otherUserId).emit('match:messages_read', { matchId });

      logger.info(`✓ Marked ${markedCount} messages as read in match ${matchId}`);
    } catch (error) {
      logger.error('Error marking messages as read:', error);
    }
  });

  // Mark messages as read
  socket.on('match:read', (data) => {
    try {
      const { matchId } = data;
      const match = matches.get(matchId);

      if (match) {
        match.messages.forEach((msg: any) => {
          if (msg.senderId !== socket.id) {
            msg.read = true;
          }
        });
        logger.info(`✓ Messages marked as read in ${matchId} by ${socket.id}`);
      }
    } catch (error) {
      logger.error('Error marking messages as read:', error);
    }
  });

  // Handle match request
  socket.on('match:request', (data) => {
    try {
      const { to, contactType, contactValue, userPreferences } = data;
      logger.info(`💌 Match request from ${socket.id} to ${to}`);

      io.to(to).emit('match:request', {
        from: socket.id,
        contactType,
        contactValue,
        userPreferences
      });
    } catch (error) {
      logger.error('Error handling match request:', error);
    }
  });

  // Handle match acceptance
  socket.on('match:accept', (data) => {
    try {
      const { to, contactType, contactValue } = data;
      logger.info(`✅ Match accepted from ${socket.id} to ${to}`);

      io.to(to).emit('match:accepted', {
        contactType,
        contactValue
      });
    } catch (error) {
      logger.error('Error handling match acceptance:', error);
    }
  });

  // Handle match rejection
  socket.on('match:reject', (data) => {
    try {
      const { to } = data;
      logger.info(`❌ Match rejected from ${socket.id} to ${to}`);

      io.to(to).emit('match:rejected');
    } catch (error) {
      logger.error('Error handling match rejection:', error);
    }
  });

});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, closing server gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, closing server gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
