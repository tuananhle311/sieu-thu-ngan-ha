/**
 * Multiplayer WebSocket Server
 * Handles game rooms and state synchronization between players
 */

import { WebSocketServer } from 'ws'
import { createServer } from 'http'

const PORT = 3001

// Game rooms storage
const rooms = new Map()

// Generate random room code
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Create HTTP server
const server = createServer()
const wss = new WebSocketServer({ server })

console.log(`Multiplayer server starting on port ${PORT}...`)

wss.on('connection', (ws) => {
  console.log('New client connected')

  ws.playerId = null
  ws.roomCode = null

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data)
      handleMessage(ws, message)
    } catch (e) {
      console.error('Invalid message:', e)
    }
  })

  ws.on('close', () => {
    console.log('Client disconnected')
    handleDisconnect(ws)
  })

  // Send welcome message
  ws.send(JSON.stringify({ type: 'connected', message: 'Connected to server' }))
})

function handleMessage(ws, message) {
  console.log('Received:', message.type)

  switch (message.type) {
    case 'create_room':
      createRoom(ws, message)
      break
    case 'join_room':
      joinRoom(ws, message)
      break
    case 'leave_room':
      leaveRoom(ws)
      break
    case 'start_game':
      startGame(ws, message)
      break
    case 'game_action':
      handleGameAction(ws, message)
      break
    case 'sync_state':
      syncState(ws, message)
      break
    default:
      console.log('Unknown message type:', message.type)
  }
}

function createRoom(ws, message) {
  const roomCode = generateRoomCode()
  const playerName = message.playerName || 'Player 1'

  const room = {
    code: roomCode,
    host: ws,
    players: [{
      id: 1,
      name: playerName,
      ws: ws,
      isReady: false,
      characterId: null
    }],
    gameState: null,
    started: false,
    maxPlayers: message.maxPlayers || 4
  }

  rooms.set(roomCode, room)
  ws.playerId = 1
  ws.roomCode = roomCode

  ws.send(JSON.stringify({
    type: 'room_created',
    roomCode: roomCode,
    playerId: 1,
    players: room.players.map(p => ({ id: p.id, name: p.name, isReady: p.isReady }))
  }))

  console.log(`Room ${roomCode} created by ${playerName}`)
}

function joinRoom(ws, message) {
  const roomCode = message.roomCode?.toUpperCase()
  const playerName = message.playerName || `Player ${Math.floor(Math.random() * 1000)}`

  if (!roomCode) {
    ws.send(JSON.stringify({ type: 'error', message: 'Room code required' }))
    return
  }

  const room = rooms.get(roomCode)
  if (!room) {
    ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }))
    return
  }

  if (room.started) {
    ws.send(JSON.stringify({ type: 'error', message: 'Game already started' }))
    return
  }

  if (room.players.length >= room.maxPlayers) {
    ws.send(JSON.stringify({ type: 'error', message: 'Room is full' }))
    return
  }

  const playerId = room.players.length + 1
  room.players.push({
    id: playerId,
    name: playerName,
    ws: ws,
    isReady: false,
    characterId: null
  })

  ws.playerId = playerId
  ws.roomCode = roomCode

  // Notify the joining player
  ws.send(JSON.stringify({
    type: 'room_joined',
    roomCode: roomCode,
    playerId: playerId,
    players: room.players.map(p => ({ id: p.id, name: p.name, isReady: p.isReady, characterId: p.characterId }))
  }))

  // Notify all other players
  broadcastToRoom(room, {
    type: 'player_joined',
    player: { id: playerId, name: playerName, isReady: false },
    players: room.players.map(p => ({ id: p.id, name: p.name, isReady: p.isReady, characterId: p.characterId }))
  }, ws)

  console.log(`${playerName} joined room ${roomCode}`)
}

function leaveRoom(ws) {
  if (!ws.roomCode) return

  const room = rooms.get(ws.roomCode)
  if (!room) return

  const playerIndex = room.players.findIndex(p => p.ws === ws)
  if (playerIndex === -1) return

  const player = room.players[playerIndex]
  room.players.splice(playerIndex, 1)

  // Notify other players
  broadcastToRoom(room, {
    type: 'player_left',
    playerId: player.id,
    players: room.players.map(p => ({ id: p.id, name: p.name, isReady: p.isReady }))
  })

  // If room is empty, delete it
  if (room.players.length === 0) {
    rooms.delete(ws.roomCode)
    console.log(`Room ${ws.roomCode} deleted (empty)`)
  } else if (room.host === ws) {
    // Transfer host to next player
    room.host = room.players[0].ws
    broadcastToRoom(room, { type: 'host_changed', newHostId: room.players[0].id })
  }

  ws.roomCode = null
  ws.playerId = null
}

function startGame(ws, message) {
  if (!ws.roomCode) return

  const room = rooms.get(ws.roomCode)
  if (!room) return

  if (room.host !== ws) {
    ws.send(JSON.stringify({ type: 'error', message: 'Only host can start game' }))
    return
  }

  if (room.players.length < 2) {
    ws.send(JSON.stringify({ type: 'error', message: 'Need at least 2 players' }))
    return
  }

  room.started = true
  room.gameState = message.initialState

  // Notify all players
  broadcastToRoom(room, {
    type: 'game_started',
    gameState: room.gameState,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      characterId: p.characterId
    }))
  })

  console.log(`Game started in room ${ws.roomCode}`)
}

function handleGameAction(ws, message) {
  if (!ws.roomCode) return

  const room = rooms.get(ws.roomCode)
  if (!room || !room.started) return

  // Broadcast action to all players (including sender for confirmation)
  broadcastToRoom(room, {
    type: 'game_action',
    playerId: ws.playerId,
    action: message.action,
    data: message.data
  })
}

function syncState(ws, message) {
  if (!ws.roomCode) return

  const room = rooms.get(ws.roomCode)
  if (!room) return

  // Only host can sync state
  if (room.host === ws) {
    room.gameState = message.gameState

    // Broadcast to all other players
    broadcastToRoom(room, {
      type: 'state_sync',
      gameState: message.gameState
    }, ws)
  }
}

function handleDisconnect(ws) {
  leaveRoom(ws)
}

function broadcastToRoom(room, message, exclude = null) {
  const data = JSON.stringify(message)
  room.players.forEach(player => {
    if (player.ws !== exclude && player.ws.readyState === 1) {
      player.ws.send(data)
    }
  })
}

// Start server
server.listen(PORT, () => {
  console.log(`Multiplayer server running on ws://localhost:${PORT}`)
})
