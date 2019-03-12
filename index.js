'use strict'

var LEDPanel = require('./lib/zkled').LEDPanel
var DEFLED = require('./lib/zkled/defled')
var FACILITY = require('./lib/zkled/facility')

var led = new LEDPanel({
  baudRate: 115200,
  // path: '/dev/tty.usbserial',
  path: '\\\\.\\COM14',
  timeout: 3000,
  port: '' // put your port object here
})

led.init() // Initialization

function work1() {
  led.updateText(
    'Hello World\nWorld Peace\n012345678901', {
      entry: DEFLED.TEXT_PROGRAM.ENTRY.LEFT_RIGHT_SPREAD,
      spentry: 0x02,
      duentry: 0x01f4, // 5 seconds
      exit: 0x0001,
      format: DEFLED.TEXT_PROGRAM.FORMAT.THREE_LINES
    },
    function (err, data) {
      if (err) {
        console.log('error:', err)
      } else {
        console.log('\nrx:', data)
      }
    }
  )
}
// Display temperature, Display wind
// diplay ruff logo
var buf2 = FACILITY.concatBuffers(
  DEFLED.GB.temp,
  Buffer.from(':36.8'),
  DEFLED.GB.degree,
  DEFLED.GB.cr,
  DEFLED.GB.east,
  DEFLED.GB.wind,
  Buffer.from('-'),
  DEFLED.GB.windstrength,
  Buffer.from(':5'),
  DEFLED.GB.level,
  DEFLED.GB.cr,
  Buffer.from('God bless you!'),
  DEFLED.GB.cr,
  Buffer.from('Nanchao.org')
)

function work2() {
  led.updateText(
    buf2, {
      entry: DEFLED.TEXT_PROGRAM.ENTRY.LEFT_RIGHT_SPREAD,
      spentry: 0x02,
      duentry: 0x01f4, // 5 seconds
      exit: 0x0001,
      format: DEFLED.TEXT_PROGRAM.FORMAT.FOUR_LINES
    },
    function (err, data) {
      if (err) {
        console.log('error:', err)
      } else {
        console.log('\nrx:', data)
      }
    }
  )
}
var buf3 = FACILITY.concatBuffers(
  DEFLED.GB.txtNanchao,
  DEFLED.GB.cr,
  DEFLED.GB.txtCompany,
  DEFLED.GB.cr,
  Buffer.from('2019-3-12')
)

function work3() {
  led.updateText(
    buf3, {
      entry: DEFLED.TEXT_PROGRAM.ENTRY.ENTER_TO_LEFT,
      spentry: 0x02,
      duentry: 0x01f4, // 5 seconds
      exit: 0x0001,
      format: DEFLED.TEXT_PROGRAM.FORMAT.THREE_LINES
    },
    function (err, data) {
      if (err) {
        console.log('error:', err)
      } else {
        console.log('\nrx:', data)
      }
    }
  )
}

var i = 0

var works = [work1, work2, work3]

function showText() {
  works[i]()
}

setTimeout(function () {
  showText()
  i++
}, 5000)

setInterval(function () {
  showText()
  i++
  if (i >= works.length) {
    i = 0
  }
}, 30000)
