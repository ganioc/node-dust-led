'use strict'

var LEDP = require('../lib/zkled').LEDPanel
var FACIL = require('../lib/zkled/facility')
var DEFLED = require('../lib/zkled/defled')

console.log('test text hex code')
var buf = FACIL.concatBuffers(DEFLED.GB.temp,
  DEFLED.GB.comma)

console.log(buf)

buf = FACIL.concatBuffers(
  DEFLED.GB.winddirection,
  DEFLED.GB.comma,
  DEFLED.GB.west
)
console.log(buf)

console.log('Test frame creation')
// 生成一个帧
var led = new LEDP({})
console.log('buffer:', DEFLED.GB.txtAhQi)
led.createTextFrame(DEFLED.GB.txtAhQi, {
  entry: 0x01,
  spentry: 0x14,
  duentry: 0x03E8,
  exit: 0x0
})

led.createTextFrame(DEFLED.GB.txtHefi, {
  entry: 0x02,
  spentry: 0x02,
  duentry: 0x00C8,
  exit: 0x0001
})
