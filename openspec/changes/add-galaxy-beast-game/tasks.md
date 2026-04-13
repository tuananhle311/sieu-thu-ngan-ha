# Tasks: Galaxy Beast Board Game Implementation

## Phase 1: Project Setup & Core Engine

### 1.1 Project Setup
- [x] 1.1.1 Initialize Vite project with vanilla JS
- [x] 1.1.2 Create folder structure (src/game, src/entities, src/systems, src/ui, src/data, src/utils)
- [x] 1.1.3 Setup HTML canvas element and basic CSS
- [x] 1.1.4 Create main.js entry point

### 1.2 Data Files
- [x] 1.2.1 Create characters.json with 12 zodiac characters and skills
- [x] 1.2.2 Create monsters.json with 38 monsters (element, power, reward)
- [x] 1.2.3 Create treasures.json with 48 treasure cards (type, effect)
- [x] 1.2.4 Create events.json with 22 event cards (type, effect)
- [x] 1.2.5 Create ancientBeasts.json with 4 super beasts (requirements, rewards)

### 1.3 Core Game Engine
- [x] 1.3.1 Implement GameState class with observer pattern
- [x] 1.3.2 Implement TurnManager for turn order and progression
- [x] 1.3.3 Implement PhaseManager for round phases (daily reward, event, player turns, day end)
- [x] 1.3.4 Implement GameEngine to coordinate all systems
- [ ] 1.3.5 Add unit tests for game state management

## Phase 2: Entities & Basic Systems

### 2.1 Entity Classes
- [x] 2.1.1 Implement Player class (resources, cards, monsters, score)
- [x] 2.1.2 Implement Character class (skill, timing, used status)
- [x] 2.1.3 Implement Monster class (element, power, reward)
- [x] 2.1.4 Implement TreasureCard class (type, effect)
- [x] 2.1.5 Implement EventCard class (type, effect)
- [x] 2.1.6 Implement AncientBeast class (requirements, rewards)
- [x] 2.1.7 Implement Cave class (cost, victory points, monster)
- [ ] 2.1.8 Add unit tests for entity classes

### 2.2 Utility Functions
- [x] 2.2.1 Implement dice.js (roll, rollMultiple)
- [x] 2.2.2 Implement shuffle.js (Fisher-Yates shuffle)
- [ ] 2.2.3 Implement random.js (seeded random for testing)

## Phase 3: Combat System

### 3.1 Combat Implementation
- [x] 3.1.1 Implement CombatSystem class
- [x] 3.1.2 Implement power calculation (player and monster)
- [x] 3.1.3 Implement combat resolution (win/lose logic)
- [x] 3.1.4 Implement reward distribution on win
- [x] 3.1.5 Add combat modifier hooks for cards/skills
- [ ] 3.1.6 Add unit tests for combat system

## Phase 4: Card System

### 4.1 Deck Management
- [x] 4.1.1 Implement CardSystem class
- [x] 4.1.2 Implement deck creation from JSON data
- [x] 4.1.3 Implement shuffle and draw operations
- [x] 4.1.4 Implement discard and reshuffle logic

### 4.2 Card Effects
- [x] 4.2.1 Implement effect handler system
- [x] 4.2.2 Implement dice modification effects (Bùa Số 1-6)
- [x] 4.2.3 Implement resource transfer effects (Găng Tay Đạo Chích, etc.)
- [x] 4.2.4 Implement blocking effects (Kính Cường Lực)
- [x] 4.2.5 Implement combat modifier effects (Kiếm, Khiên, Trượng)
- [x] 4.2.6 Implement all 48 treasure card effects
- [x] 4.2.7 Implement all 22 event card effects
- [ ] 4.2.8 Add unit tests for card effects

## Phase 5: Player Actions

### 5.1 Action Implementation
- [x] 5.1.1 Implement enter cave action (cost check, combat trigger)
- [x] 5.1.2 Implement capture beast action (monster check, trade, rewards)
- [x] 5.1.3 Implement pass action
- [x] 5.1.4 Implement use skill action (timing check, effect)
- [x] 5.1.5 Implement play card action (type check, effect execution)
- [ ] 5.1.6 Add unit tests for player actions

### 5.2 Character Skills
- [x] 5.2.1 Implement all 12 character skill effects
- [x] 5.2.2 Implement skill refresh mechanism (Sách Khai Sáng, Giếng Nước Mát Mẻ)
- [ ] 5.2.3 Add unit tests for character skills

## Phase 6: AI System

### 6.1 AI Core
- [x] 6.1.1 Implement AISystem class
- [x] 6.1.2 Implement cave evaluation scoring
- [x] 6.1.3 Implement win probability estimation
- [x] 6.1.4 Implement decision making for cave selection

### 6.2 AI Strategy
- [x] 6.2.1 Implement beast capture decision logic
- [x] 6.2.2 Implement treasure card usage logic
- [x] 6.2.3 Implement character skill usage logic
- [x] 6.2.4 Implement difficulty levels (easy, medium, hard weights)
- [ ] 6.2.5 Add unit tests for AI decisions

## Phase 7: UI Implementation

### 7.1 Core UI
- [x] 7.1.1 Implement SceneManager for scene transitions
- [x] 7.1.2 Implement Renderer for canvas drawing
- [x] 7.1.3 Implement InputHandler for click/touch events

### 7.2 Scenes
- [x] 7.2.1 Implement MainMenuScene
- [x] 7.2.2 Implement CharacterSelectScene
- [x] 7.2.3 Implement GameScene (board, caves, player panels)
- [x] 7.2.4 Implement GameOverScene

### 7.3 UI Components
- [x] 7.3.1 Implement cave rendering with monster display
- [x] 7.3.2 Implement player panel rendering (resources, cards)
- [x] 7.3.3 Implement combat modal with dice animation
- [x] 7.3.4 Implement event card display modal
- [x] 7.3.5 Implement card detail popup
- [x] 7.3.6 Implement turn action buttons
- [ ] 7.3.7 Implement notification system

## Phase 8: Assets

### 8.1 Placeholder Graphics
- [x] 8.1.1 Create game board background placeholder
- [ ] 8.1.2 Create character card placeholders (12)
- [ ] 8.1.3 Create monster card placeholders (38)
- [ ] 8.1.4 Create treasure card placeholders (48)
- [ ] 8.1.5 Create event card placeholders (22)
- [ ] 8.1.6 Create ancient beast placeholders (4)
- [x] 8.1.7 Create UI element placeholders (buttons, panels)
- [x] 8.1.8 Create dice sprites (6 faces)
- [ ] 8.1.9 Create chicken leg token sprite

## Phase 9: Integration & Polish

### 9.1 Integration
- [x] 9.1.1 Connect all systems in GameEngine
- [x] 9.1.2 Implement full game loop (8 rounds)
- [x] 9.1.3 Implement win/lose condition checking
- [x] 9.1.4 Integration testing for complete game flow

### 9.2 Polish
- [ ] 9.2.1 Add dice rolling animation
- [ ] 9.2.2 Add card flip animations
- [ ] 9.2.3 Add turn transition animations
- [ ] 9.2.4 Improve visual feedback for actions
- [ ] 9.2.5 Add sound effects (optional)
- [ ] 9.2.6 Responsive design for different screen sizes

### 9.3 Testing & Bug Fixes
- [x] 9.3.1 Full playthrough testing (single player)
- [x] 9.3.2 Full playthrough testing (local multiplayer)
- [ ] 9.3.3 Edge case testing (deck exhaustion, tie-breakers)
- [ ] 9.3.4 Bug fixes and refinements

## Phase 10: Online Multiplayer

### 10.1 Server Infrastructure
- [x] 10.1.1 Implement WebSocket server (server.js on port 3001)
- [x] 10.1.2 Implement room management (create, join, leave, delete)
- [x] 10.1.3 Implement player tracking within rooms
- [x] 10.1.4 Implement message broadcasting to room members

### 10.2 Client Network Layer
- [x] 10.2.1 Implement MultiplayerManager class with WebSocket connection
- [x] 10.2.2 Implement room operations (createRoom, joinRoom, leaveRoom)
- [x] 10.2.3 Implement event emitter pattern for callbacks
- [x] 10.2.4 Implement game action sending (sendAction)
- [x] 10.2.5 Implement state synchronization (syncState)
- [x] 10.2.6 Implement game start signaling (startGame)

### 10.3 Lobby System
- [x] 10.3.1 Implement LobbyScene UI (create/join room options)
- [x] 10.3.2 Implement room code input with paste support
- [x] 10.3.3 Implement copy room code functionality
- [x] 10.3.4 Implement player list display in lobby
- [x] 10.3.5 Implement host controls (start game button)
- [x] 10.3.6 Implement error handling for invalid room codes

### 10.4 Character Selection Sync
- [x] 10.4.1 Update CharacterSelectScene for multiplayer mode
- [x] 10.4.2 Implement character selection broadcasting
- [x] 10.4.3 Implement state sync for all player selections
- [x] 10.4.4 Implement game start transition (host triggers, others follow)
- [x] 10.4.5 Fix double scene initialization bug

### 10.5 Game Sync
- [x] 10.5.1 Update GameScene for multiplayer mode
- [x] 10.5.2 Implement isMyTurn() check for turn-based logic
- [x] 10.5.3 Implement action broadcasting with self-ignore pattern
- [x] 10.5.4 Sync cave click actions
- [x] 10.5.5 Sync pass turn actions
- [x] 10.5.6 Sync skill usage actions
- [x] 10.5.7 Sync card play actions
- [x] 10.5.8 Sync event continue actions
- [x] 10.5.9 Fix event popup loop bug (ignore own broadcasts)
- [x] 10.5.10 Update UI rendering for multiplayer (turn indicator, player info)

### 10.6 Multiplayer Testing
- [x] 10.6.1 Test room creation and joining
- [x] 10.6.2 Test character selection sync
- [x] 10.6.3 Test full multiplayer game playthrough

## Dependencies
- Phase 2 depends on Phase 1
- Phase 3 depends on Phase 2
- Phase 4 depends on Phase 2
- Phase 5 depends on Phase 3, 4
- Phase 6 depends on Phase 5
- Phase 7 depends on Phase 1, can parallel with Phase 3-6
- Phase 8 can parallel with any phase
- Phase 9 depends on all previous phases
- Phase 10 depends on Phase 7, 9 (requires working game UI and flow)

## Parallelizable Work
- Data files (1.2) can be done in parallel
- Entity classes (2.1) can be done in parallel
- Card effects (4.2.6, 4.2.7) can be done in parallel
- Character skills (5.2.1) can be done in parallel with card effects
- UI scenes (7.2) can be done in parallel
- Assets (Phase 8) can be done in parallel with development

## Summary

**Completed:** 92/106 tasks (87%)

| Phase | Completed | Total | Status |
|-------|-----------|-------|--------|
| Phase 1: Setup & Core | 8/9 | 89% | ✅ |
| Phase 2: Entities | 9/11 | 82% | ✅ |
| Phase 3: Combat | 5/6 | 83% | ✅ |
| Phase 4: Card System | 7/8 | 88% | ✅ |
| Phase 5: Player Actions | 6/8 | 75% | ✅ |
| Phase 6: AI System | 8/9 | 89% | ✅ |
| Phase 7: UI | 9/10 | 90% | ✅ |
| Phase 8: Assets | 3/9 | 33% | 🔄 |
| Phase 9: Integration | 6/10 | 60% | 🔄 |
| Phase 10: Online Multiplayer | 27/27 | 100% | ✅ |

**Remaining:** Unit tests, asset placeholders, animations, polish
