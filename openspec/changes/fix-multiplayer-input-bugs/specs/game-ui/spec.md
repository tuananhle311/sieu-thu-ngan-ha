# Game UI Spec Delta

## MODIFIED Requirements

### Requirement: Overlay Input Blocking
The system SHALL prevent input to underlying UI elements when overlays are displayed.

Overlays that block input SHALL include:
- Card panel overlay
- Monster panel overlay
- Beast capture overlay
- Skill prompt overlay
- Combat overlay
- Event overlay

#### Scenario: Combat overlay blocks cave clicks
- **WHEN** combat overlay is displayed
- **THEN** cave click regions SHALL NOT be registered
- **AND** only combat-related buttons SHALL be clickable

#### Scenario: Event overlay blocks cave clicks
- **WHEN** event overlay is displayed
- **THEN** cave click regions SHALL NOT be registered
- **AND** only event-related buttons SHALL be clickable

### Requirement: Turn-Based Input Control
The system SHALL control input based on current player's turn in multiplayer mode.

#### Scenario: View buttons always available
- **WHEN** player is in multiplayer game
- **THEN** view buttons (cards, monsters) SHALL always be clickable
- **AND** player can view their own cards and captured monsters at any time

#### Scenario: Action buttons restricted to current turn
- **WHEN** it is NOT the player's turn in multiplayer
- **THEN** action buttons (skill, pass) SHALL be disabled
- **AND** cave selection SHALL be disabled

#### Scenario: Hover feedback always visible
- **WHEN** player hovers over caves during PLAYER_TURNS phase
- **THEN** hover visual feedback SHALL be shown regardless of whose turn it is
- **AND** click action SHALL only work when it is the player's turn

### Requirement: Multiplayer Turn Synchronization
The system SHALL synchronize turn order across all connected clients.

#### Scenario: First player determined by host
- **WHEN** host starts multiplayer game
- **THEN** host SHALL determine first player index via dice roll
- **AND** first player index SHALL be sent to all other players

#### Scenario: Non-host players receive turn order
- **WHEN** non-host player receives game start signal
- **THEN** player SHALL use the synced first player index
- **AND** player SHALL NOT roll their own dice for turn order

#### Scenario: Turn indicator displays correctly
- **WHEN** player views game during PLAYER_TURNS phase
- **THEN** header SHALL display current turn status
- **AND** "LƯỢT CỦA BẠN" shown when it is player's turn
- **AND** "Chờ [player name]" shown when waiting for other player
