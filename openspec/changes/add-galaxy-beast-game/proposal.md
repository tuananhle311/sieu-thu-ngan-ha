# Change: Add Galaxy Beast Board Game

## Why
Create a complete web-based digital adaptation of the "Siêu Thú Ngân Hà" (Galaxy Super Beast) board game. The game needs to support single-player mode with AI opponents and local multiplayer (2-6 players) with a 2D cartoon art style.

## What Changes
- **NEW** `game-core`: Core game engine with state management, turn system, and round progression
- **NEW** `game-entities`: Data models for characters (12 zodiac), monsters (38), treasure cards (48), event cards (22), and ancient super beasts (4)
- **NEW** `combat-system`: Dice-based combat resolution with power calculations
- **NEW** `card-system`: Card deck management, drawing, playing, and effect execution
- **NEW** `game-board`: Board layout with 5 small caves and 4 ancient beast caves
- **NEW** `player-actions`: Player turn actions (enter cave, capture monster, capture super beast, pass)
- **NEW** `ai-opponent`: AI logic for single-player mode
- **NEW** `game-ui`: UI components (main menu, game board, player panels, modals)

## Impact
- Affected specs: All new capabilities (no existing specs)
- Affected code: Entire `src/` directory will be created
- New dependencies: Vite (build tool), potentially Phaser.js or PixiJS for rendering

## Scope
This proposal covers the complete game implementation in phases:
1. **Phase 1**: Core engine + entities + basic board
2. **Phase 2**: Combat system + player actions
3. **Phase 3**: Full card system (treasures, events)
4. **Phase 4**: AI opponent
5. **Phase 5**: UI polish and animations

## Success Criteria
- [ ] Single-player game against AI is playable
- [ ] Local multiplayer (2-6 players) is playable
- [ ] All 12 character abilities work correctly
- [ ] All 38 monsters with 4 elements are implemented
- [ ] All 48 treasure cards function as specified
- [ ] All 22 event cards trigger correctly
- [ ] All 4 ancient super beasts can be captured
- [ ] Win/lose conditions are correctly evaluated
- [ ] 8-round game loop completes properly
