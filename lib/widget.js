const { Router, compose, safePassThru } = require('telegraf')
const { button, switchToPage } = require('./telegraf-widget')

class Widget extends Router {
  constructor (id, defaultPage) {
    super((ctx) => Promise.resolve({ route: ctx.widget.page }))
    this.id = id
    this.initHandler = query => defaultPage ? switchToPage(defaultPage, query) : safePassThru()
  }

  button (...args) {
    return button(this.id, ...args)
  }

  init (...fns) {
    if (fns.length === 0) {
      throw new TypeError('At least one init handler must be provided')
    }
    this.initHandler = compose(fns)
  }

  initMiddleware (query) {
    return this.initHandler(query)
  }
}

module.exports = Widget
