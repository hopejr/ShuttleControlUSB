'use strict'

module.exports = [
  {
    name: 'ShuttleXpress',
    vendor: 'Contour Design, Inc.',
    vid: 0x0b33,
    did: 0x0020,
    packetSize: 5,
    rules: {
      shuttle: {
        offset: 0,
        type: "int8"
      },
      jog: {
        offset: 1,
        type: "uint8"
      },
      buttons: {
        offset: 3,
        type: "uint16le"
      }
    },
    buttonMasks: [0x0010, 0x0020, 0x0040, 0x0080, 0x0100]
  },
  {
    name: 'ShuttlePro v2',
    vendor: 'Contour Design, Inc.',
    vid: 0x0b33,
    did: 0x0030,
    packetSize: 5,
    rules: {
      shuttle: {
        offset: 0,
        type: "int8"
      },
      jog: {
        offset: 1,
        type: "uint8"
      },
      buttons: {
        offset: 3,
        type: "uint16le"
      }
    },
    buttonMasks: [0x0001, 0x0002, 0x0004, 0x0008, 0x0010, 0x0020, 0x0040, 0x0080, 0x0100, 0x0200, 0x0400, 0x0800, 0x1000, 0x2000, 0x4000]
  },
  {
    name: 'ShuttlePro v1',
    vendor: 'Contour Design, Inc.',
    vid: 0x0b33,
    did: 0x0010,
    packetSize: 5,
    rules: {
      shuttle: {
        offset: 0,
        type: "int8"
      },
      jog: {
        offset: 1,
        type: "uint8"
      },
      buttons: {
        offset: 3,
        type: "uint16le"
      }
    },
    buttonMasks: [0x0001, 0x0002, 0x0004, 0x0008, 0x0010, 0x0020, 0x0040, 0x0080, 0x0100, 0x0200, 0x0400, 0x0800, 0x1000, 0x2000, 0x4000]
  }
]
