const Telegraf = require('telegraf')
const TelegrafWidget = require('../')
const { Extra, Markup } = Telegraf
const { Widget, sendWidget } = TelegrafWidget

const games = [
  {id: 1, title: 'Game one', description: 'Long description...'},
  {id: 2, title: 'Game two', description: 'Long description...'},
  {id: 3, title: 'Game three', description: 'Long description...'},
  {id: 4, title: 'Game four', description: 'Long description...'},
  {id: 5, title: 'Game five', description: 'Long description...'},
  {id: 6, title: 'Game six', description: 'Long description...'}
]

// Games widget
const gamesWidget = new Widget('games')

gamesWidget.create((ctx) => {
  const buttons = games.map((game) => gamesWidget.pageButton(game.title, 'menu', game.id))
  const extra = Markup.inlineKeyboard(buttons, {columns: 2}).extra()
  return ctx.reply('Choose a game:', extra)
})

gamesWidget.on('list', (ctx) => {
  const buttons = games.map((game) => gamesWidget.pageButton(game.title, 'menu', game.id))
  const extra = Markup.inlineKeyboard(buttons, {columns: 2}).extra()
  return ctx.editMessageText('Ok\nChoose a game:', extra)
})

gamesWidget.on('menu', (ctx) => {
  const game = games.find((game) => game.id === ctx.widget.args)
  if (!game) {
    return ctx.widget.switchTo('list')
  }
  const text = `
    *${game.title}*
    **${game.description}**
  `
  const extra = Extra.markup(Markup.inlineKeyboard([gamesWidget.pageButton('Go back', 'list')])).markdown()
  return ctx.editMessageText(text, extra)
})

const widgets = new TelegrafWidget()
widgets.register(gamesWidget)

const app = new Telegraf(process.env.BOT_TOKEN)
app.use(Telegraf.memorySession())
app.use(widgets.middleware())
app.command('mygames', sendWidget('games', 'list'))
app.on('message', (ctx) => ctx.reply('Try /mygames'))
app.startPolling()
