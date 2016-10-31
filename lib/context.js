const { compose } = require('telegraf')

class WidgetContext {
  constructor (ctx, widgets) {
    this.ctx = ctx
    this.widgets = widgets
  }

  render (widgetId, page, args, createNew) {
    const widget = this.widgets.get(widgetId)
    if (!widget) {
      console.warn('telegraf-widget: Widget not found', widgetId)
      return
    }
    const handler = compose([
      (ctx, next) => {
        ctx.widget.page = page
        ctx.widget.args = args
        ctx.widget.current = widget
        return next()
      },
      createNew ? widget.creationMiddleware() : widget.middleware()
    ])
    return handler(this.ctx, () => undefined)
  }

  switchTo (page, args) {
    if (!this.current) {
      throw new Error("Can't find widget context")
    }
    return this.render(this.current.id, page, args)
  }
}

module.exports = WidgetContext
