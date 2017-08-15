const { Router, compose, safePassThru } = require('telegraf')
const { button } = require('./telegraf-widget')

class Widget extends Router {
  constructor (id) {
    super((ctx) => Promise.resolve({ route: ctx.widget.page }))
    this.id = id
    this.initHandler = safePassThru()
  }

  button (text, page, query) {
    return button(this.id, text, page, query)
  }

  init (...fns) {
    if (fns.length === 0) {
      throw new TypeError('At least one init handler must be provided')
    }
    this.initHandler = compose(fns)
  }

  initMiddleware () {
    return this.initHandler
  }
}

module.exports = Widget
