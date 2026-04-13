/**
 * Renderer
 * Handles all canvas rendering operations
 */

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.width = canvas.width
    this.height = canvas.height

    // Colors
    this.colors = {
      background: '#16213e',
      primary: '#e94560',
      secondary: '#0f3460',
      accent: '#533483',
      text: '#ffffff',
      textDark: '#1a1a2e',
      fire: '#ff6b35',
      water: '#4ecdc4',
      earth: '#8b5e34',
      air: '#a8dadc',
      gold: '#ffd700',
      silver: '#c0c0c0',
    }

    // Fonts
    this.fonts = {
      title: 'bold 48px Arial',
      subtitle: 'bold 24px Arial',
      body: '18px Arial',
      small: '14px Arial',
    }
  }

  /**
   * Clear the canvas
   */
  clear() {
    this.ctx.fillStyle = this.colors.background
    this.ctx.fillRect(0, 0, this.width, this.height)
  }

  /**
   * Draw a rectangle
   */
  drawRect(x, y, width, height, color, radius = 0) {
    this.ctx.fillStyle = color
    if (radius > 0) {
      this.drawRoundedRect(x, y, width, height, radius)
      this.ctx.fill()
    } else {
      this.ctx.fillRect(x, y, width, height)
    }
  }

  /**
   * Draw a rounded rectangle path
   */
  drawRoundedRect(x, y, width, height, radius) {
    this.ctx.beginPath()
    this.ctx.moveTo(x + radius, y)
    this.ctx.lineTo(x + width - radius, y)
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    this.ctx.lineTo(x + width, y + height - radius)
    this.ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height
    )
    this.ctx.lineTo(x + radius, y + height)
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    this.ctx.lineTo(x, y + radius)
    this.ctx.quadraticCurveTo(x, y, x + radius, y)
    this.ctx.closePath()
  }

  /**
   * Draw outlined rectangle
   */
  drawRectOutline(x, y, width, height, color, lineWidth = 2, radius = 0) {
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = lineWidth
    if (radius > 0) {
      this.drawRoundedRect(x, y, width, height, radius)
      this.ctx.stroke()
    } else {
      this.ctx.strokeRect(x, y, width, height)
    }
  }

  /**
   * Draw text
   */
  drawText(text, x, y, options = {}) {
    const {
      font = this.fonts.body,
      color = this.colors.text,
      align = 'left',
      baseline = 'top',
    } = options

    this.ctx.font = font
    this.ctx.fillStyle = color
    this.ctx.textAlign = align
    this.ctx.textBaseline = baseline
    this.ctx.fillText(text, x, y)
  }

  /**
   * Draw centered text
   */
  drawCenteredText(text, x, y, options = {}) {
    this.drawText(text, x, y, { ...options, align: 'center' })
  }

  /**
   * Draw a circle
   */
  drawCircle(x, y, radius, color) {
    this.ctx.fillStyle = color
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.fill()
  }

  /**
   * Draw circle outline
   */
  drawCircleOutline(x, y, radius, color, lineWidth = 2) {
    this.ctx.strokeStyle = color
    this.ctx.lineWidth = lineWidth
    this.ctx.beginPath()
    this.ctx.arc(x, y, radius, 0, Math.PI * 2)
    this.ctx.stroke()
  }

  /**
   * Draw a button
   */
  drawButton(x, y, width, height, text, options = {}) {
    const {
      bgColor = this.colors.primary,
      textColor = this.colors.text,
      hovered = false,
      disabled = false,
    } = options

    // Button background
    let color = bgColor
    if (disabled) {
      color = '#666666'
    } else if (hovered) {
      color = this._lightenColor(bgColor, 20)
    }

    this.drawRect(x, y, width, height, color, 8)

    // Button text
    this.drawCenteredText(text, x + width / 2, y + height / 2, {
      font: this.fonts.subtitle,
      color: disabled ? '#999999' : textColor,
      baseline: 'middle',
    })

    return { x, y, width, height }
  }

  /**
   * Draw a card
   */
  drawCard(x, y, width, height, options = {}) {
    const {
      bgColor = this.colors.secondary,
      borderColor = this.colors.accent,
      title = '',
      subtitle = '',
      element = null,
    } = options

    // Card background
    this.drawRect(x, y, width, height, bgColor, 8)
    this.drawRectOutline(x, y, width, height, borderColor, 2, 8)

    // Element indicator
    if (element) {
      const elementColor = this.colors[element] || this.colors.text
      this.drawCircle(x + width - 15, y + 15, 10, elementColor)
    }

    // Title
    if (title) {
      this.drawCenteredText(title, x + width / 2, y + 20, {
        font: this.fonts.body,
        color: this.colors.text,
      })
    }

    // Subtitle
    if (subtitle) {
      this.drawCenteredText(subtitle, x + width / 2, y + 45, {
        font: this.fonts.small,
        color: this.colors.text,
      })
    }

    return { x, y, width, height }
  }

  /**
   * Draw a player panel
   */
  drawPlayerPanel(x, y, width, height, player, isCurrentPlayer = false) {
    // Panel background
    const bgColor = isCurrentPlayer ? this.colors.accent : this.colors.secondary
    this.drawRect(x, y, width, height, bgColor, 8)

    if (isCurrentPlayer) {
      this.drawRectOutline(x, y, width, height, this.colors.gold, 3, 8)
    }

    // Player name
    this.drawText(player.name, x + 10, y + 10, {
      font: this.fonts.subtitle,
      color: this.colors.text,
    })

    // Character name
    if (player.character) {
      this.drawText(player.character.name, x + 10, y + 40, {
        font: this.fonts.small,
        color: this.colors.text,
      })
    }

    // Resources
    const resourceY = y + 70
    this.drawText(`🍗 ${player.chickenLegs}`, x + 10, resourceY, {
      font: this.fonts.body,
    })
    this.drawText(`⭐ ${player.victoryPoints}`, x + 70, resourceY, {
      font: this.fonts.body,
    })
    this.drawText(`⚔️ +${player.permanentPower}`, x + 130, resourceY, {
      font: this.fonts.body,
    })

    // Cards and monsters count
    const countY = y + 95
    this.drawText(`📜 ${player.treasureCardCount || 0}`, x + 10, countY, {
      font: this.fonts.small,
    })
    this.drawText(`👾 ${player.monsterCount || 0}`, x + 60, countY, {
      font: this.fonts.small,
    })

    return { x, y, width, height }
  }

  /**
   * Draw a cave
   */
  drawCave(x, y, size, cave, options = {}) {
    const { hovered = false, selectable = false } = options

    // Cave background
    let bgColor = this.colors.secondary
    if (hovered && selectable) {
      bgColor = this._lightenColor(this.colors.secondary, 30)
    }

    this.drawCircle(x + size / 2, y + size / 2, size / 2, bgColor)

    if (selectable) {
      this.drawCircleOutline(
        x + size / 2,
        y + size / 2,
        size / 2,
        this.colors.gold,
        2
      )
    }

    // Cave cost
    this.drawCenteredText(`${cave.cost}🍗`, x + size / 2, y + 15, {
      font: this.fonts.small,
      color: this.colors.text,
    })

    // Monster in cave
    if (cave.monster) {
      const elementColor = this.colors[cave.monster.element] || this.colors.text
      this.drawCircle(x + size / 2, y + size / 2, 15, elementColor)
      this.drawCenteredText(`+${cave.monster.power}`, x + size / 2, y + size / 2, {
        font: this.fonts.small,
        color: this.colors.textDark,
        baseline: 'middle',
      })
    }

    // Victory points
    this.drawCenteredText(`${cave.victoryPoints}⭐`, x + size / 2, y + size - 25, {
      font: this.fonts.small,
      color: this.colors.gold,
    })

    return {
      x,
      y,
      width: size,
      height: size,
      centerX: x + size / 2,
      centerY: y + size / 2,
      radius: size / 2,
    }
  }

  /**
   * Draw dice
   */
  drawDice(x, y, size, value, options = {}) {
    const { rolling = false, color = this.colors.text } = options

    // Dice background
    this.drawRect(x, y, size, size, '#ffffff', 8)
    this.drawRectOutline(x, y, size, size, '#333333', 2, 8)

    if (rolling) {
      // Show rolling animation indicator
      this.drawCenteredText('?', x + size / 2, y + size / 2, {
        font: 'bold 32px Arial',
        color: '#333333',
        baseline: 'middle',
      })
    } else if (value !== null) {
      // Show dice value
      this.drawCenteredText(value.toString(), x + size / 2, y + size / 2, {
        font: 'bold 32px Arial',
        color: '#333333',
        baseline: 'middle',
      })
    }

    return { x, y, width: size, height: size }
  }

  /**
   * Lighten a hex color
   * @private
   */
  _lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = ((num >> 8) & 0x00ff) + amt
    const B = (num & 0x0000ff) + amt
    return (
      '#' +
      (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
      )
        .toString(16)
        .slice(1)
    )
  }

  /**
   * Draw an image (placeholder for now)
   */
  drawImage(image, x, y, width, height) {
    if (image) {
      this.ctx.drawImage(image, x, y, width, height)
    } else {
      // Placeholder
      this.drawRect(x, y, width, height, '#333', 4)
      this.drawCenteredText('IMG', x + width / 2, y + height / 2, {
        color: '#666',
        baseline: 'middle',
      })
    }
  }

  /**
   * Get canvas context for custom drawing
   */
  getContext() {
    return this.ctx
  }
}
