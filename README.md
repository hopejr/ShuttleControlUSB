# ShuttleControlUSB

_A Library to use Contour Design ShuttleXpress and ShuttlePro v2 in Node.js projects without the driver. Works on Linux too!_

## Installation
```sh
npm install --save shuttle-control-usb
```

## Usage
```javascript
const shuttle = require('shuttle-control-usb');

shuttle.on('connected', (deviceInfo) => {
  console.log('Connected to ' + deviceInfo.name);
});

// Start after 'connect' event listener have been set up
shuttle.start();
```

## API

### Methods
`start()`

Starts the service and monitors USB device connections for ShuttleXPress or ShuttlePro v2. It will find the first device connected. Only one device is supported at a time.

This should be called after the 'connect' event listener has been declared, otherwise already-connected devices will not be detected.


`stop()`

Stops the service and monitoring. This must be called before your script ends.

### Events
shuttle.on('...', () => {})

#### Event: `connected`
Emitted when a device has been plugged into a USB port.

Returns:
- `deviceInfo` Object
  - `name` String - name of the device ('ShuttleXpress' or 'ShuttlePro v2')
  - `hasShuttle` Boolean
  - `hasJog` Boolean
  - `numButtons` Integer

#### Event: `disconnected`
Emitted when the device has been unplugged or has failed.

#### Event: `shuttle`
Emitted when shuttle data is available from the device.

Returns:
- `value` Integer - Range from -7 to 7 for ShuttleXpress and ShuttlePro v2

#### Event: `shuttle-trans`
Emitted when shuttle data is available from the device.

Returns:
- `value` Integer - Range from -7 to 7 for ShuttleXpress and ShuttlePro v2

#### Event: `jog`
Emitted when jog data is available from the device.

Returns:
- `value` Integer - Range from 0 to 255 for ShuttleXpress and ShuttlePro v2

#### Event: `jog-dir`
Emitted when jog data is available from the device.

Returns:
- `dir` Integer - Either 1 (clockwise) or -1 (counter-clockwise)

#### Event: `buttondown`
Emitted when a button is pressed on the device.

Returns:
- `button` Integer - the button number

#### Event: `buttonup`
Emitted when a button is released on the device.

Returns:
- `button` Integer - the button number


## Licence
MIT

