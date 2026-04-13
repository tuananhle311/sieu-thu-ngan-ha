/**
 * Scene Manager
 * Manages game scenes and transitions between them
 */

import { MainMenuScene } from './scenes/MainMenuScene.js'
import { CharacterSelectScene } from './scenes/CharacterSelectScene.js'
import { GameScene } from './scenes/GameScene.js'
import { GameOverScene } from './scenes/GameOverScene.js'
import { LobbyScene } from './scenes/LobbyScene.js'

export class SceneManager {
  constructor(renderer, inputHandler) {
    this.renderer = renderer
    this.inputHandler = inputHandler
    this.gameEngine = null
    this.currentScene = null
    this.scenes = new Map()

    // Register scenes
    this._registerScenes()
  }

  /**
   * Register all available scenes
   * @private
   */
  _registerScenes() {
    this.scenes.set('mainMenu', MainMenuScene)
    this.scenes.set('lobby', LobbyScene)
    this.scenes.set('characterSelect', CharacterSelectScene)
    this.scenes.set('game', GameScene)
    this.scenes.set('gameOver', GameOverScene)
  }

  /**
   * Set the game engine reference
   * @param {GameEngine} gameEngine - Game engine instance
   */
  setGameEngine(gameEngine) {
    this.gameEngine = gameEngine
  }

  /**
   * Change to a new scene
   * @param {string} sceneName - Name of the scene
   * @param {Object} data - Optional data to pass to the scene
   */
  changeScene(sceneName, data = {}) {
    // Clean up current scene
    if (this.currentScene) {
      this.currentScene.cleanup()
    }

    // Clear input regions from previous scene
    this.inputHandler.clearRegions()

    // Get scene class
    const SceneClass = this.scenes.get(sceneName)
    if (!SceneClass) {
      console.error(`Scene "${sceneName}" not found`)
      return
    }

    // Create new scene instance
    this.currentScene = new SceneClass(
      this.renderer,
      this.inputHandler,
      this,
      this.gameEngine
    )

    // Initialize the scene with data
    this.currentScene.init(data)

    console.log(`Changed to scene: ${sceneName}`)
  }

  /**
   * Update current scene
   * @param {number} deltaTime - Time since last update in ms
   */
  update(deltaTime) {
    if (this.currentScene) {
      this.currentScene.update(deltaTime)
    }

    // Reset input state at end of frame
    this.inputHandler.resetClickState()
  }

  /**
   * Render current scene
   */
  render() {
    if (this.currentScene) {
      this.currentScene.render()
    }
  }

  /**
   * Get current scene name
   * @returns {string} Current scene name or null
   */
  getCurrentSceneName() {
    if (!this.currentScene) return null

    for (const [name, SceneClass] of this.scenes) {
      if (this.currentScene instanceof SceneClass) {
        return name
      }
    }
    return null
  }
}
