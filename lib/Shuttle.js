'use strict'

const hid = require('node-hid')
const { usb } = require('usb')
const crypto = require('crypto')
const shuttleDevices = require('./ShuttleDefs')
const EventEmitter = require('events').EventEmitter

const defaultState = {
  buttons: [],
  shuttle: 0,
  jog: 0
}

class Shuttle extends EventEmitter {
  constructor () {
    super()
    this._hid = [];
  }

  start () {
    usb.on('attach', (d) => {
      // Delay connection by 1 second because
      // it takes a second to load on macOS
      setTimeout(() => {
        this._connect()
      }, process.platform === 'darwin' ? 1000 : 0)
    })
    // Find already
    this._connect()
  }

  stop () {
    usb.unrefHotplugEvents()
    if (this._hid.length > 0) {
      this._hid.forEach((device) => {
        device.hid.close()
      })
    }
  }

  getDeviceList () {
    return this._hid.map((device) => {
      return {
        id: device.id,
        path: device.path,
        name: device.def.name,
        hasShuttle: device.def.rules.shuttle !== undefined,
        hasJog: device.def.rules.jog !== undefined,
        numButtons: device.def.buttonMasks.length
      }
    })
  }

  getDeviceById (id) {
    const device = this.getDeviceList().find(ele => ele.id === id)
    return device ? device : null
  }

  getDeviceByPath (path) {
    const device = this.getDeviceList().find(ele => ele.path === path)
    return device ? device : null
  }

  getRawHidDevice (id) {
    const device = this._hid.find(ele => ele.id === id)
    return device ? device.hid : null
  }

  _connect () {
    const foundDevices = []
    const devices = hid.devices()
    shuttleDevices.forEach((deviceDef) => {
      const connectedPaths = this._hid.map(h => h.path)
      const filteredDevices = devices.filter((d) => {
        return d.vendorId === deviceDef.vid && d.productId === deviceDef.pid
                && !connectedPaths.includes(d.path)
      })
      filteredDevices.forEach((device) => {
        try {
          const newHid = new hid.HID(device.path)
          const newId = crypto.createHash('md5').update(device.serialNumber || device.path).digest('hex')
          this._hid.push({
            id: newId,
            hid: newHid,
            def: deviceDef,
            path: device.path,
            state: JSON.parse(JSON.stringify(defaultState))
          })
          foundDevices.push(newId)
        } catch (err) {
          // Ignore
        }
      })
    })

    foundDevices.forEach((foundDevice) => {
      const deviceIdx = this._hid.findIndex(ele => ele.id === foundDevice)
      if (deviceIdx > -1) {
        const device = this._hid[deviceIdx]
        this.emit('connected', {
          id: device.id,
          path: device.path,
          name: device.def.name,
          hasShuttle: device.def.rules.shuttle !== undefined,
          hasJog: device.def.rules.jog !== undefined,
          numButtons: device.def.buttonMasks.length
        })
        device.def.buttonMasks.forEach((ele) => {
          device.state.buttons.push(false)
        })
        device.hid.on('data', (data) => {
          this._updateData(data, device)
        })
        device.hid.on('error', (error) => {
          device.hid.close()
          this._hid.splice(deviceIdx, 1)
          this.emit('disconnected', device.id)
        })
      }
    })
  }

  _updateData (data, device) {
    if (data.length === device.def.packetSize) {
      let shuttle = this._read(data, device.def.rules.shuttle.offset, device.def.rules.shuttle.type)
      let jog = this._read(data, device.def.rules.jog.offset, device.def.rules.jog.type)
      let buttonsRaw = this._read(data, device.def.rules.buttons.offset, device.def.rules.buttons.type)
      if (shuttle !== device.state.shuttle) {
        this.emit('shuttle', shuttle, device.id)
        this.emit('shuttle-trans', device.state.shuttle, shuttle, device.id)
        device.state.shuttle = shuttle
      }
      if (jog !== device.state.jog) {
        let dir = (device.state.jog === 0xff && jog === 0) || (!(device.state.jog === 0 && jog === 0xff) && device.state.jog < jog) ? 1 : -1
        device.state.jog = jog
        this.emit('jog', jog, device.id)
        this.emit('jog-dir', dir, device.id)
      }
      // Treat buttons a little differently. Need to do button up and button down events
      device.def.buttonMasks.forEach((mask, index) => {
        const button = (buttonsRaw & mask)
        if (button && !device.state.buttons[index]) {
          this.emit('buttondown', index + 1, device.id)
        } else if (!button && device.state.buttons[index]) {
          this.emit('buttonup', index + 1, device.id)
        }
        device.state.buttons[index] = button
      })
    }
  }

  _read (data, offset, type) {
    let value = null

    switch (type) {
      case "uint8":
        value = data.readUInt8(offset)
        break
      case "int8":
        value = data.readInt8(offset)
        break
      case "uint16le":
        value = data.readUInt16LE(offset)
        break
      case "int16le":
        value = data.readInt16LE(offset)
        break
      case "uint16be":
        value = data.readUInt16BE(offset)
        break
      case "int16be":
        value = data.readInt16BE(offset)
        break
      case "uint32le":
        value = data.readUInt32LE(offset)
        break
      case "int32le":
        value = data.readInt32LE(offset)
        break
      case "uint32be":
        value = data.readUInt32BE(offset)
        break
      case "int32be":
        value = data.readInt32BE(offset)
        break
      case "uint64le":
        value = data.readBigUInt64LE(offset)
        break
      case "int64le":
        value = data.readBigInt64LE(offset)
        break
      case "uint64be":
        value = data.readUBigInt64BE(offset)
        break
      case "int64be":
        value = data.readBigInt64BE(offset)
        break
    }

    return value
  }
}

module.exports = new Shuttle()
