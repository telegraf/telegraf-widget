const { Composer, Markup, optional, compose, lazy, passThru, mount } = require('telegraf')
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

  actionMiddleware () {
    return optional((ctx) => ctx.callbackQuery.data && ctx.callbackQuery.data.startsWith(TelegrafWidget.PREFIX), lazy((ctx) => {
      const rawPayload = ctx.callbackQuery.data.slice(TelegrafWidget.PREFIX.length)
      let payload
      try {
        payload = JSON.parse(rawPayload)
      } catch (err) {
        console.warn('telegraf-widget: Unknown payload', rawPayload, err)
        return passThru()
      }
      return ctx.widget.makeHandler(payload.w, payload.a, payload.p)
    }))
  }

  middleware () {
    return compose([
      (ctx, next) => {
        ctx.widget = new WidgetContext(ctx, this.widgets, this.options)
        return next()
      },
      super.middleware(),
      mount('callback_query', this.actionMiddleware())
    ])
  }

  static sendWidget (widgetId, action, args) {
    return lazy((ctx) => ctx.widget.makeHandler(widgetId, action, args, true))
  }

  static cbButton (widgetId, text, action, args) {
    const payload = TelegrafWidget.PREFIX + JSON.stringify({
      w: widgetId,
      a: action,
      p: args
    })
    if (payload.length > 64) {
      throw new Error('telegraf-widget: Payload 64 bytes limit exceeded')
    }
    return Markup.callbackButton(text, payload)
  }
}

TelegrafWidget.PREFIX = '⦒'
module.exports = TelegrafWidget
