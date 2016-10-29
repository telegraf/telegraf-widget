const { compose } = require('telegraf')

class WidgetContext {
  constructor (ctx, widgets) {
    this.ctx = ctx
    this.widgets = widgets
  }

  makeHandler (widgetId, action, args, forceNew) {
    const currentWidget = this.widgets.get(widgetId)
    if (!currentWidget) {
      console.warn('telegraf-widget: Widget not found', widgetId)
      return
    }
    return compose([
      (ctx, next) => {
        ctx.widget.action = action
        ctx.widget.args = args
        ctx.widget.forceNew = forceNew
        return next()
      },
      currentWidget.middleware()
    ])
  }

  invoke (...args) {
    return this.makeHandler(...args)(this.ctx, () => undefined)
  }
}

module.exports = WidgetContext
