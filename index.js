'use strict'

var LEDPanel = require('./lib/zkled').LEDPanel
var DEFLED = require('./lib/zkled/defled')
var FACILITY = require('./lib/zkled/facility')

var led = new LEDPanel({
  baudRate: 115200,
  // path: '/dev/tty.usbserial',
  path: '\\\\.\\COM14',
  timeout: 3000
})

led.init() // Initialization

function work1() {
  led.updateText(
    'hello world temp\nworld\nand!\npeace 0123456789',
    {
      entry: DEFLED.TEXT_PROGRAM.ENTRY.LEFT_RIGHT_SPREAD,
      spentry: 0x02,
      duentry: 0x01f4, // 5 seconds
      exit: 0x0001,
      format: DEFLED.TEXT_PROGRAM.FORMAT.FOUR_LINES
    },
    function(err, data) {
      if (err) {
        console.log('error:', err)
      } else {
        console.log('rx:', data)
      }
    }
  )
}
// Display temperature, Display wind
// diplay ruff logo
var buf = FACILITY.concatBuffers(DEFLED.GB.temp, Buffer.from(':36.8'))
function work2() {
  led.updateText(
    buf,
    {
      entry: DEFLED.TEXT_PROGRAM.ENTRY.LEFT_RIGHT_SPREAD,
      spentry: 0x02,
      duentry: 0x01f4, // 5 seconds
      exit: 0x0001,
      format: DEFLED.TEXT_PROGRAM.FORMAT.FOUR_LINES
    },
    function(err, data) {
      if (err) {
        console.log('error:', err)
      } else {
        console.log('rx:', data)
      }
    }
  )
}
function work3() {
  led.updateText(
    'hello world temp\nworld\nand!\npeace',
    {
      entry: DEFLED.TEXT_PROGRAM.ENTRY.LEFT_RIGHT_SPREAD,
      spentry: 0x02,
      duentry: 0x01f4, // 5 seconds
      exit: 0x0001,
      format: DEFLED.TEXT_PROGRAM.FORMAT.FOUR_LINES
    },
    function(err, data) {
      if (err) {
        console.log('error:', err)
      } else {
        console.log('rx:', data)
      }
      led.close()
    }
  )
}
function work4() {
  led.updateText(
    'hello world temp\nworld\nand!\npeace',
    {
      entry: DEFLED.TEXT_PROGRAM.ENTRY.LEFT_RIGHT_SPREAD,
      spentry: 0x02,
      duentry: 0x01f4, // 5 seconds
      exit: 0x0001,
      format: DEFLED.TEXT_PROGRAM.FORMAT.FOUR_LINES
    },
    function(err, data) {
      if (err) {
        console.log('error:', err)
      } else {
        console.log('rx:', data)
      }
      led.close()
    }
  )
}
var i = 0

var works = [work1, work2, work3, work4]

function showText(num) {
  works[num]()
}

setInterval(function() {
  showText(i)
  i++
  if (i >= works.length) {
    i = 0
  }
}, 30000)
