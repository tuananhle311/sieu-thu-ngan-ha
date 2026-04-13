# Combat System Specification

## ADDED Requirements

### Requirement: Dice Rolling
The system SHALL provide fair dice rolling for combat resolution.

#### Scenario: Roll single die
- **WHEN** a dice roll is requested
- **THEN** a random number between 1 and 6 is generated with equal probability

#### Scenario: Dice result can be modified
- **WHEN** a dice roll occurs AND a modifier effect is active (treasure card or character skill)
- **THEN** the dice result is modified according to the effect before power calculation

### Requirement: Combat Power Calculation
The system SHALL calculate combat power for both player and monster.

#### Scenario: Calculate player power
- **GIVEN** a player in combat
- **WHEN** calculating player power
- **THEN** power equals: dice roll + permanent power bonus + treasure card bonuses + character skill bonus

#### Scenario: Calculate monster power
- **GIVEN** a monster in combat
- **WHEN** calculating monster power
- **THEN** power equals: dice roll + monster base power (+2, +3, or +4)

### Requirement: Combat Resolution
The system SHALL resolve combat between player and monster.

#### Scenario: Player wins combat
- **WHEN** player power >= monster power
- **THEN** the player wins: receives cave victory points, captures the monster card, and receives element-based reward

#### Scenario: Player loses combat
- **WHEN** player power < monster power
- **THEN** the player loses: no rewards, monster remains in cave, chicken legs spent are lost

### Requirement: Combat Modifiers
The system SHALL support various combat modifiers from cards and skills.

#### Scenario: Treasure card modifies combat
- **WHEN** a combat-modifying treasure card is played during combat
- **THEN** the card's effect is applied to the power calculation or result

#### Scenario: Character skill affects combat
- **WHEN** a character skill with combat effect is activated
- **THEN** the skill's effect is applied (e.g., Aries auto-wins on even dice, Sagittarius gets bonus power)

### Requirement: Monster Dice Roll
The system SHALL handle monster dice rolls during combat.

#### Scenario: Monster dice roll in multiplayer
- **WHEN** combat occurs in multiplayer mode
- **THEN** the player to the right rolls the dice for the monster

#### Scenario: Monster dice roll in single player
- **WHEN** combat occurs in single player mode against AI
- **THEN** the system automatically rolls the dice for the monster
