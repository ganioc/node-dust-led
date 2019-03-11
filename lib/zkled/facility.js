'use strict'


function uintToBuffer(intNum, size) {
  var buf = Buffer.alloc(size)
  switch (size) {
    case 2:
      buf.writeUInt16LE(intNum)
      break
    case 4:
      buf.writeUInt32LE(intNum)
      break
    default:
      throw new Error('Wrong uintToBuffer size:' + size)
  }
  return buf
}

function uintToBuffer2(intNum) {
  return uintToBuffer(intNum, 2)
}

function uintToBuffer4(intNum) {
  return uintToBuffer(intNum, 4)
}
// return a Buffer
function concatBuffers() {
  var len = 0

  for (var i = 0; i < arguments.length; i++) {
    len += arguments[i].length
  }
  var buf = Buffer.alloc(len)

  len = 0
  for (var j = 0; j < arguments.length; j++) {
    arguments[j].copy(buf, len, 0, arguments[j].length)
    len += arguments[j].length
  }
  return buf
}
// return a number
function calculateCRC(buf) {
  // var len = buf.length
  var crc = 0xffff

  for (var i = 0; i < buf.len; i++) {
    crc = (crc ^ buf[i]) & 0xffff
    for (var j = 0; j < 8; j++) {
      if ((crc & 0x0001) > 0) {
        crc = (((crc >> 1) & 0xffff) ^ 0x8408) & 0xffff
      } else {
        crc = (crc >> 1) & 0xffff
      }
    }
  }
  return crc
}

module.exports = {
  uintToBuffer2: uintToBuffer2,
  uintToBuffer4: uintToBuffer4,
  concatBuffers: concatBuffers,
  calculateCRC: calculateCRC
}
