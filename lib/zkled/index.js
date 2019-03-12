'use strict'
var EE = require('events')
var util = require('util')
var SerialPort = require('serialport')
var facility = require('./facility')
var frame = require('./serialrx')
var defled = require('./defled')

// var ZKLED = require('./defled')
// var textprog = ZKLED.TEXT_PROGRAM

/// Class LEDPanel
function LEDPanel(options) {
  EE.call(this)
  this.port = null
  this.portBaudRate = options.baudRate ? options.baudRate : 115200
  this.portPath = options.path ? options.path : '/No/port/path'
  this.PACKET_TIMEOUT = options.timeout ? options.timeout : 5000
  this.bOpen = false
  this.handleTimeout = null
}

util.inherits(LEDPanel, EE)

LEDPanel.prototype.init = function() {
  var that = this
  console.log(
    'Initialize ',
    this.portPath,
    ' with baudrate: ',
    this.portBaudRate
  )
  this.port = new SerialPort(this.portPath, {
    baudRate: this.portBaudRate
  })
  this.port.on('open', function() {
    console.log('port opened =>')
    that.bOpen = true
    console.log('bOpen:', that.bOpen)
  })
  this.port.on('error', function(err) {
    console.log('Error:', err)
  })
  this.port.on('close', function() {
    console.log('port closed =>')
    that.bOpen = false
  })
  this.port.on('data', function(data) {
    that.consume(data)
  })
}
LEDPanel.prototype.info = function() {
  console.log('This is LED control.')
}
LEDPanel.prototype.send = function(buf) {
  this.port.write(buf)
}
LEDPanel.prototype.close = function() {
  this.port.close()
}

// basic command
LEDPanel.prototype.createParams = function() {}

LEDPanel.prototype.createHead = function() {}

LEDPanel.prototype.createTail = function() {}

// create text params, return Buffer
LEDPanel.prototype.createTextParams = function(text, options) {
  if (!text) {
    throw new Error('Empty input for createTextParams')
  }
  console.log('\ncreateTextParams')

  // 2 bytes
  var WID = 0x0001 // 0xFFFF
  var bufWID = Buffer.alloc(2)
  bufWID.writeUInt16LE(WID)

  var REV = 0x0
  var bufREV = Buffer.alloc(2)
  bufREV.writeUInt16LE(REV)

  // 4 bytes, 是否要设置成为临时节目呢？
  var STYLE = 0x02
  var bufSTYLE = facility.uintToBuffer4(STYLE)

  // 4 bytes
  var FORMAT = options.format ? options.format : 0x0100 // 0x00
  var bufFORMAT = facility.uintToBuffer4(FORMAT)

  // 2 bytes
  var ENTRY = options.entry ? options.entry : 0x0001 // 立即显示0x000A
  var bufENTRY = facility.uintToBuffer2(ENTRY)

  // 2 bytes
  var SPENTRY = options.spentry ? options.spentry : 0x0014 // 0x0014 // 0x20
  var bufSPENTRY = facility.uintToBuffer2(SPENTRY)

  var DUENTRY = options.duentry ? options.duentry : 0x03e8 // 0x03E8 // 0x200
  var bufDUENTRY = facility.uintToBuffer2(DUENTRY)

  // 2 bytes
  var HIGHLIGHT = 0x0
  var bufHIGHLIGHT = facility.uintToBuffer2(HIGHLIGHT)

  var SPHL = 0x0
  var bufSPHL = facility.uintToBuffer2(SPHL)

  var DUHL = 0x0
  var bufDUHL = facility.uintToBuffer2(DUHL)

  var EXIT = options.exit ? options.exit : 0x0
  var bufEXIT = facility.uintToBuffer2(EXIT)

  var SPEXIT = 0x0014 // 0x0
  var bufSPEXIT = facility.uintToBuffer2(SPEXIT)

  var TIMES = 0xffff
  var bufTIMES = facility.uintToBuffer2(TIMES)

  var CNT = text.length
  var bufCNT = facility.uintToBuffer2(CNT)

  var bufText = Buffer.from(text)

  var buf = facility.concatBuffers(
    bufWID,
    bufREV,
    bufSTYLE,
    bufFORMAT,
    bufENTRY,
    bufSPENTRY,
    bufDUENTRY,
    bufHIGHLIGHT,
    bufSPHL,
    bufDUHL,
    bufEXIT,
    bufSPEXIT,
    bufTIMES,
    bufCNT,
    bufText
  )
  console.log('params:')
  // console.log(buf)
  facility.printBuffer(buf)
  console.log('')
  return buf
}
LEDPanel.prototype.createTextHead = function(dataLen) {
  console.log('\ncreateTextHead, len:' + dataLen)
  // 2 bytes
  var SF = 0xa5aa
  var bufSF = facility.uintToBuffer2(SF)

  var CTRL = 0x00 | dataLen
  var bufCTRL = facility.uintToBuffer2(CTRL)

  var DES = 0xffff // 0x00
  var bufDES = facility.uintToBuffer2(DES)

  var SRC = 0x00
  var bufSRC = facility.uintToBuffer2(SRC)

  var TID = 0xa1b0 // 0x0
  var bufTID = facility.uintToBuffer2(TID)

  var CMD = 0x0310
  var bufCMD = facility.uintToBuffer2(CMD)

  var buf = facility.concatBuffers(
    bufSF,
    bufCTRL,
    bufDES,
    bufSRC,
    bufTID,
    bufCMD
  )
  console.log('text head: ')
  console.log(buf)
  console.log('')
  return buf
}
LEDPanel.prototype.createTextTail = function(bufHead, bufParams) {
  console.log('\ncreateTextTail')
  var CRC = 0x00 // this.calculateCRC(bufHead, bufParams)
  var bufCRC = facility.uintToBuffer2(CRC)
  var EOF = 0x555a
  var bufEOF = facility.uintToBuffer2(EOF)

  var buf = facility.concatBuffers(bufCRC, bufEOF)
  console.log('buf:')
  console.log(buf)
  console.log('')

  return buf
}
/**
 * dataHead - SF CTRL DES SRC TID CMD
 * dataCmd  - X // 命令内容
 * dataTail - CRC EF
 */
LEDPanel.prototype.createTextFrame = function(text, options) {
  console.log('\ncreateTextFrame')
  // X
  var dataParams = this.createTextParams(text, options)
  var dataLen = dataParams.length + 8
  // SF, CTRL, DES, SRC, TID, CMD
  var dataHead = this.createTextHead(dataLen)
  // CRC EF
  var dataTail = this.createTextTail(dataHead, dataParams)

  var buf = facility.concatBuffers(dataHead, dataParams, dataTail)

  console.log('createTextFrame ->')
  // console.log(util.inspect(buf))
  facility.printBuffer(buf)

  return buf
}
// return an UINT number
LEDPanel.prototype.calculateCRC = function(buf) {
  return facility.calculateCRC(buf)
}
LEDPanel.prototype.consume = function(data) {
  console.log('Consume:', data)
  frame.consume(this, data)
}
LEDPanel.prototype.updateText = function(text, options, cb) {
  var that = this
  if (!this.bOpen) {
    console.log('port not opened, quit')
    cb(new Error('port not opened', undefined))
    return
  }
  console.log('\ntx:', text)
  console.log('timeout:', this.PACKET_TIMEOUT)

  this.send(this.createTextFrame(text, options))

  this.on('packet', function(data) {
    console.log('\nrx packet:')
    clearTimeout(that.handleTimeout)
    that.removeListener('packet', function() {
      console.log('listerner <packet> removed')
    })
    var objParsed = facility.parsePacket(data)

    if (objParsed.result) {
      cb(null, data)
    } else {
      cb(new Error(objParsed.result.toString('hex')))
    }
  })
  this.handleTimeout = setTimeout(function() {
    cb(new Error('send command timeout'), undefined)
    that.removeListener('packet', function() {
      console.log('listerner <packet> removed')
    })
  }, this.PACKET_TIMEOUT)
}

module.exports = {
  LEDPanel: LEDPanel
}
