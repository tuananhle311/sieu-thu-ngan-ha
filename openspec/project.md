# Project Context

## Purpose
**Siêu Thú Ngân Hà** (Galaxy Super Beast) - A web-based digital board game adaptation.

### Goals
- Convert the physical board game "Lớp học Mật ngữ Siêu Thú Ngân Hà" into a web game
- Support Single Player mode with AI opponents
- Support Local Multiplayer (2-6 players, hot-seat)
- Create an engaging 2D cartoon visual experience

### Game Overview
Players take on the role of 12 zodiac warriors who must capture monsters and Ancient Super Beasts within 8 rounds to save the galaxy. The game features:
- 12 unique characters with special abilities
- 38 monster cards across 4 elements (Fire, Water, Earth, Air)
- 4 Ancient Super Beasts to capture
- 48 treasure cards and 22 event cards
- Dice-based combat system

## Tech Stack
- **Platform**: Web Browser
- **Language**: JavaScript (ES6+)
- **Framework**: Vanilla JS or lightweight framework (Phaser.js / PixiJS for rendering)
- **Rendering**: HTML5 Canvas
- **State Management**: Custom game state manager or Zustand
- **Build Tool**: Vite
- **Testing**: Jest / Vitest
- **Art Style**: 2D Cartoon

## Project Conventions

### Code Style
- Use ES6+ features (const/let, arrow functions, destructuring, modules)
- File naming: `kebab-case.js` for files, `PascalCase` for classes
- Function naming: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Use JSDoc comments for public functions
- Max line length: 100 characters
- Indentation: 2 spaces

### Architecture Patterns
```
src/
├── assets/           # Images, sounds, fonts
├── components/       # UI components
├── core/             # Core game engine
│   ├── GameState.js  # Main game state manager
│   ├── TurnManager.js
│   ├── CombatSystem.js
│   └── DiceSystem.js
├── entities/         # Game entities
│   ├── Player.js
│   ├── Character.js
│   ├── Monster.js
│   ├── TreasureCard.js
│   └── EventCard.js
├── ai/               # AI opponent logic
│   └── AIPlayer.js
├── data/             # Static game data (JSON)
│   ├── characters.json
│   ├── monsters.json
│   ├── treasures.json
│   └── events.json
├── scenes/           # Game scenes/screens
│   ├── MainMenu.js
│   ├── CharacterSelect.js
│   ├── GameBoard.js
│   └── GameOver.js
├── utils/            # Utility functions
└── main.js           # Entry point
```

**Patterns Used:**
- State Machine for game flow
- Observer pattern for UI updates
- Factory pattern for card/entity creation
- Strategy pattern for AI behaviors

### Testing Strategy
- Unit tests for core game logic (combat calculations, turn order, win conditions)
- Unit tests for AI decision making
- Integration tests for game flow
- Manual testing for UI/UX

### Git Workflow
- **Main branch**: `main` - stable, deployable code
- **Development branch**: `dev` - integration branch
- **Feature branches**: `feature/feature-name`
- **Bugfix branches**: `fix/bug-description`

**Commit Convention:**
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Example: feat(combat): add dice rolling animation
```

## Domain Context

### Game Terminology
| Term | Vietnamese | Description |
|------|------------|-------------|
| Chicken Leg | Đùi gà | Currency to enter caves |
| Victory Points | Điểm chiến công | Score to win the game |
| Treasure Card | Thẻ bảo bối | Power-up cards |
| Event Card | Thẻ sự kiện | Random events each round |
| Ancient Super Beast | Siêu Thú Cổ Đại | Boss monsters at 4 corners |
| Cave | Hang | Location to battle monsters |

### Elements (4 types)
| Element | Vietnamese | Super Beast | Reward |
|---------|------------|-------------|--------|
| Fire | Lửa | Cáo Lửa 9 Đuôi | +1 Power |
| Water | Nước | Bạch Tuộc Bất Mãn | +1 Treasure |
| Earth | Đất | Người Đá Yêu Cây | +1 Chicken Leg |
| Air | Khí | Vẹt 4 Chân | +1 Victory Point |

### Game Flow
1. **Setup**: Choose characters, deal starting resources
2. **Round Start**: Daily rewards (skip day 1)
3. **Event Phase**: Draw and apply event card
4. **Player Turns**: Each player takes action (clockwise)
5. **Round End**: Move to next day
6. **Game End**: After 8 rounds, highest score wins

### Combat Formula
```
Player Power = Dice Roll + Treasure Bonuses + Character Skill
Monster Power = Dice Roll + Monster Base Power
Result: Player >= Monster → Win
```

## Important Constraints

### Technical Constraints
- Must work on modern browsers (Chrome, Firefox, Safari, Edge)
- No backend required for MVP (local storage for save/load)
- Assets must be lightweight (target < 10MB total)
- Responsive design for different screen sizes

### Game Balance Constraints
- Follow original board game rules exactly
- AI must not cheat (no hidden information access)
- Random elements must use fair RNG

### Timeline Constraints
- Phase 1 (Core): Game state, turns, basic combat
- Phase 2 (Gameplay): Full card system, all characters
- Phase 3 (AI): Single player with AI
- Phase 4 (Polish): Animations, sounds, UX
- Phase 5 (Future): Online multiplayer

## External Dependencies

### Libraries (Potential)
| Library | Purpose | Required |
|---------|---------|----------|
| Phaser.js / PixiJS | Game rendering | Optional |
| Howler.js | Audio playback | Optional |
| Zustand | State management | Optional |
| Vite | Build tool | Recommended |

### Assets
- All graphics: Self-created placeholder → Replace with final art
- Sound effects: Free assets or self-created
- Fonts: Web-safe or Google Fonts

### Data Source
- Game rules and data from: https://lophocmatngu.wiki/Siêu_Thú_Ngân_Hà_(boardgame)
- Detailed game data stored in `user-provide/game.md`
