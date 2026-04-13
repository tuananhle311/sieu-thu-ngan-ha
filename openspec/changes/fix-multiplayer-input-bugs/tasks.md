# Tasks: Fix Multiplayer Input Bugs

## 1. Fix Overlay Detection
- [x] 1.1 Update `hasOverlay()` to include `showingCombat` and `showingEvent`
- [x] 1.2 Prevent cave region registration when overlays are active

## 2. Fix Turn Synchronization
- [x] 2.1 Host sends `firstPlayerIndex` in game start message
- [x] 2.2 Non-host players use synced `firstPlayerIndex` instead of rolling own dice
- [x] 2.3 Override `currentPlayerIndex` in game state after initialization

## 3. Fix Input Region Handling
- [x] 3.1 Clear all input regions at start of each render frame
- [x] 3.2 Always register view buttons (cards/monsters) regardless of turn
- [x] 3.3 Only restrict action buttons (skill/pass) to current player's turn

## 4. Fix Hover Detection
- [x] 4.1 Remove turn check from hover detection (visual feedback only)
- [x] 4.2 Keep turn check only for actual click actions

## 5. Fix GameEngine Methods
- [x] 5.1 Fix `getCurrentPlayer()` calls to use `turnManager.getCurrentPlayer()`
