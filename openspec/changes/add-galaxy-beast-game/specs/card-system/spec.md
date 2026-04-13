# Card System Specification

## ADDED Requirements

### Requirement: Deck Management
The system SHALL manage card decks for monsters, treasures, and events.

#### Scenario: Initialize and shuffle decks
- **WHEN** a new game starts
- **THEN** all three decks (monster, treasure, event) are created from data files and shuffled

#### Scenario: Draw from deck
- **WHEN** a card needs to be drawn from a deck
- **THEN** the top card is removed from the deck and returned

#### Scenario: Deck exhaustion
- **WHEN** a deck is empty and a draw is needed
- **THEN** the discard pile is shuffled back into the deck (or the deck remains empty if no discard)

### Requirement: Monster Card Management
The system SHALL manage the 38 monster cards across 4 elements.

#### Scenario: Initial cave population
- **WHEN** the game starts
- **THEN** 5 monster cards are drawn and placed face-up in the 5 small caves

#### Scenario: Replenish cave after capture
- **WHEN** a monster is captured from a cave
- **THEN** a new monster card is drawn from the deck and placed in the empty cave

### Requirement: Treasure Card Management
The system SHALL manage the 48 treasure cards in player hands.

#### Scenario: Initial treasure distribution
- **WHEN** the game starts
- **THEN** each player receives 3 treasure cards in their hand

#### Scenario: Draw treasure card
- **WHEN** a player draws a treasure card (daily reward or effect)
- **THEN** the card is added to the player's hand

#### Scenario: Play treasure card
- **WHEN** a player plays a treasure card
- **THEN** the card is removed from hand, its effect is executed, and the card is discarded

#### Scenario: Instant vs action timing
- **GIVEN** a treasure card in hand
- **WHEN** checking if it can be played
- **THEN** instant (blue) cards can be played at any time; action (red) cards only during the player's turn

### Requirement: Event Card Management
The system SHALL manage the 22 event cards during event phase.

#### Scenario: Draw event card
- **WHEN** the event phase begins
- **THEN** the first player draws the top event card

#### Scenario: Apply event effect
- **WHEN** an event card is drawn
- **THEN** the card's effect is applied to all affected players according to its rules

#### Scenario: Event card types
- **GIVEN** an event card
- **WHEN** the event is processed
- **THEN** reward events give bonuses, penalty events cause losses, neutral events have conditional effects

### Requirement: Card Effect Execution
The system SHALL execute card effects according to their definitions.

#### Scenario: Dice modification effect
- **WHEN** a dice-modifying card is played (e.g., Bùa Số 1-6)
- **THEN** the dice result is changed to the specified value

#### Scenario: Resource transfer effect
- **WHEN** a resource-stealing card is played (e.g., Găng Tay Đạo Chích)
- **THEN** resources are transferred from target player to the card user

#### Scenario: Block effect
- **WHEN** a blocking card is played (e.g., Kính Cường Lực)
- **THEN** the target card's effect is nullified

#### Scenario: Combat modifier effect
- **WHEN** a combat card is played (e.g., Kiếm 6-5)
- **THEN** the combat outcome is modified according to the card's rules
