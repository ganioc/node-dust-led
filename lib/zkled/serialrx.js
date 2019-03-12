'use strict'

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

var strState = {
  0: 'null',
  1: 'head',
  2: 'body',
  3: 'tail',
  4: 'ctrl1',
  5: 'ctrl2',
  6: 'crc1',
  7: 'crc2',
  8: 'eof'
}
var state = STATE_NULL
var length = 0

function getLength(b1, b2) {
  console.log('\nget packet length from:', b1, ' ', b2)
  var dataByte = ((b2 << 8) & 0xFFFF) | (b1 & 0xFF)

  console.log(dataByte)

  var bEnableCRC = dataByte & 0b100000000000
  console.log('crc enable:', bEnableCRC !== 0)

  // After CTRL, before CRC
  var dataLen = dataByte & 0b011111111111
  console.log('data length:', dataLen)
  return dataLen
}

function consume(handle, data) {
  for (var i = 0; i < data.length; i++) {
    var d = data[i]
    console.log('[d]', Buffer.from([d]).toString('hex'), 'State:', strState[state]
    )
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
        length = getLength(dataBuf[0], dataBuf[1])
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
          handle.emit('packet', newBuf)
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

module.exports = {
  consume: consume
}
