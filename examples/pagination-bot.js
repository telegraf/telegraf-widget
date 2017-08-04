const Telegraf = require('telegraf')
const TelegrafWidget = require('../')
const { Markup } = Telegraf
const { Widget, sendWidget } = TelegrafWidget
const fetch = require('node-fetch')

function fetchUsers (page = 1) {
  return fetch(`https://reqres.in/api/users?page=${page}`).then((res) => res.json())
}

function generateMessage (users) {
  return users.reduce((acc, user) => `${acc}- ${user.first_name} ${user.last_name}\n`, '')
}

function generateKeyboard (page = 1) {
  return Markup.inlineKeyboard(
    Array
      .from(Array(4))
      .map((i, index) => index + 1)
      .map((index) => {
        const text = page === index ? `(${index})` : `${index}`
        return usersWidget.button(text, 'list', {page: index})
      })
  ).extra()
}

const usersWidget = new Widget('users-widget')

usersWidget.create((ctx) => {
  return fetchUsers().then((users) =>
    ctx.reply(generateMessage(users.data), generateKeyboard())
  )
})

usersWidget.on('list', (ctx) => {
  const { page } = ctx.widget.query
  return fetchUsers(page).then((users) =>
    ctx.editMessageText(generateMessage(users.data), generateKeyboard(parseInt(page)))
  )
})

const widgets = new TelegrafWidget()
widgets.register(usersWidget)

const app = new Telegraf(process.env.BOT_TOKEN, {username: 'tlgrfbot'})
app.use(Telegraf.memorySession())
app.use(widgets.middleware())
app.command('start', sendWidget('users-widget'))
app.startPolling()
