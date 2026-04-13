# Game Entities Specification

## ADDED Requirements

### Requirement: Character Entity
The system SHALL support 12 zodiac character entities, each with a unique special skill.

#### Scenario: Character has skill with timing
- **GIVEN** a character entity
- **WHEN** the character data is loaded
- **THEN** the character has a skill with name, timing type ("in_turn" or "anytime"), and effect description

#### Scenario: Character skill can be used once per refresh
- **GIVEN** a character with an unused skill
- **WHEN** the skill conditions are met and the player activates it
- **THEN** the skill is marked as used until refreshed

### Requirement: Monster Entity
The system SHALL support 38 monster entities across 4 elements (Fire, Water, Earth, Air).

#### Scenario: Monster has element and power
- **GIVEN** a monster entity
- **WHEN** the monster data is loaded
- **THEN** the monster has an element (fire/water/earth/air) and a power value (+2, +3, or +4)

#### Scenario: Monster has capture reward
- **GIVEN** a monster of a specific element
- **WHEN** the monster is captured
- **THEN** the player receives the element-based reward: Fire→+1 power, Water→+1 treasure, Earth→+1 chicken leg, Air→+1 victory point

### Requirement: Ancient Super Beast Entity
The system SHALL support 4 ancient super beast entities, one for each element.

#### Scenario: Super beast has capture requirements
- **GIVEN** an ancient super beast
- **WHEN** checking capture requirements
- **THEN** the beast requires 2 monsters of its element + 1 monster of any element

#### Scenario: Super beast provides rewards
- **GIVEN** an ancient super beast that is captured
- **WHEN** the capture is completed
- **THEN** the player receives: 3 victory points, immediate reward, and daily bonus

### Requirement: Treasure Card Entity
The system SHALL support 48 treasure card entities with instant or action types.

#### Scenario: Treasure card has type constraint
- **GIVEN** a treasure card
- **WHEN** checking if it can be played
- **THEN** instant (blue) cards can be played anytime; action (red) cards can only be played during the player's turn

#### Scenario: Treasure card has effect
- **GIVEN** a treasure card
- **WHEN** the card is played
- **THEN** its effect is executed (modify dice, steal resources, block effects, etc.)

### Requirement: Event Card Entity
The system SHALL support 22 event card entities with reward, penalty, or neutral types.

#### Scenario: Event card affects game state
- **GIVEN** an event card is drawn
- **WHEN** the event phase executes
- **THEN** the card's effect is applied to relevant players based on its type

### Requirement: Player Entity
The system SHALL track player state including resources, cards, and captured monsters.

#### Scenario: Player has resources
- **GIVEN** a player entity
- **WHEN** the player state is queried
- **THEN** the player has: chicken legs (currency), victory points (score), permanent power bonus, and skill availability

#### Scenario: Player has card collections
- **GIVEN** a player entity
- **WHEN** the player state is queried
- **THEN** the player has: hand of treasure cards and collection of captured monsters

### Requirement: Cave Entity
The system SHALL support cave entities for monster encounters.

#### Scenario: Small cave has cost and reward
- **GIVEN** a small cave (1-5)
- **WHEN** the cave properties are queried
- **THEN** the cave has: entry cost (1-5 chicken legs), victory point reward (1-5), and current monster

#### Scenario: Ancient beast cave has element requirement
- **GIVEN** an ancient beast cave
- **WHEN** the cave properties are queried
- **THEN** the cave has: element type, monster requirement (2 same element + 1 any), and associated ancient beast
