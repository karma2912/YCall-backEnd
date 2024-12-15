require('dotenv').config();
const express = require('express')
const {Server} = require('socket.io')
var cors = require('cors')

const app = express()
app.use(cors())

const io = new Server({
  cors:true
})

app.use(express.json())

const PORT = process.env.PORT || 8001

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
    socket.on("call-accepted",(data)=>{
      const {fromEmail,ans} = data
      const socketId = emailTosocketMapping.get(fromEmail)
      socket.to(socketId).emit("call-accepted",{ans})
    })
    socket.on("ice-candidate",(data)=>{
      socket.broadcast.emit("ice-candidate",data)
    })
  });

io.listen(PORT,()=>{
  console.log(`Port is running on this ${PORT}`)
})