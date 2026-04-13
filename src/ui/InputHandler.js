/**
 * Input Handler
 * Manages mouse and touch input events
 */

export class InputHandler {
  constructor(canvas) {
    this.canvas = canvas
    this.mouseX = 0
    this.mouseY = 0
    this.isMouseDown = false
    this.clickedThisFrame = false

    // Clickable regions
    this.regions = new Map()

    // Event callbacks
    this.callbacks = {
      onClick: null,
      onMouseMove: null,
      onMouseDown: null,
      onMouseUp: null,
    }

    // Bind event listeners
    this._bindEvents()
  }

  /**
   * Bind DOM events
   * @private
   */
  _bindEvents() {
    // Mouse events
    this.canvas.addEventListener('mousemove', (e) => this._onMouseMove(e))
    this.canvas.addEventListener('mousedown', (e) => this._onMouseDown(e))
    this.canvas.addEventListener('mouseup', (e) => this._onMouseUp(e))
    this.canvas.addEventListener('click', (e) => this._onClick(e))

    // Touch events for mobile
    this.canvas.addEventListener('touchstart', (e) => this._onTouchStart(e))
    this.canvas.addEventListener('touchend', (e) => this._onTouchEnd(e))
    this.canvas.addEventListener('touchmove', (e) => this._onTouchMove(e))

    // Prevent context menu on right-click
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault())
  }

  /**
   * Get mouse position relative to canvas
   * @private
   */
  _getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect()
    const scaleX = this.canvas.width / rect.width
    const scaleY = this.canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  /**
   * Handle mouse move
   * @private
   */
  _onMouseMove(e) {
    const pos = this._getMousePos(e)
    this.mouseX = pos.x
    this.mouseY = pos.y

    if (this.callbacks.onMouseMove) {
      this.callbacks.onMouseMove(pos.x, pos.y)
    }
  }

  /**
   * Handle mouse down
   * @private
   */
  _onMouseDown(e) {
    this.isMouseDown = true
    const pos = this._getMousePos(e)

    if (this.callbacks.onMouseDown) {
      this.callbacks.onMouseDown(pos.x, pos.y)
    }
  }

  /**
   * Handle mouse up
   * @private
   */
  _onMouseUp(e) {
    this.isMouseDown = false
    const pos = this._getMousePos(e)

    if (this.callbacks.onMouseUp) {
      this.callbacks.onMouseUp(pos.x, pos.y)
    }
  }

  /**
   * Handle click
   * @private
   */
  _onClick(e) {
    const pos = this._getMousePos(e)
    this.clickedThisFrame = true

    // Check registered regions
    for (const [id, region] of this.regions) {
      if (this._isPointInRegion(pos.x, pos.y, region)) {
        if (region.callback) {
          region.callback(id, region.data)
        }
        break // Only trigger first matching region
      }
    }

    if (this.callbacks.onClick) {
      this.callbacks.onClick(pos.x, pos.y)
    }
  }

  /**
   * Handle touch start
   * @private
   */
  _onTouchStart(e) {
    e.preventDefault()
    const touch = e.touches[0]
    const pos = this._getMousePos(touch)
    this.mouseX = pos.x
    this.mouseY = pos.y
    this.isMouseDown = true

    if (this.callbacks.onMouseDown) {
      this.callbacks.onMouseDown(pos.x, pos.y)
    }
  }

  /**
   * Handle touch end
   * @private
   */
  _onTouchEnd(e) {
    e.preventDefault()
    this.isMouseDown = false

    // Trigger click on touch end
    this._onClick({ clientX: this.mouseX, clientY: this.mouseY })

    if (this.callbacks.onMouseUp) {
      this.callbacks.onMouseUp(this.mouseX, this.mouseY)
    }
  }

  /**
   * Handle touch move
   * @private
   */
  _onTouchMove(e) {
    e.preventDefault()
    const touch = e.touches[0]
    const pos = this._getMousePos(touch)
    this.mouseX = pos.x
    this.mouseY = pos.y

    if (this.callbacks.onMouseMove) {
      this.callbacks.onMouseMove(pos.x, pos.y)
    }
  }

  /**
   * Register a clickable region
   * @param {string} id - Unique identifier
   * @param {Object} region - Region definition {x, y, width, height} or {centerX, centerY, radius}
   * @param {Function} callback - Click callback
   * @param {*} data - Optional data to pass to callback
   */
  registerRegion(id, region, callback, data = null) {
    this.regions.set(id, {
      ...region,
      callback,
      data,
    })
  }

  /**
   * Unregister a clickable region
   * @param {string} id - Region ID
   */
  unregisterRegion(id) {
    this.regions.delete(id)
  }

  /**
   * Clear all registered regions
   */
  clearRegions() {
    this.regions.clear()
  }

  /**
   * Check if point is inside a region
   * @private
   */
  _isPointInRegion(x, y, region) {
    if (region.radius) {
      // Circular region
      const dx = x - region.centerX
      const dy = y - region.centerY
      return dx * dx + dy * dy <= region.radius * region.radius
    } else {
      // Rectangular region
      return (
        x >= region.x &&
        x <= region.x + region.width &&
        y >= region.y &&
        y <= region.y + region.height
      )
    }
  }

  /**
   * Check if mouse is over a region
   * @param {Object} region - Region to check
   * @returns {boolean} True if mouse is over region
   */
  isMouseOverRegion(region) {
    return this._isPointInRegion(this.mouseX, this.mouseY, region)
  }

  /**
   * Register callback for input event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    const eventName = `on${event.charAt(0).toUpperCase() + event.slice(1)}`
    if (this.callbacks.hasOwnProperty(eventName)) {
      this.callbacks[eventName] = callback
    }
  }

  /**
   * Reset click state (call at end of frame)
   */
  resetClickState() {
    this.clickedThisFrame = false
  }

  /**
   * Get current mouse position
   * @returns {Object} {x, y}
   */
  getMousePosition() {
    return { x: this.mouseX, y: this.mouseY }
  }

  /**
   * Check if mouse was clicked this frame
   * @returns {boolean}
   */
  wasClicked() {
    return this.clickedThisFrame
  }
}
