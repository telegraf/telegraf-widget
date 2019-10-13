const Telegraf = require('telegraf')
const TelegrafWidget = require('../')
const { Extra, Markup } = Telegraf
const { Widget, sendWidget } = TelegrafWidget

const booksDB = [
  { id: '1', title: 'Book one', description: 'Book one description...' },
  { id: '2', title: 'Book two', description: 'Book two description...' },
  { id: '3', title: 'Book three', description: 'Book three description...' },
  { id: '4', title: 'Book four', description: 'Book four description...' },
  { id: '5', title: 'Book five', description: 'Book five description...' },
  { id: '6', title: 'Book six', description: 'Book six description...' }
]

const booksWidget = new Widget('mybooks', 'list')

booksWidget.on('list', ({ reply, editMessageText, widget }) => {
  const buttons = booksDB.map((book) => booksWidget.button(book.title, 'short-info', book.id))
  const extra = Markup.inlineKeyboard(buttons, { columns: 2 }).extra()
  return widget.data
    ? editMessageText('Ok\nChoose a book:', extra)
    : reply('Ok\nChoose a book:', extra)
})

booksWidget.on('short-info', (ctx) => {
  const book = booksDB.find((book) => book.id === ctx.widget.query)
  if (!book) {
    return ctx.widget.switchTo('list')
  }
  const text = `*${book.title}*`
  const extra = Extra.markup(Markup.inlineKeyboard([
    booksWidget.button('Show full info', 'full-info', ctx.widget.query),
    booksWidget.button('Go back', 'list')
  ])).markdown()
  return ctx.editMessageText(text, extra)
})

booksWidget.on('full-info', (ctx) => {
  const book = booksDB.find((book) => book.id === ctx.widget.query)
  if (!book) {
    return ctx.widget.switchTo('list')
  }
  const text = `
    *${book.title}*
    **${book.description}**
  `
  const extra = Extra.markdown().markup(Markup.inlineKeyboard([
    booksWidget.button('Show short info', 'short-info', ctx.widget.query),
    booksWidget.button('Go go books list', 'list')
  ], { columns: 1 }))
  return ctx.editMessageText(text, extra)
})

const widgets = new TelegrafWidget([booksWidget])

const app = new Telegraf(process.env.BOT_TOKEN)
app.use(widgets.middleware())
app.command('start', sendWidget('mybooks'))
app.startPolling()
