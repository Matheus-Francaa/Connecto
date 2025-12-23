import { v4 as uuidv4 } from 'uuid';
import { GetTypesResult, room, UserPreferences } from './types';

/**
 * Calculate match score based on shared interests and preferences
 */
function calculateMatchScore(prefs1: UserPreferences | undefined, prefs2: UserPreferences): number {
  if (!prefs1 || !prefs2) return 0;

  // Mode must match
  if (prefs1.mode !== prefs2.mode) return 0;

  // CRITICAL: Gender compatibility validation (MUST match for connections mode)
  if (prefs1.mode === 'connections') {
    // User 1 is looking for a specific gender
    if (prefs1.lookingFor && prefs1.lookingFor !== 'any') {
      // User 2 must BE that gender
      if (!prefs2.gender || prefs2.gender !== prefs1.lookingFor) {
        console.log(`❌ Gender mismatch: User1 looking for ${prefs1.lookingFor}, but User2 is ${prefs2.gender || 'unspecified'}`);
        return 0; // No match - User 2 is not the gender User 1 is looking for
      }
    }

    // User 2 is looking for a specific gender
    if (prefs2.lookingFor && prefs2.lookingFor !== 'any') {
      // User 1 must BE that gender
      if (!prefs1.gender || prefs1.gender !== prefs2.lookingFor) {
        console.log(`❌ Gender mismatch: User2 looking for ${prefs2.lookingFor}, but User1 is ${prefs1.gender || 'unspecified'}`);
        return 0; // No match - User 1 is not the gender User 2 is looking for
      }
    }

    console.log(`✅ Gender compatibility passed!`);
  }

  let score = 0;

  // Interest overlap (most important)
  const sharedInterests = prefs1.interests.filter(interest =>
    prefs2.interests.includes(interest)
  );
  score += sharedInterests.length * 10;

  // Age compatibility (if specified)
  if (prefs1.ageRange && prefs2.ageRange) {
    const min1 = prefs1.ageRange.min;
    const max1 = prefs1.ageRange.max;
    const min2 = prefs2.ageRange.min;
    const max2 = prefs2.ageRange.max;
    if (!(max1 < min2 || max2 < min1)) {
      score += 5; // Overlapping age ranges
    }
  }

  // Gender preference matching (bonus points for mutual compatibility)
  if (prefs1.lookingFor && prefs2.gender && prefs1.lookingFor === prefs2.gender) {
    score += 3;
  }
  if (prefs2.lookingFor && prefs1.gender && prefs2.lookingFor === prefs1.gender) {
    score += 3;
  }

  console.log(`🎯 Final match score: ${score}`);
  return score;
}

export function handelStart(
  roomArr: Array<room>,
  socket: any,
  cb: Function,
  io: any,
  userPreferences?: UserPreferences
): void {

  // Check available rooms with optional matching
  let availableroom = checkAvailableRoom(userPreferences);
  if (availableroom.is) {
    socket.join(availableroom.roomid);
    cb('p2');
    closeRoom(availableroom.roomid, userPreferences);
    if (availableroom?.room) {
      io.to(availableroom.room.p1.id).emit('remote-socket', socket.id);
      socket.emit('remote-socket', availableroom.room.p1.id);
      socket.emit('roomid', availableroom.room.roomid);
    }
  }
  // if no available room, create one
  else {
    let roomid = uuidv4();
    socket.join(roomid);
    roomArr.push({
      roomid,
      isAvailable: true,
      p1: {
        id: socket.id,
        preferences: userPreferences,
      },
      p2: {
        id: null,
      }
    });
    cb('p1');
    socket.emit('roomid', roomid);
  }




  /**
   * 
   * @param roomid 
   * @desc search though roomArr and 
   * make isAvailable false, also set p2.id 
   * socket.id
   */
  function closeRoom(roomid: string, preferences?: UserPreferences): void {
    for (let i = 0; i < roomArr.length; i++) {
      if (roomArr[i].roomid == roomid) {
        roomArr[i].isAvailable = false;
        roomArr[i].p2.id = socket.id;
        roomArr[i].p2.preferences = preferences;
        break;
      }
    }
  }


  /**
   * Find best matching room based on user preferences
   * @returns Object {is, roomid, room}
   * is -> true if room is available
   * roomid -> id of the room, could be empty
   * room -> the roomArray, could be empty 
   */
  function checkAvailableRoom(preferences?: UserPreferences): { is: boolean, roomid: string, room: room | null } {
    // Check if user is already in a room
    for (let i = 0; i < roomArr.length; i++) {
      if (roomArr[i].p1.id == socket.id || roomArr[i].p2.id == socket.id) {
        return { is: false, roomid: "", room: null };
      }
    }

    // For connections mode, try to find best match
    if (preferences && preferences.mode === 'connections') {
      let bestMatch: { room: room, score: number } | null = null;

      for (let i = 0; i < roomArr.length; i++) {
        if (roomArr[i].isAvailable && roomArr[i].p1.preferences) {
          const score = calculateMatchScore(roomArr[i].p1.preferences, preferences);

          if (score > 0 && (!bestMatch || score > bestMatch.score)) {
            bestMatch = { room: roomArr[i], score };
          }
        }
      }

      if (bestMatch) {
        return { is: true, roomid: bestMatch.room.roomid, room: bestMatch.room };
      }
    }

    // For casual mode or no match found, use first available room
    for (let i = 0; i < roomArr.length; i++) {
      if (roomArr[i].isAvailable) {
        // In connections mode, only match with same mode
        if (preferences?.mode === 'connections' &&
          roomArr[i].p1.preferences?.mode !== 'connections') {
          continue;
        }
        return { is: true, roomid: roomArr[i].roomid, room: roomArr[i] };
      }
    }

    return { is: false, roomid: '', room: null };
  }
}

/**
 * @desc handels disconnceition event
 */
export function handelDisconnect(disconnectedId: string, roomArr: Array<room>, io: any) {
  for (let i = 0; i < roomArr.length; i++) {
    if (roomArr[i].p1.id == disconnectedId) {
      io.to(roomArr[i].p2.id).emit("disconnected");
      if (roomArr[i].p2.id) {
        roomArr[i].isAvailable = true;
        roomArr[i].p1.id = roomArr[i].p2.id;
        roomArr[i].p2.id = null;
      }
      else {
        roomArr.splice(i, 1);
      }
    } else if (roomArr[i].p2.id == disconnectedId) {
      io.to(roomArr[i].p1.id).emit("disconnected");
      if (roomArr[i].p1.id) {
        roomArr[i].isAvailable = true;
        roomArr[i].p2.id = null;
      }
      else {
        roomArr.splice(i, 1);
      }
    }
  }
}


// get type of person (p1 or p2)
export function getType(id: string, roomArr: Array<room>): GetTypesResult {
  for (let i = 0; i < roomArr.length; i++) {
    if (roomArr[i].p1.id == id) {
      return { type: 'p1', p2id: roomArr[i].p2.id };
    } else if (roomArr[i].p2.id == id) {
      return { type: 'p2', p1id: roomArr[i].p1.id };
    }
  }

  return false;
}