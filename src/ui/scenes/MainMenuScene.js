/**
 * Main Menu Scene
 */

import { BaseScene } from './BaseScene.js'

export class MainMenuScene extends BaseScene {
  init(data) {
    super.init(data)

    // Register buttons
    const centerX = this.renderer.width / 2
    const buttonWidth = 300
    const buttonHeight = 60

    this.playButton = this.registerButton(
      'play',
      {
        x: centerX - buttonWidth / 2,
        y: 320,
        width: buttonWidth,
        height: buttonHeight,
      },
      () => this.onPlayClick()
    )

    this.multiplayerButton = this.registerButton(
      'multiplayer',
      {
        x: centerX - buttonWidth / 2,
        y: 400,
        width: buttonWidth,
        height: buttonHeight,
      },
      () => this.onMultiplayerClick()
    )

    this.settingsButton = this.registerButton(
      'settings',
      {
        x: centerX - buttonWidth / 2,
        y: 480,
        width: buttonWidth,
        height: buttonHeight,
      },
      () => this.onSettingsClick()
    )
  }

  onPlayClick() {
    this.changeScene('characterSelect')
  }

  onMultiplayerClick() {
    this.changeScene('lobby')
  }

  onSettingsClick() {
    // TODO: Implement settings scene
    console.log('Settings clicked')
  }

  render() {
    const r = this.renderer
    const centerX = r.width / 2

    // Title
    r.drawCenteredText('SIÊU THÚ NGÂN HÀ', centerX, 100, {
      font: 'bold 56px Arial',
      color: r.colors.primary,
    })

    r.drawCenteredText('Galaxy Super Beast', centerX, 170, {
      font: 'bold 32px Arial',
      color: r.colors.text,
    })

    // Subtitle
    r.drawCenteredText('Board Game Digital Edition', centerX, 220, {
      font: '24px Arial',
      color: r.colors.text,
    })

    // Decorative elements
    r.drawCircle(200, 300, 30, r.colors.fire)
    r.drawCircle(1080, 300, 30, r.colors.water)
    r.drawCircle(200, 500, 30, r.colors.earth)
    r.drawCircle(1080, 500, 30, r.colors.air)

    // Play button (Single player / Local)
    r.drawButton(
      this.playButton.x,
      this.playButton.y,
      this.playButton.width,
      this.playButton.height,
      '🎮 Chơi Offline',
      { hovered: this.isButtonHovered(this.playButton) }
    )

    // Multiplayer button
    r.drawButton(
      this.multiplayerButton.x,
      this.multiplayerButton.y,
      this.multiplayerButton.width,
      this.multiplayerButton.height,
      '🌐 Multiplayer Online',
      {
        bgColor: '#1565c0',
        hovered: this.isButtonHovered(this.multiplayerButton),
      }
    )

    // Settings button
    r.drawButton(
      this.settingsButton.x,
      this.settingsButton.y,
      this.settingsButton.width,
      this.settingsButton.height,
      '⚙️ Cài Đặt',
      {
        bgColor: r.colors.secondary,
        hovered: this.isButtonHovered(this.settingsButton),
      }
    )

    // Footer
    r.drawCenteredText('2-6 Players | 8 Rounds | 12 Characters', centerX, 580, {
      font: '18px Arial',
      color: '#888888',
    })

    r.drawCenteredText('Offline: Play vs AI on same screen', centerX, 620, {
      font: '14px Arial',
      color: '#666666',
    })

    r.drawCenteredText('Multiplayer: Each player opens their own browser tab', centerX, 650, {
      font: '14px Arial',
      color: '#666666',
    })
  }
}
