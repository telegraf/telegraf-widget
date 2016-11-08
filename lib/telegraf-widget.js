const { Composer, Markup, optional, compose, mount } = require('telegraf')
const url = require('url')
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
    this.widgets.set(widget.id.toLowerCase(), widget)
    return this
  }

  handlePageAction () {
    return optional((ctx, next) => {
      if (!ctx.callbackQuery.data || !ctx.callbackQuery.data.startsWith(TelegrafWidget.PROTOCOL)) {
        return next()
      }
      let data
      try {
        data = url.parse(ctx.callbackQuery.data, true)
      } catch (err) {
        console.warn('telegraf-widget: Unknown payload', data, err)
        return next()
      }
      return ctx.widget.render(data.hostname, data.pathname.slice(1), data.query)
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

  static sendWidget (widgetId, query) {
    return (ctx) => ctx.widget.render(widgetId, null, query, true)
  }

  static button (widgetId, text, page, query) {
    const payload = url.format({
      protocol: TelegrafWidget.PROTOCOL,
      hostname: widgetId,
      pathname: page,
      query: query,
      slashes: true
    })
    if (payload.length > 64) {
      throw new Error('telegraf-widget: 64 bytes payload limit exceeded')
    }
    return Markup.callbackButton(text, payload)
  }
}

TelegrafWidget.PROTOCOL = 'tfw:'

module.exports = TelegrafWidget
