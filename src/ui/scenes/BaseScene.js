/**
 * Base Scene
 * Abstract base class for all game scenes
 */

export class BaseScene {
  constructor(renderer, inputHandler, sceneManager, gameEngine) {
    this.renderer = renderer
    this.inputHandler = inputHandler
    this.sceneManager = sceneManager
    this.gameEngine = gameEngine

    // UI elements for this scene
    this.buttons = []
    this.hoveredButton = null
  }

  /**
   * Initialize the scene
   * @param {Object} data - Scene initialization data
   */
  init(data) {
    // Override in subclass
  }

  /**
   * Update scene logic
   * @param {number} deltaTime - Time since last update
   */
  update(deltaTime) {
    // Check for hovered buttons
    this.hoveredButton = null
    for (const button of this.buttons) {
      if (this.inputHandler.isMouseOverRegion(button)) {
        this.hoveredButton = button
        break
      }
    }
  }

  /**
   * Render the scene
   */
  render() {
    // Override in subclass
  }

  /**
   * Clean up scene resources
   */
  cleanup() {
    this.buttons = []
    this.inputHandler.clearRegions()
  }

  /**
   * Register a button
   * @param {string} id - Button identifier
   * @param {Object} bounds - Button bounds {x, y, width, height}
   * @param {Function} onClick - Click callback
   * @returns {Object} Button data
   */
  registerButton(id, bounds, onClick) {
    const button = {
      id,
      ...bounds,
      onClick,
    }
    this.buttons.push(button)
    this.inputHandler.registerRegion(id, bounds, onClick)
    return button
  }

  /**
   * Check if a button is hovered
   * @param {Object} button - Button to check
   * @returns {boolean} True if hovered
   */
  isButtonHovered(button) {
    return this.hoveredButton === button
  }

  /**
   * Change to another scene
   * @param {string} sceneName - Scene to change to
   * @param {Object} data - Data to pass to new scene
   */
  changeScene(sceneName, data) {
    this.sceneManager.changeScene(sceneName, data)
  }
}
