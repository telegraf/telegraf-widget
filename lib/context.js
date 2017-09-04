const { compose } = require('telegraf')

class WidgetContext {
  constructor (ctx, widgets) {
    this.ctx = ctx
    this.widgets = widgets
  }

  send (widgetId, query) {
    return this.renderWidget(true, this.widgets.get(widgetId.toLowerCase()), null, query)
  }

  update (widgetId, page, query) {
    return this.renderWidget(false, this.widgets.get(widgetId.toLowerCase()), page, query)
  }

  switchTo (page, query) {
    if (!this.current) {
      throw new Error("Can't find widget context")
    }
    return this.update(this.current.id, page, query)
  }

  renderWidget (createNew, widget, page, query) {
    if (!widget) {
      throw new Error('telegraf-widget: Widget not found')
    }
    const handler = compose([
      (ctx, next) => {
        ctx.widget.current = widget
        ctx.widget.page = page
        ctx.widget.query = query
        return next()
      },
      createNew ? widget.initMiddleware() : widget.middleware()
    ])
    return handler(this.ctx, () => Promise.resolve())
  }
}

module.exports = WidgetContext
