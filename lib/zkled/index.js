'use strict'
var EE = require('events')
var util = require('util')
var SerialPort = require('serialport')

/**
 * 1. 发送帧
 * 2. 接收回应
 */

var dataBuf = Buffer.alloc(2048)
var indexBuf = 0

var STATE_NULL = 0
var STATE_HEAD = 1
var STATE_BODY = 2
var STATE_TAIL = 3
var STATE_CTRL1 = 4
var STATE_CTRL2 = 5
var STATE_CRC1 = 6
var STATE_CRC2 = 7
var STATE_EOF = 8

var state = STATE_NULL
var length = 0

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

LEDPanel.prototype.init = function () {
  var that = this
  console.log('Initialize ', this.portPath, ' with baudrate: ', this.portBaudRate)
  this.port = new SerialPort(this.portPath, {
    baudRate: this.portBaudRate
  })
  this.port.on('open', function () {
    console.log('port opened =>')
    that.bOpen = true
    console.log('bOpen:', that.bOpen)
  })
  this.port.on('error', function (err) {
    console.log('Error:', err)
  })
  this.port.on('close', function () {
    console.log('port closed =>')
    that.bOpen = false
  })
  this.port.on('data', function (data) {
    that.consume(data)
  })
}
LEDPanel.prototype.info = function () {
  console.log('This is LED control.')
}
LEDPanel.prototype.send = function (buf) {
  this.port.write(buf)
}
LEDPanel.prototype.close = function () {
  this.port.close()
}
LEDPanel.prototype.encode = function (text) {
  return Buffer.from(text)
}
LEDPanel.prototype.consume = function (data) {
  for (var i = 0; i < data.length; i++) {
    var d = data[i]
    switch (state) {
      case STATE_NULL:
        if (d === 0xAA) {
          state = STATE_HEAD
        }
        break
      case STATE_HEAD:
        if (d === 0xA5) {
          state = STATE_CTRL1
        } else {
          state = STATE_NULL
          indexBuf = 0
        }
        break
      case STATE_CTRL1:
        dataBuf[indexBuf++] = d
        state = STATE_CTRL2
        break
      case STATE_CTRL2:
        dataBuf[indexBuf++] = d
        state = STATE_BODY
        length = this.getLength(dataBuf[0], dataBuf[1])
        break
      case STATE_BODY:
        dataBuf[indexBuf++] = d
        length--
        if (length === 0) {
          state = STATE_CRC1
        }
        break
      case STATE_CRC1:
        dataBuf[indexBuf++] = d
        state = STATE_CRC2
        break
      case STATE_CRC2:
        dataBuf[indexBuf++] = d
        state = STATE_TAIL
        break
      case STATE_TAIL:
        if (d === 0x5A) {
          state = STATE_EOF
        } else {
          console.log('Wrong packet parsing, STATE_TAIL')
          indexBuf = 0
          state = STATE_NULL
        }
        break
      case STATE_EOF:
        if (d === 0x55) {
          // get out the packet
          var newBuf = Buffer.alloc(indexBuf)
          dataBuf.copy(newBuf, 0, 0, indexBuf)
          this.emit('packet', newBuf)
        } else {
          console.log('Wrong packet parsing, STATE_EOF')
        }
        indexBuf = 0
        state = STATE_NULL
        break
      default:
        throw new Error('port rx impossible state', this.state)
    }
  }
}
LEDPanel.prototype.updateText = function (text, cb) {
  var that = this
  if (!this.bOpen) {
    console.log('port not opened, quit')
    cb(new Error('port not opened', undefined))
    return
  }
  console.log('tx:', text)
  console.log('timeout:', this.PACKET_TIMEOUT)

  this.send(this.encode(text))
  this.on('packet', function (data) {
    console.log('rx packet:')
    clearTimeout(that.handleTimeout)
    that.removeListener('packet', function () {
      console.log('listerner <packet> removed')
    })
    cb(null, data)
  })
  this.handleTimeout = setTimeout(function () {
    cb(new Error('send command timeout'), undefined)
    that.removeListener('packet', function () {
      console.log('listerner <packet> removed')
    })
  }, this.PACKET_TIMEOUT)
}

module.exports = {
  LEDPanel: LEDPanel
}
