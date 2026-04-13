import { GameEngine } from './game/GameEngine.js'
import { SceneManager } from './ui/SceneManager.js'
import { Renderer } from './ui/Renderer.js'
import { InputHandler } from './ui/InputHandler.js'

// Game configuration
const CONFIG = {
  canvas: {
    width: 1280,
    height: 720,
  },
  game: {
    maxPlayers: 6,
    minPlayers: 2,
    maxRounds: 8,
    startingChickenLegs: 3,
    startingTreasureCards: 3,
  },
}

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas')

  if (!canvas) {
    console.error('Canvas element not found!')
    return
  }

  // Set canvas size
  canvas.width = CONFIG.canvas.width
  canvas.height = CONFIG.canvas.height

  // Initialize core systems
  const renderer = new Renderer(canvas)
  const inputHandler = new InputHandler(canvas)
  const sceneManager = new SceneManager(renderer, inputHandler)
  const gameEngine = new GameEngine(CONFIG.game)

  // Connect scene manager to game engine
  sceneManager.setGameEngine(gameEngine)

  // Start with main menu
  sceneManager.changeScene('mainMenu')

  // Game loop
  let lastTime = 0
  function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime
    lastTime = timestamp

    // Update current scene
    sceneManager.update(deltaTime)

    // Render current scene
    renderer.clear()
    sceneManager.render()

    requestAnimationFrame(gameLoop)
  }

  // Start the game loop
  requestAnimationFrame(gameLoop)

  console.log('Siêu Thú Ngân Hà - Galaxy Super Beast initialized!')
})

export { CONFIG }
