const { Composer, Router, Markup, optional, compose, passThru, mount } = require('telegraf')
const WidgetContext = require('./context')

class TelegrafWidget extends Composer {
  constructor (widgets, options) {
    super()
    this.options = Object.assign({}, options)
    this.widgets = new Map()
    if (widgets) {
      widgets.forEach((widget) => this.register(widget))
    }
  }

  register (widget) {
    if (!widget || !widget.id || !widget.middleware) {
      throw new Error('telegraf-widget: Unsupported widget')
    }
    this.widgets.set(widget.id, widget)
    return this
  }

  handlePageAction () {
    return optional((ctx, next) => {
      if (!ctx.callbackQuery.data || !ctx.callbackQuery.data.startsWith(TelegrafWidget.PREFIX)) {
        return next()
      }
      const rawPayload = ctx.callbackQuery.data.slice(TelegrafWidget.PREFIX.length)
      let payload
      try {
        payload = JSON.parse(rawPayload)
      } catch (err) {
        console.warn('telegraf-widget: Unknown payload', rawPayload, err)
        return next()
      }
      return ctx.widget.render(payload.w, payload.p, payload.a)
    })
  }

  middleware () {
    return compose([
      (ctx, next) => {
        ctx.widget = new WidgetContext(ctx, this.widgets, this.options)
        return next()
      },
      super.middleware(),
      mount('callback_query', this.handlePageAction())
    ])
  }

  static sendWidget (widgetId, page, args) {
    return (ctx) => ctx.widget.render(widgetId, page, args, true)
  }

  static pageButton (widgetId, text, page, args) {
    const payload = TelegrafWidget.PREFIX + JSON.stringify({
      w: widgetId,
      p: page,
      a: args
    })
    if (payload.length > 64) {
      throw new Error('telegraf-widget: Payload 64 bytes limit exceeded')
    }
    return Markup.callbackButton(text, payload)
  }
}

class Widget extends Router {
  constructor (id) {
    super((ctx) => Promise.resolve({ route: ctx.widget.page }))
    this.id = id
    this.createHandler = passThru()
  }

  pageButton (text, page, args) {
    return TelegrafWidget.pageButton(this.id, text, page, args)
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

TelegrafWidget.PREFIX = '⦒'
module.exports = TelegrafWidget
module.exports.Widget = Widget
