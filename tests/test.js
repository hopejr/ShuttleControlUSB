const test = require('tape')
const shuttle = require('../lib/Shuttle')

shuttle.on('connected', (deviceInfo) => {
  console.log('Starting tests')
  test('shuttle test', (t) => {
    t.plan(3)

    t.equal(deviceInfo.hasShuttle, true)
    t.equal(deviceInfo.hasJog, true)
    if (deviceInfo.name === 'ShuttleXpress') {
      t.equal(deviceInfo.numButtons, 5)
    } else if (deviceInfo.name === 'ShuttlePro v1') {
      t.equal(deviceInfo.numButtons === 13)
    } else if (deviceInfo.name === 'ShuttlePro v2') {
      t.equal(deviceInfo.numButtons === 15)
    }
    shuttle.stop()
  })
})

shuttle.start()

console.log('Plug device in')
