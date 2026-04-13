# Player Actions Specification

## ADDED Requirements

### Requirement: Enter Cave Action
The system SHALL allow players to enter a small cave to capture a monster.

#### Scenario: Enter cave with sufficient chicken legs
- **GIVEN** a player with enough chicken legs for a cave
- **WHEN** the player chooses to enter that cave
- **THEN** the chicken legs are deducted and combat begins with the cave's monster

#### Scenario: Cannot enter cave without sufficient chicken legs
- **GIVEN** a player without enough chicken legs for a cave
- **WHEN** the player attempts to enter that cave
- **THEN** the action is rejected with a message indicating insufficient resources

#### Scenario: One cave per turn limit
- **GIVEN** a player who has already entered a cave this turn
- **WHEN** the player attempts to enter another cave
- **THEN** the action is rejected (each player can only explore one cave per turn)

### Requirement: Capture Ancient Beast Action
The system SHALL allow players to capture ancient super beasts by trading monsters.

#### Scenario: Capture with correct monster combination
- **GIVEN** a player with 2 monsters of the required element + 1 any monster
- **WHEN** the player chooses to capture the corresponding ancient beast
- **THEN** the 3 monsters are discarded, the beast is captured, and rewards are given

#### Scenario: Cannot capture without required monsters
- **GIVEN** a player without the required monster combination
- **WHEN** the player attempts to capture an ancient beast
- **THEN** the action is rejected with a message indicating which monsters are missing

#### Scenario: One beast capture per turn
- **GIVEN** a player who qualifies for multiple beast captures
- **WHEN** the player attempts to capture a second beast in the same turn
- **THEN** the action is rejected (limit one beast capture per turn)

#### Scenario: Beast already captured
- **GIVEN** an ancient beast that has been captured by another player
- **WHEN** a player attempts to capture that same beast
- **THEN** the action is rejected (each beast can only be captured once)

### Requirement: Pass Action
The system SHALL allow players to pass their turn.

#### Scenario: Player chooses to pass
- **WHEN** a player chooses to pass their turn
- **THEN** the turn ends without any action and play moves to the next player

### Requirement: Use Character Skill Action
The system SHALL allow players to activate their character's special skill.

#### Scenario: Use skill during valid timing
- **GIVEN** a player with an unused skill and valid timing conditions
- **WHEN** the player activates their character skill
- **THEN** the skill effect is applied and the skill is marked as used

#### Scenario: Cannot use skill when already used
- **GIVEN** a player whose skill is already marked as used
- **WHEN** the player attempts to use the skill again
- **THEN** the action is rejected until the skill is refreshed

#### Scenario: Skill timing enforcement
- **GIVEN** a character with "in_turn" timing skill
- **WHEN** the player attempts to use the skill outside their turn
- **THEN** the action is rejected (skill can only be used during player's turn)

### Requirement: Play Treasure Card Action
The system SHALL allow players to play treasure cards from their hand.

#### Scenario: Play instant card anytime
- **GIVEN** a player with an instant (blue) treasure card
- **WHEN** the player plays the card at any point in the game
- **THEN** the card effect is executed

#### Scenario: Play action card during turn only
- **GIVEN** a player with an action (red) treasure card
- **WHEN** the player attempts to play the card outside their turn
- **THEN** the action is rejected (action cards only playable during player's turn)

#### Scenario: Card effect resolution
- **WHEN** a treasure card is played successfully
- **THEN** the card is removed from hand, the effect is resolved, and the card is discarded
