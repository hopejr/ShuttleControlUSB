# ShuttleControlUSB [![npm](https://img.shields.io/npm/v/shuttle-control-usb.svg)](https://www.npmjs.com/package/shuttle-control-usb)

A Library to use Contour Design ShuttleXpress and ShuttlePro (v1 and v2) in Node.js projects without the driver. In some markets, these devices are also known as Multimedia Controller Xpress and Multimedia Controller PRO v2.

_This library now supports multiple devices connected at one time (since v1.1.0). This change is backwards compatible and simply includes a hash of the device id for each event as the final parameter in the callback._

## Installation
```sh
npm install shuttle-control-usb
```

## Usage
```javascript
const shuttle = require('shuttle-control-usb');

shuttle.on('connected', (deviceInfo) => {
  console.log('Connected to ' + deviceInfo.name);
});

// Start after 'connect' event listener has been set up
shuttle.start();
```

## API

### Methods
`start()`

Starts the service and monitors USB device connections for ShuttleXPress or ShuttlePro (v1 and v2). It will find all connected devices.

This should be called after the 'connect' event listener has been declared, otherwise already-connected devices will not be detected.


`stop()`

Stops the service and monitoring. This must be called before your script ends.


`getDeviceList()`
Use to retrieve all the devices that are connected.

Returns:
- `deviceList` Array - contains the following information:
  - `id` String - either an MD5 hash of the serial number (if it exists) or the device path, used to distinguish between multiple devices that may be connected at once.
  - `name` String - name of the device ('ShuttleXpress', 'ShuttlePro v1', or 'ShuttlePro v2')
  - `hasShuttle` Boolean
  - `hasJog` Boolean
  - `numButtons` Integer


`getRawHidDevice(id)`
Use to retrieve the raw HID device object for the device identified by id.

Parameters:
- `id` String

Returns:
- `hid` Object - the raw HID device object


### Events
`shuttle.on('...', () => {})`

#### Event: `connected`
Emitted when a device has been plugged into a USB port.

Returns:
- `deviceInfo` Object
  - `id` String - either an MD5 hash of the serial number (if it exists) or the device path, used to distinguish between multiple devices that may be connected at once.
  - `name` String - name of the device ('ShuttleXpress', 'ShuttlePro v1', or 'ShuttlePro v2')
  - `hasShuttle` Boolean
  - `hasJog` Boolean
  - `numButtons` Integer

#### Event: `disconnected`
Emitted when the device has been unplugged or has failed.

Returns:
- `id` String - either an MD5 hash of the serial number (if it exists) or the device path.

#### Event: `shuttle`
Emitted when shuttle data is available from the device.

Returns:
- `value` Integer - Range from -7 to 7 for ShuttleXpress and ShuttlePro (v1 and v2)
- `id` String - either an MD5 hash of the serial number (if it exists) or the device path.

#### Event: `shuttle-trans`
Emitted when shuttle data is available from the device.

Returns:
- `old` Integer
- `new` Integer
- `id` String - either an MD5 hash of the serial number (if it exists) or the device path.

#### Event: `jog`
Emitted when jog data is available from the device.

Returns:
- `value` Integer - Range from 0 to 255 for ShuttleXpress and ShuttlePro (v1 and v2)
- `id` String - either an MD5 hash of the serial number (if it exists) or the device path.

#### Event: `jog-dir`
Emitted when jog data is available from the device.

Returns:
- `dir` Integer - Either 1 (clockwise) or -1 (counter-clockwise)
- `id` String - either an MD5 hash of the serial number (if it exists) or the device path.

#### Event: `buttondown`
Emitted when a button is pressed on the device.

Returns:
- `button` Integer - the button number
- `id` String - either an MD5 hash of the serial number (if it exists) or the device path.

#### Event: `buttonup`
Emitted when a button is released on the device.

Returns:
- `button` Integer - the button number
- `id` String - either an MD5 hash of the serial number (if it exists) or the device path.


## Linux Note
By default, the udev system adds ShuttleXpress, ShuttlePro V1, and ShuttlePro V2 as root only access. To fix this, you need to copy 99-Shuttle.rules to:
```
/etc/udev/rules.d
```
Then reboot your computer.


## Licence
MIT

