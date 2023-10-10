// 这个文件放在vue项目中运行哦！

<template>
  <div id="app">
    <p>ws</p>
    <button id="btn">发送</button>
  </div>
</template>

<script>
const ModeCode = {
  // websocket消息类型
  MSG: 'message', // 普通消息
  HEART_BEAT: 'heart_beat' // 心跳
}

export default {
  data() {
    return {
      ws: null,
      webSocketState: false, // webSocket的连接状态
      heartBeat: { // 心跳连接的时间设置
        time: 5 * 1000, // 心跳时间间隔
        timeout: 3 * 1000, // timeout：心跳超时间隔
        reconnect: 10 * 1000 // 断线重连时间
      },
      reconnectTimer: null // 断线重连时间器
    }
  },
  created() {
    this.connect()
  },
  mounted () {
    // 点击发送
    const btn = document.getElementById('btn')
    btn.addEventListener('click', () => {
      this.send()
    })
  },
  methods: {
    send () {
      this.ws.send(
        JSON.stringify({
          ModeCode: ModeCode.MSG,
          msg: '当前时间-' + new Date()
        })
      )
    },
    connect() {
      this.ws = new WebSocket('ws://192.168.4.44:6699') // 填你自己电脑的ip
      this.init()
    },
    init() {
      this.ws.addEventListener('open', () => {
        this.webSocketState = true //socket状态设置为连接，做为后面的断线重连的拦截器
        this.heartBeat && this.heartBeat.time ? this.startHeartBeat(this.heartBeat.time) : '' // 是否启动心跳机制
        console.log('开启')
      })
      this.ws.addEventListener('message', (e) => {
        // console.log(e)
        const data = JSON.parse(e.data)
        switch (data.ModeCode) {
          case ModeCode.MSG: // 普通消息
            console.log('收到消息--' + data.msg)
            break
          case ModeCode.HEART_BEAT: // 心跳
            this.webSocketState = true
            console.log('收到心跳--' + data.msg)
            break
        }
      })
      this.ws.addEventListener('close', () => {
        this.webSocketState = false // socket状态设置为断线
        console.log('断开了连接')
      })
      this.ws.addEventListener('error', () => {
        this.webSocketState = false // socket状态设置为断线
        this.reconnectWebSocket() // 重连
        console.log('连接发生了错误')
      })
    },
    
    // 心跳初始函数  time：心跳时间间隔
    startHeartBeat(time) {
      setTimeout(() => {
        this.ws.send(
          JSON.stringify({
            ModeCode: ModeCode.HEART_BEAT,
            msg: Date.now() // new Date()
          })
        )
        this.waitingServer()
      }, time)
    },

    // 延时等待服务端响应，通过webSocketState判断是否连线成功
    waitingServer() {
      this.webSocketState = false
      setTimeout(() => {
        if (this.webSocketState) {
          this.startHeartBeat(this.heartBeat.time)
          return
        }
        console.log('心跳无响应，已断线')
        try {
          this.ws.close()
        } catch (e) {
          console.log('连接已关闭，无需关闭')
        }
        this.reconnectWebSocket()
      }, this.heartBeat.timeout)
    },

    // 重连操作
    reconnectWebSocket() {
      this.reconnectTimer = setTimeout(() => {
        this.reconnectWs()
      }, this.heartBeat.reconnect) // 10s
    },
    
    reconnectWs() {
      if (!this.ws) {
        // 第一次执行，初始化
        this.connect()
      }
      if (this.ws && this.reconnectTimer) {
        // 防止多个websocket同时执行
        clearTimeout(this.reconnectTimer)
        this.ws.reconnectTimer = null
        this.connect()
      }
    }
  }
}
</script>

<style lang="less">

</style>