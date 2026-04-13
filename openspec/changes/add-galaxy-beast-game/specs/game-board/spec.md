# Game Board Specification

## ADDED Requirements

### Requirement: Board Layout
The system SHALL display a game board with caves and score tracking.

#### Scenario: Board contains small caves
- **WHEN** the board is rendered
- **THEN** 5 small caves are displayed, each with its cost (1-5 chicken legs) and victory point value (1-5)

#### Scenario: Board contains ancient beast caves
- **WHEN** the board is rendered
- **THEN** 4 ancient beast caves are displayed at the corners, each associated with an element

#### Scenario: Board shows score track
- **WHEN** the board is rendered
- **THEN** a victory point track is displayed showing all players' current scores

### Requirement: Cave State Display
The system SHALL display the current state of each cave.

#### Scenario: Small cave shows monster
- **GIVEN** a small cave with a monster
- **WHEN** the cave is rendered
- **THEN** the cave displays: entry cost, victory points, and the current monster card (element, name, power)

#### Scenario: Ancient cave shows requirements
- **GIVEN** an ancient beast cave
- **WHEN** the cave is rendered
- **THEN** the cave displays: element requirement (2 same + 1 any), the ancient beast figure, and capture rewards

#### Scenario: Empty cave indicator
- **GIVEN** a cave without a monster (rare edge case)
- **WHEN** the cave is rendered
- **THEN** the cave shows an empty state until a new monster is placed

### Requirement: Player Token Tracking
The system SHALL track player positions on the score track.

#### Scenario: Update player score position
- **WHEN** a player's victory points change
- **THEN** the player's token is moved to the corresponding position on the score track

#### Scenario: Multiple players same score
- **WHEN** multiple players have the same victory point total
- **THEN** their tokens are displayed stacked or offset to show all players at that position

### Requirement: Day Counter Display
The system SHALL display the current day/round.

#### Scenario: Show current day
- **WHEN** the board is rendered
- **THEN** the current day (1-8) is clearly displayed

#### Scenario: Day progression visual
- **WHEN** the day advances
- **THEN** the day counter visual updates (e.g., hourglass moves to next position)

### Requirement: First Player Indicator
The system SHALL indicate which player goes first each round.

#### Scenario: Show first player marker
- **WHEN** the board is rendered during a round
- **THEN** a visual indicator shows which player is the first player this round

#### Scenario: First player rotation
- **WHEN** a new round begins
- **THEN** the first player marker moves to the next player clockwise
