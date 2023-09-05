const { WebSocketServer } = require('ws')

const wsServer = new WebSocketServer({ port: 6699 })

wsServer.on('connection', ws => {
  ws.on('message', e => {
    const data = JSON.parse(e)
    // console.log('S收到了---', e.toString())

    setTimeout(() => {
      if (data.ModeCode === 'message') {
        ws.send(e.toString())
        console.log('S收到消息：'+ data.msg)
      } else if(data.ModeCode === 'heart_beat') {
        ws.send(e.toString())
        console.log(`S收到心跳：${data.msg}`)
      }
    }, 1000)
  })
})