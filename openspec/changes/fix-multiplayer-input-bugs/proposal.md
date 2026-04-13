# Change: Fix Multiplayer Input and Turn Synchronization Bugs

## Why
Multiple bugs prevented proper gameplay in multiplayer mode:
1. Hover state getting stuck on caves
2. Turn detection not synchronized between clients
3. Combat overlay clicks blocked by underlying cave regions
4. View buttons (cards/monsters) disabled when not player's turn

## What Changes
- Fix `hasOverlay()` to include `showingCombat` and `showingEvent` states
- Sync `firstPlayerIndex` from host to other players when game starts
- Allow hover for visual feedback without turn restriction
- Always register view button (cards/monsters) click regions
- Clear input regions each frame to prevent stale callbacks

## Impact
- Affected specs: game-ui
- Affected code:
  - `src/ui/scenes/GameScene.js` - overlay detection, turn checks, button registration
  - `src/ui/scenes/CharacterSelectScene.js` - sync firstPlayerIndex on game start
  - `src/ui/InputHandler.js` - debug logging for click detection
  - `src/game/GameEngine.js` - fix getCurrentPlayer() calls
