'use strict'

var LEDPanel = require('./lib/zkled').LEDPanel

console.log('Hello')

var led = new LEDPanel({
  baudRate: 115200,
  path: '/dev/tty.usbserial',
  timeout: 3000
})

led.init() // Initialization
led.info()

function work() {
  led.updateText('hello', function (err, data) {
    if (err) {
      console.log('error:', err)
    } else {
      console.log('rx: ', data)
    }
    led.close()
  })
}

setTimeout(function () {
  work()
}, 5000)
