# led control
## status
- Please properly set the board first (font family, GID,... and save it to the board), because current API only update the text , nothing more

- Update chinese GB2312 code to defled.js file, the program won't transform utf-8 characters; use hex code directly in the program

- font family will determine it's 3 lines display or 4 lines display

## test
Tested on windows 10 , node.js

## API
Refer to index.js

`
LEDPanel.updateText(
  'Hello World\nWorld Peace\n012345678901', // or Buffer instead
    {
      entry: DEFLED.TEXT_PROGRAM.ENTRY.LEFT_RIGHT_SPREAD,
      spentry: 0x02,
      duentry: 0x01f4, // 5 seconds
      exit: 0x0001,
      format: DEFLED.TEXT_PROGRAM.FORMAT.THREE_LINES
    },
    callback
)
`
