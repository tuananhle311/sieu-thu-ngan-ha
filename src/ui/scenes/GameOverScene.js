/**
 * Game Over Scene
 */

import { BaseScene } from './BaseScene.js'

export class GameOverScene extends BaseScene {
  init(data) {
    super.init(data)

    this.winner = data.winner
    this.isCollectiveLoss = !data.winner

    // Get final standings
    this.standings = this._getStandings()

    this._setupButtons()
  }

  _setupButtons() {
    const r = this.renderer
    const centerX = r.width / 2

    this.registerButton(
      'playAgain',
      { x: centerX - 220, y: 550, width: 200, height: 50 },
      () => this.onPlayAgain()
    )

    this.registerButton(
      'mainMenu',
      { x: centerX + 20, y: 550, width: 200, height: 50 },
      () => this.onMainMenu()
    )
  }

  _getStandings() {
    const summary = this.gameEngine.getGameSummary()
    return summary.players
      .map((p) => ({ ...p }))
      .sort((a, b) => {
        if (b.victoryPoints !== a.victoryPoints) {
          return b.victoryPoints - a.victoryPoints
        }
        if (b.monsterCount !== a.monsterCount) {
          return b.monsterCount - a.monsterCount
        }
        return b.chickenLegs - a.chickenLegs
      })
  }

  onPlayAgain() {
    this.changeScene('characterSelect')
  }

  onMainMenu() {
    this.changeScene('mainMenu')
  }

  render() {
    const r = this.renderer
    const centerX = r.width / 2

    if (this.isCollectiveLoss) {
      // Collective loss - galaxy destroyed
      r.drawCenteredText('DẢI NGÂN HÀ ĐÃ BỊ PHÁ HỦY!', centerX, 100, {
        font: 'bold 48px Arial',
        color: r.colors.primary,
      })

      r.drawCenteredText('Không ai thu phục được Siêu Thú Cổ Đại', centerX, 160, {
        font: '24px Arial',
        color: r.colors.text,
      })

      r.drawCenteredText('Tất cả đều thua!', centerX, 200, {
        font: 'bold 28px Arial',
        color: '#ff6666',
      })
    } else {
      // Winner!
      r.drawCenteredText('KẾT THÚC GAME!', centerX, 80, {
        font: 'bold 48px Arial',
        color: r.colors.gold,
      })

      r.drawCenteredText('🏆 NGƯỜI CHIẾN THẮNG 🏆', centerX, 140, {
        font: 'bold 32px Arial',
        color: r.colors.gold,
      })

      r.drawCenteredText(this.winner.name, centerX, 190, {
        font: 'bold 36px Arial',
        color: r.colors.text,
      })

      if (this.winner.character) {
        r.drawCenteredText(`(${this.winner.character.name})`, centerX, 230, {
          font: '20px Arial',
          color: '#888888',
        })
      }

      r.drawCenteredText(
        `${this.winner.victoryPoints} Điểm Chiến Công`,
        centerX,
        270,
        {
          font: 'bold 24px Arial',
          color: r.colors.primary,
        }
      )
    }

    // Standings table
    r.drawRect(centerX - 300, 310, 600, 220, r.colors.secondary, 12)
    r.drawCenteredText('BẢNG XẾP HẠNG', centerX, 330, {
      font: 'bold 20px Arial',
      color: r.colors.text,
    })

    // Table header
    r.drawText('Hạng', centerX - 270, 360, { font: 'bold 14px Arial' })
    r.drawText('Người chơi', centerX - 200, 360, { font: 'bold 14px Arial' })
    r.drawText('Điểm', centerX + 50, 360, { font: 'bold 14px Arial' })
    r.drawText('Quái thú', centerX + 130, 360, { font: 'bold 14px Arial' })
    r.drawText('Đùi gà', centerX + 220, 360, { font: 'bold 14px Arial' })

    // Player rows
    this.standings.forEach((player, index) => {
      const y = 390 + index * 30
      const isWinner = !this.isCollectiveLoss && index === 0

      const color = isWinner ? r.colors.gold : r.colors.text

      r.drawText(`#${index + 1}`, centerX - 270, y, { color })
      r.drawText(player.name, centerX - 200, y, { color })
      r.drawText(`${player.victoryPoints}⭐`, centerX + 50, y, { color })
      r.drawText(`${player.monsterCount}`, centerX + 145, y, { color })
      r.drawText(`${player.chickenLegs}🍗`, centerX + 220, y, { color })
    })

    // Buttons
    r.drawButton(centerX - 220, 550, 200, 50, 'Chơi Lại', {
      hovered: this.inputHandler.isMouseOverRegion({
        x: centerX - 220,
        y: 550,
        width: 200,
        height: 50,
      }),
    })

    r.drawButton(centerX + 20, 550, 200, 50, 'Menu Chính', {
      bgColor: r.colors.secondary,
      hovered: this.inputHandler.isMouseOverRegion({
        x: centerX + 20,
        y: 550,
        width: 200,
        height: 50,
      }),
    })

    // Footer
    r.drawCenteredText('Cảm ơn bạn đã chơi Siêu Thú Ngân Hà!', centerX, 650, {
      font: '16px Arial',
      color: '#666666',
    })
  }
}
