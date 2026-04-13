# AI Opponent Specification

## ADDED Requirements

### Requirement: AI Player Integration
The system SHALL support AI-controlled players for single-player mode.

#### Scenario: Create AI player
- **WHEN** a single-player game is started
- **THEN** 1-5 AI players are created to fill the remaining slots (total 2-6 players)

#### Scenario: AI takes turn automatically
- **WHEN** it is an AI player's turn
- **THEN** the AI evaluates options and executes an action without user input

### Requirement: AI Cave Selection
The system SHALL enable AI to evaluate and choose caves strategically.

#### Scenario: AI evaluates cave options
- **GIVEN** an AI player with chicken legs
- **WHEN** evaluating which cave to enter
- **THEN** the AI considers: entry cost, victory point reward, monster difficulty, and win probability

#### Scenario: AI chooses optimal cave
- **GIVEN** multiple valid cave options
- **WHEN** the AI makes a decision
- **THEN** the AI selects the cave with the best expected value (reward × win probability - cost)

#### Scenario: AI passes when no good options
- **GIVEN** an AI player with limited resources or poor odds
- **WHEN** the AI evaluates options
- **THEN** the AI may choose to pass to conserve resources

### Requirement: AI Beast Capture Decision
The system SHALL enable AI to decide when to capture ancient beasts.

#### Scenario: AI evaluates beast capture timing
- **GIVEN** an AI player with qualifying monsters for beast capture
- **WHEN** the AI considers capturing a beast
- **THEN** the AI weighs the immediate reward against holding monsters for future use

#### Scenario: AI prioritizes beast capture late game
- **GIVEN** day 6-8 of the game
- **WHEN** the AI has qualifying monsters
- **THEN** the AI prioritizes beast capture to secure victory points and prevent collective loss

### Requirement: AI Treasure Card Usage
The system SHALL enable AI to strategically use treasure cards.

#### Scenario: AI uses combat-enhancing cards
- **GIVEN** an AI in combat with low win probability
- **WHEN** the AI has relevant treasure cards
- **THEN** the AI plays cards to improve combat odds

#### Scenario: AI uses defensive cards
- **GIVEN** an opponent plays a harmful card against AI
- **WHEN** the AI has a blocking card (e.g., Kính Cường Lực)
- **THEN** the AI plays the blocking card to nullify the effect

#### Scenario: AI conserves valuable cards
- **GIVEN** an AI with limited treasure cards
- **WHEN** the situation is not critical
- **THEN** the AI conserves cards for more important moments

### Requirement: AI Character Skill Usage
The system SHALL enable AI to use character skills strategically.

#### Scenario: AI activates skill at optimal moment
- **GIVEN** an AI with an unused character skill
- **WHEN** the skill would provide significant advantage
- **THEN** the AI activates the skill

#### Scenario: AI reserves skill for key moments
- **GIVEN** an AI with a powerful skill
- **WHEN** the current situation doesn't require the skill
- **THEN** the AI reserves the skill for a more critical moment

### Requirement: AI Fair Play
The system SHALL ensure AI does not cheat by accessing hidden information.

#### Scenario: AI cannot see opponent hands
- **WHEN** the AI makes decisions
- **THEN** the AI does not access other players' hidden treasure cards

#### Scenario: AI cannot predict dice rolls
- **WHEN** the AI evaluates combat odds
- **THEN** the AI uses probabilistic estimates, not foreknowledge of dice results

#### Scenario: AI uses same rules as human players
- **WHEN** the AI takes any action
- **THEN** the action follows the same rules and constraints as human players
