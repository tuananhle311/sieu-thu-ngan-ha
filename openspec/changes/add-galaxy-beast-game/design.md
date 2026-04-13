# Design: Galaxy Beast Board Game Architecture

## Context
Building a digital board game adaptation for web browsers. The game is turn-based with 2-6 players, supports AI opponents, and involves complex card interactions and state management.

### Stakeholders
- Players (single-player and local multiplayer)
- Future: Online multiplayer users

### Constraints
- Web browser only (no native apps for now)
- Placeholder assets first, final art later
- No backend for MVP (all client-side)
- Must follow original board game rules exactly

## Goals / Non-Goals

### Goals
- Faithful digital adaptation of the board game rules
- Smooth turn-based gameplay experience
- AI that plays fairly (no cheating with hidden information)
- Clean, maintainable code architecture
- Responsive UI for different screen sizes

### Non-Goals
- Online multiplayer (future phase)
- Mobile app (web responsive is sufficient)
- Backend/database (local storage only for saves)
- Real-time animations (turn-based is fine)

## Decisions

### 1. Tech Stack
**Decision**: Vanilla JavaScript with Vite, HTML5 Canvas for rendering
**Rationale**:
- Keeps dependencies minimal
- Canvas provides good performance for 2D games
- Vite offers fast dev experience and simple build
**Alternatives considered**:
- Phaser.js: More features but heavier; can add later if needed
- React: Overkill for game rendering; DOM updates would be slower

### 2. State Management
**Decision**: Custom GameState class with Observer pattern
**Rationale**:
- Game state is well-defined and predictable
- Observer pattern allows UI to react to state changes
- No need for external state management library
**Structure**:
```javascript
GameState {
  currentDay: number (1-8)
  currentPhase: 'daily_reward' | 'event' | 'player_turns' | 'day_end'
  currentPlayerIndex: number
  players: Player[]
  board: Board
  decks: { monsters, treasures, events }
  ancientBeasts: AncientBeast[]
}
```

### 3. Entity System
**Decision**: Class-based entities with JSON data files
**Rationale**:
- Classes encapsulate behavior (e.g., Character.useSkill())
- JSON files store static data (names, stats, effects)
- Easy to modify/balance without code changes
**Structure**:
```
src/data/
  characters.json    # 12 zodiac characters
  monsters.json      # 38 monsters
  treasures.json     # 48 treasure cards
  events.json        # 22 event cards
  ancientBeasts.json # 4 super beasts
```

### 4. Combat Resolution
**Decision**: Synchronous resolution with event hooks
**Rationale**:
- Combat is deterministic once dice are rolled
- Event hooks allow treasure cards to modify results
- Easy to unit test
**Formula**:
```
playerPower = diceRoll + permanentPower + treasureBonus + skillBonus
monsterPower = diceRoll + monsterBasePower
result = playerPower >= monsterPower ? WIN : LOSE
```

### 5. Card Effect System
**Decision**: Effect objects with trigger conditions
**Rationale**:
- Cards have diverse effects (modify dice, steal resources, etc.)
- Trigger conditions determine when effects can activate
- Effect objects are composable and testable
**Structure**:
```javascript
TreasureCard {
  id, name, type: 'instant' | 'action'
  effect: {
    trigger: 'on_play' | 'on_combat' | 'on_opponent_action'
    action: 'modify_dice' | 'steal_resource' | 'block_effect' | ...
    params: { ... }
  }
}
```

### 6. AI Strategy
**Decision**: Rule-based AI with weighted scoring
**Rationale**:
- Board game has clear decision points
- Scoring heuristics can evaluate cave choices
- Easy to tune difficulty by adjusting weights
**Decision Points**:
1. Which cave to enter (cost vs. reward vs. win probability)
2. When to use treasure cards (resource optimization)
3. When to capture ancient beasts (timing for max points)
4. When to use character skill (strategic moments)

### 7. UI Architecture
**Decision**: Scene-based with Canvas rendering
**Rationale**:
- Clear separation between game states (menu, character select, game, end)
- Canvas allows efficient redraw of game board
- Event delegation for click handling
**Scenes**:
```
MainMenuScene → CharacterSelectScene → GameScene → GameOverScene
```

## Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Game Engine                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  GameState   │  │ TurnManager  │  │ PhaseManager │      │
│  │  (Observer)  │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│                        Systems                              │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │CombatSystem  │  │ CardSystem   │  │  AISystem    │      │
│  │ - rollDice() │  │ - draw()     │  │ - evaluate() │      │
│  │ - resolve()  │  │ - play()     │  │ - decide()   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
├─────────────────────────────────────────────────────────────┤
│                        Entities                             │
├─────────────────────────────────────────────────────────────┤
│  ┌────────┐ ┌─────────┐ ┌────────────┐ ┌───────────┐       │
│  │Player  │ │Character│ │ Monster    │ │TreasureCard│      │
│  │        │ │         │ │            │ │           │       │
│  └────────┘ └─────────┘ └────────────┘ └───────────┘       │
│  ┌────────┐ ┌─────────┐ ┌────────────┐                     │
│  │ Cave   │ │AncientBeast│ │EventCard │                    │
│  └────────┘ └─────────┘ └────────────┘                     │
├─────────────────────────────────────────────────────────────┤
│                        UI Layer                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ SceneManager │  │ Renderer     │  │ InputHandler │      │
│  │              │  │ (Canvas)     │  │ (Events)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
src/
├── main.js                 # Entry point
├── game/
│   ├── GameEngine.js       # Main game coordinator
│   ├── GameState.js        # State container + observer
│   ├── TurnManager.js      # Turn order and progression
│   └── PhaseManager.js     # Round phases (reward, event, turns, end)
├── systems/
│   ├── CombatSystem.js     # Dice rolling, power calculation, resolution
│   ├── CardSystem.js       # Deck management, draw, play, effects
│   └── AISystem.js         # AI decision making
├── entities/
│   ├── Player.js           # Player state (resources, cards, monsters)
│   ├── Character.js        # Zodiac character with skill
│   ├── Monster.js          # Monster card
│   ├── TreasureCard.js     # Treasure card with effect
│   ├── EventCard.js        # Event card with effect
│   ├── AncientBeast.js     # Super beast
│   └── Cave.js             # Cave on board
├── data/
│   ├── characters.json
│   ├── monsters.json
│   ├── treasures.json
│   ├── events.json
│   └── ancientBeasts.json
├── ui/
│   ├── SceneManager.js
│   ├── Renderer.js
│   ├── InputHandler.js
│   └── scenes/
│       ├── MainMenuScene.js
│       ├── CharacterSelectScene.js
│       ├── GameScene.js
│       └── GameOverScene.js
├── utils/
│   ├── dice.js             # Dice rolling utilities
│   ├── shuffle.js          # Array shuffling
│   └── random.js           # RNG utilities
└── assets/
    ├── images/
    └── audio/
```

## Risks / Trade-offs

### Risk: Complex Card Interactions
**Mitigation**:
- Implement effect system with clear triggers
- Comprehensive unit tests for each card
- State rollback for debugging

### Risk: AI Balance
**Mitigation**:
- Start with simple heuristics
- Log AI decisions for analysis
- Difficulty levels adjust weights

### Risk: Canvas Performance with Many Elements
**Mitigation**:
- Only redraw changed regions
- Cache static elements (board background)
- Sprite batching if needed

### Trade-off: Vanilla JS vs Framework
**Accepted**: More boilerplate but fewer dependencies and better understanding of code flow.

## Migration Plan
N/A - New project, no existing code to migrate.

## Open Questions
1. Should we use a game framework (Phaser.js) from the start for animations?
   - **Recommendation**: Start vanilla, add Phaser later if animation needs grow
2. How to handle save/load for interrupted games?
   - **Recommendation**: Serialize GameState to localStorage
3. Should character skills be hardcoded or data-driven?
   - **Recommendation**: Data-driven with effect handlers for flexibility
