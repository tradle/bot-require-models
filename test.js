
const Promise = require('bluebird')
const co = Promise.coroutine
const test = require('tape')
const requireModels = require('./')

test('basic', co(function* (t) {
  const models = [{ id: 'a' }, { id: 'b' }]
  let timesUpdated = 0
  let timesSaved = 0

  const user = {}
  const handlers = []
  const bot = {
    receive: co(function* () {
      // doesn't matter what we're receiving
      for (let i = 0; i < handlers.length; i++) {
        yield handlers[i]({ user })
      }
    }),
    send: co(function* () {
      timesUpdated++
    }),
    users: {
      save: () => timesSaved++
    },
    hook: function (method, handler) {
      if (method === 'receive') {
        handlers.push(handler)
        return () => handlers.filter(h => h !== handler)
      }
    }
  }

  let api = requireModels(models)(bot)
  yield bot.receive()
  t.equal(timesUpdated, 1)
  t.equal(timesSaved, 1)

  yield bot.receive()
  t.equal(timesUpdated, 1)
  t.equal(timesSaved, 1)

  // restart
  api.uninstall()
  yield bot.receive()
  t.equal(timesUpdated, 1)
  t.equal(timesSaved, 1)

  api.uninstall()
  models.push({ id: 'c' })
  api = requireModels(models)(bot)
  yield bot.receive()
  t.equal(timesUpdated, 2)
  t.equal(timesSaved, 2)

  t.end()
}))
