const Telegraf = require('telegraf')
const TelegrafWidget = require('../')
const { Markup } = Telegraf
const { Widget, sendWidget } = TelegrafWidget
const fetch = require('node-fetch')

const usersWidget = new Widget('users-widget', 'list')

usersWidget.on('list', async (ctx) => {
  const { page } = ctx.widget.query
  const message = await fetchUsers(page)
  return ctx.widget.data
    ? ctx.reply(message, generateKeyboard(page))
    : ctx.editMessageText(message, generateKeyboard(page))
})

const widgets = new TelegrafWidget()
widgets.register(usersWidget)

const app = new Telegraf(process.env.BOT_TOKEN)
app.use(widgets.middleware())
app.command('start', sendWidget('users-widget'))
app.startPolling()

// Helper functions

async function fetchUsers (page = 1) {
  const users = await fetch(`https://reqres.in/api/users?page=${page}`).then((res) => res.json())
  return users.data.reduce((acc, user) => `${acc}- ${user.first_name} ${user.last_name}\n`, '')
}

function generateKeyboard (page) {
  const currentPage = parseInt(page) || 1
  return Markup.inlineKeyboard(
    Array.from(Array(4))
      .map((i, index) => index + 1)
      .map((index) => {
        const text = currentPage === index ? `(${index})` : `${index}`
        return usersWidget.button(text, 'list', {page: index})
      })
  ).extra()
}
