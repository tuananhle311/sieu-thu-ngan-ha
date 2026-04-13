# Game UI Specification

## ADDED Requirements

### Requirement: Main Menu Screen
The system SHALL display a main menu for game mode selection.

#### Scenario: Show main menu options
- **WHEN** the game application loads
- **THEN** the main menu displays options: "Single Player", "Local Multiplayer", and optionally "Settings"

#### Scenario: Start single player game
- **WHEN** the user selects "Single Player"
- **THEN** the game transitions to character selection with AI opponents configured

#### Scenario: Start local multiplayer game
- **WHEN** the user selects "Local Multiplayer"
- **THEN** the user is prompted to select number of players (2-6) before character selection

### Requirement: Character Selection Screen
The system SHALL allow players to select their zodiac character.

#### Scenario: Display all characters
- **WHEN** the character selection screen loads
- **THEN** all 12 zodiac characters are displayed with their names, skills, and skill timing

#### Scenario: Select character
- **WHEN** a player selects a character
- **THEN** the character is assigned to that player and marked as unavailable for others

#### Scenario: Character selection complete
- **WHEN** all players have selected characters
- **THEN** the game transitions to the game board screen

### Requirement: Game Board Screen
The system SHALL display the main game board with all game elements.

#### Scenario: Display board layout
- **WHEN** the game board screen loads
- **THEN** the board shows: 5 small caves, 4 ancient beast caves, score track, and day counter

#### Scenario: Display player information
- **WHEN** the game is in progress
- **THEN** each player's panel shows: character, chicken legs, victory points, permanent power, and skill status

#### Scenario: Display current player turn
- **WHEN** it is a player's turn
- **THEN** the current player is clearly highlighted and action options are displayed

### Requirement: Player Hand Display
The system SHALL display the current player's cards.

#### Scenario: Show treasure cards in hand
- **WHEN** the player views their hand
- **THEN** all treasure cards are displayed with name, type (instant/action), and effect description

#### Scenario: Show captured monsters
- **WHEN** the player views their collection
- **THEN** all captured monster cards are displayed grouped by element

### Requirement: Combat Interface
The system SHALL provide an interface for combat resolution.

#### Scenario: Show combat modal
- **WHEN** combat begins
- **THEN** a modal displays: player info, monster info, dice rolling area, and action buttons

#### Scenario: Dice rolling animation
- **WHEN** dice are rolled in combat
- **THEN** an animation shows the dice rolling before revealing the result

#### Scenario: Show combat result
- **WHEN** combat is resolved
- **THEN** the result (win/lose) is displayed with power calculations and rewards (if won)

### Requirement: Event Card Display
The system SHALL display event cards during the event phase.

#### Scenario: Show event card
- **WHEN** an event card is drawn
- **THEN** the card is displayed prominently with its name and effect description

#### Scenario: Event resolution feedback
- **WHEN** the event effect is applied
- **THEN** visual feedback shows how each player is affected

### Requirement: Card Detail Popup
The system SHALL provide detailed card information on demand.

#### Scenario: View card details
- **WHEN** the user clicks/hovers on a card
- **THEN** a popup displays: card name, full effect description, type, and any special rules

### Requirement: Game Over Screen
The system SHALL display results at game end.

#### Scenario: Show winner
- **WHEN** the game ends with a winner
- **THEN** the winner is announced with final scores for all players

#### Scenario: Show collective loss
- **WHEN** the game ends with no ancient beasts captured
- **THEN** a "Galaxy Destroyed" message is displayed, indicating all players lost

#### Scenario: Play again option
- **WHEN** the game over screen is displayed
- **THEN** options to "Play Again" or "Return to Menu" are available

### Requirement: Turn Action Buttons
The system SHALL provide clear action buttons during a player's turn.

#### Scenario: Display available actions
- **WHEN** it is a human player's turn
- **THEN** buttons are displayed for: Enter Cave, Capture Beast, Use Skill, Play Card, Pass

#### Scenario: Disable unavailable actions
- **WHEN** an action is not available (e.g., not enough chicken legs)
- **THEN** the corresponding button is disabled with visual indication

### Requirement: Notification System
The system SHALL provide notifications for game events.

#### Scenario: Show turn notification
- **WHEN** the turn changes
- **THEN** a notification announces whose turn it is

#### Scenario: Show action notification
- **WHEN** a significant action occurs (card played, skill used, beast captured)
- **THEN** a notification describes the action and its effect
