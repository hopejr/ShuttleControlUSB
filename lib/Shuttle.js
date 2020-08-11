'use strict'

const hid = require('node-hid')
const usbDetect = require('usb-detection')
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
    this._connected = false
    this._hid = null;
    this._state = JSON.parse(JSON.stringify(defaultState))
  }

  start () {
    if (!this._connected) {
      usbDetect.startMonitoring()
      usbDetect.on('add', (d) => {
        // Delay connection by 1 second because
        // it takes a second to load on macOS
        setTimeout(() => {
          this._connect()
        }, process.platform === 'darwin' ? 1000 : 0)
      })
      // Find already
      this._connect()
    }
  }

  stop () {
    if (this._connected) {
      usbDetect.stopMonitoring()
      if (this._hid !== null) {
        this._hid.close()
        this._hid = null
      }
      this._connected = false
    }
  }

  _connect () {
    if (this._hid === null) {
      let foundDevice = null
      shuttleDevices.forEach((device) => {
        if (foundDevice === null) {
          try {
            this._hid = new hid.HID(device.vid, device.did)
            foundDevice = device
          } catch (err) {
            // Ignore
          }
        }
      })

      if (this._hid !== null) {
        this._connected = true

        this.emit('connected', {
          name: foundDevice.name,
          hasShuttle: foundDevice.rules.shuttle !== undefined,
          hasJog: foundDevice.rules.jog !== undefined,
          numButtons: foundDevice.buttonMasks.length
        })
        foundDevice.buttonMasks.forEach((ele) => {
          this._state.buttons.push(false)
        })
        this._hid.on('data', (data) => {
          this._updateData(data, foundDevice)
        })
        this._hid.on('error', (error) => {
          this._hid.close()
          this._hid = null
          this.emit('disconnected')
          this._state = JSON.parse(JSON.stringify(defaultState))
          this._connected = false
        })
      }
    }
  }

  _updateData (data, device) {
    if (data.length === device.packetSize) {
      let shuttle = this._read(data, device.rules.shuttle.offset, device.rules.shuttle.type)
      let jog = this._read(data, device.rules.jog.offset, device.rules.jog.type)
      let buttonsRaw = this._read(data, device.rules.buttons.offset, device.rules.buttons.type)
      if (shuttle !== this._state.shuttle) {
        this.emit('shuttle', shuttle)
        this.emit('shuttle-trans', this._state.shuttle, shuttle)
        this._state.shuttle = shuttle
      }
      if (jog !== this._state.jog) {
        let dir = (this._state.jog === 0xff && jog === 0) || (!(this._state.jog === 0 && jog === 0xff) && this._state.jog < jog) ? 1 : -1
        this._state.jog = jog
        this.emit('jog', jog)
        this.emit('jog-dir', dir)
      }
      // Treat buttons a little differently. Need to do button up and button down events
      device.buttonMasks.forEach((mask, index) => {
        const button = (buttonsRaw & mask)
        if (button && !this._state.buttons[index]) {
          this.emit('buttondown', index + 1)
        } else if (!button && this._state.buttons[index]) {
          this.emit('buttonup', index + 1)
        }
        this._state.buttons[index] = button
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
