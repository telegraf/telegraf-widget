const { Router } = require('telegraf')

class Widget extends Router {
  constructor (id) {
    super((ctx) => Promise.resolve({ route: ctx.widget.action }))
    this.id = id
  }
}

module.exports = Widget
