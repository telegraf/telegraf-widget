const { Router, compose, passThru } = require('telegraf')
const TelegrafWidget = require('./telegraf-widget')

class Widget extends Router {
  constructor (id) {
    super((ctx) => Promise.resolve({ route: ctx.widget.page }))
    this.id = id
    this.createHandler = passThru()
  }

  button (text, page, query) {
    return TelegrafWidget.button(this.id, text, page, query)
  }

  create (...fns) {
    if (fns.length === 0) {
      throw new TypeError('At least one create handler must be provided')
    }
    this.createHandler = compose(fns)
  }

  creationMiddleware () {
    return this.createHandler
  }
}

module.exports = Widget
