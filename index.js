const express = require('express')
const {Server} = require('socket.io')
var cors = require('cors')

const app = express()
app.use(cors())

const io = new Server({
  cors:true
})

app.use(express.json())

const emailTosocketMapping = new Map()

const socketToEmailMapping = new Map()

io.on("connection", (socket) => {
    socket.on("join-team",(data)=>{
      const {roomId,emailId} = data
      console.log("A new user has connected with emailID:",emailId,"in roomId:",roomId)
      emailTosocketMapping.set(emailId,socket.id)
      socketToEmailMapping.set(socket.id,emailId)
      socket.emit('joined-room',roomId)
      socket.join(roomId)
      socket.broadcast.to(roomId).emit("user-joined",{emailId})
    })
    socket.on('call-user',(data)=>{
      const {emailId,offer} = data
      const socketId = emailTosocketMapping.get(emailId)
      const fromEmail = socketToEmailMapping.get(socket.id)
      socket.to(socketId).emit("incoming-call",{fromEmail, offer})
    })
    socket.on("call-acceptedd",(data)=>{
      const {fromEmail,ans} = data
      const socketId = emailTosocketMapping.get(fromEmail)
      socket.to(socketId).emit("call-accepted",{ans})
    })
    socket.on("send-ice-candidate",(data)=>{
      const {candidate} = data 
      console.log("These are the candidates of peer 1 in peer 2",candidate)
      socket.emit("receive-ice-candidate",candidate)
    })
    socket.on("peer2-candidate",(data)=>{
      const {candidate} = data 
      console.log("These are the candidates of peer 2 in peer 1",candidate)
    })
  });
app.listen(8000,()=>{
    console.log("App is listening in port 8000")
})
io.listen(8001)