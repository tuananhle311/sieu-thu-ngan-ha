# Siêu Thú Ngân Hà - Galaxy Super Beast

A multiplayer board game built with Vanilla JavaScript and Vite.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sieu-thu-ngan-ha
```

2. Install dependencies:
```bash
npm install
```

## Starting the Project

### Development Mode

**Option 1: Start both servers together (recommended for multiplayer)**
```bash
npm run dev:multi
```
This starts:
- Vite dev server at http://localhost:5173
- WebSocket multiplayer server at ws://localhost:3001

**Option 2: Start servers separately**

Frontend only:
```bash
npm run dev
```

Multiplayer server only:
```bash
npm run server
```

### Production

Build the project:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
sieu-thu-ngan-ha/
├── src/
│   ├── main.js              # Application entry point
│   ├── data/                # Game data (JSON)
│   │   ├── characters.json
│   │   ├── monsters.json
│   │   ├── treasures.json
│   │   ├── events.json
│   │   └── ancientBeasts.json
│   ├── entities/            # Game entities
│   │   ├── Player.js
│   │   └── Cave.js
│   ├── game/                # Core game logic
│   │   ├── GameState.js
│   │   ├── TurnManager.js
│   │   └── PhaseManager.js
│   ├── ui/                  # UI components
│   │   ├── Renderer.js
│   │   ├── InputHandler.js
│   │   └── scenes/
│   ├── utils/               # Utility functions
│   │   ├── dice.js
│   │   ├── shuffle.js
│   │   └── random.js
│   └── styles/
│       └── main.css
├── server.js                # WebSocket multiplayer server
├── index.html
├── package.json
└── vite.config.js
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run server` | Start WebSocket multiplayer server |
| `npm run dev:multi` | Start both servers concurrently |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Multiplayer

The game supports up to 4 players per room. The WebSocket server handles:
- Room creation and joining
- Player synchronization
- Real-time game state updates

Default ports:
- Frontend: `5173`
- WebSocket Server: `3001`
