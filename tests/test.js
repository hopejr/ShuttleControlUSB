const test = require('tape')
const shuttle = require('../lib/Shuttle')

shuttle.on('connected', (deviceInfo) => {
  console.log('Starting tests')
  console.log('Connected', deviceInfo.id, deviceInfo.path, deviceInfo.name)
  test('shuttle test', (t) => {
    t.plan(9)

    t.equal(deviceInfo.hasShuttle, true)
    t.equal(deviceInfo.hasJog, true)
    if (deviceInfo.name === 'ShuttleXpress') {
      t.equal(deviceInfo.numButtons, 5)
    } else if (deviceInfo.name === 'ShuttlePro v1') {
      t.equal(deviceInfo.numButtons, 13)
    } else if (deviceInfo.name === 'ShuttlePro v2') {
      t.equal(deviceInfo.numButtons, 15)
    }
    t.deepEqual(shuttle.getDeviceById(deviceInfo.id), deviceInfo)
    t.equal(shuttle.getDeviceById("foo"), null)
    t.deepEqual(shuttle.getDeviceByPath(deviceInfo.path), deviceInfo)
    t.equal(shuttle.getDeviceByPath("/foo/bar"), null)
    // TODO(Peter): Check the presence of some fields here?
    t.notLooseEqual(shuttle.getRawHidDevice(deviceInfo.id), null)
    t.equal(shuttle.getRawHidDevice("foo"), null)
    console.log('Unplug device')
  })
})

shuttle.on('disconnected', (id) => {
  console.log('Disconnected', id)
  if (shuttle.getDeviceList().length === 0) {
    console.log('Testing complete')
    shuttle.stop()
  }
})

shuttle.on('buttonup', (button, id) => {
  console.log('Shuttle button up', button, id)
})

shuttle.start()

if (shuttle.getDeviceList().length === 0) {
  console.log('Plug device in')
}
