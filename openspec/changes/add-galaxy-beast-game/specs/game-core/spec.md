# Game Core Specification

## ADDED Requirements

### Requirement: Game State Management
The system SHALL maintain a centralized game state that tracks all game data including current day, phase, players, board, and decks.

#### Scenario: Initialize new game
- **WHEN** a new game is started with player configuration
- **THEN** the game state is initialized with day 1, all decks shuffled, and players given starting resources (3 chicken legs, 3 treasure cards)

#### Scenario: State updates notify observers
- **WHEN** any game state property changes
- **THEN** all registered observers are notified of the change

### Requirement: Round Progression
The system SHALL progress through 8 rounds (days), with each round consisting of defined phases.

#### Scenario: Complete all 8 rounds
- **WHEN** the game progresses through rounds
- **THEN** the game ends after round 8 is completed

#### Scenario: Round phases execute in order
- **WHEN** a new round begins
- **THEN** phases execute in order: Daily Reward → Event → Player Turns → Day End

### Requirement: Phase Management
The system SHALL manage the execution of each phase within a round.

#### Scenario: Daily reward phase
- **WHEN** daily reward phase begins (except day 1)
- **THEN** each player receives 1 chicken leg and 1 treasure card

#### Scenario: Event phase
- **WHEN** event phase begins
- **THEN** the first player draws an event card and its effect is applied

#### Scenario: Player turns phase
- **WHEN** player turns phase begins
- **THEN** each player takes one turn in clockwise order starting from the first player

#### Scenario: Day end phase
- **WHEN** day end phase begins
- **THEN** the day counter increments and first player rotates clockwise

### Requirement: Turn Management
The system SHALL manage individual player turns within the player turns phase.

#### Scenario: Player takes turn
- **WHEN** it is a player's turn
- **THEN** the player may choose to: enter a cave, capture an ancient beast, or pass

#### Scenario: Turn order
- **WHEN** determining turn order
- **THEN** players take turns in clockwise order from the first player

### Requirement: Win/Lose Conditions
The system SHALL evaluate win and lose conditions at game end.

#### Scenario: Individual winner
- **WHEN** the game ends after 8 rounds AND at least one ancient beast was captured by any player
- **THEN** the player with the highest victory points wins

#### Scenario: Collective loss
- **WHEN** the game ends after 8 rounds AND no ancient beasts were captured by any player
- **THEN** all players lose (galaxy is destroyed)

#### Scenario: Tie breaker
- **WHEN** multiple players have the same highest victory points
- **THEN** the player with more captured monsters wins; if still tied, the player with more chicken legs wins
