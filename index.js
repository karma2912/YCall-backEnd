const express = require('express')
const {Server} = require('socket.io')
var cors = require('cors')

const app = express()

app.use(cors({
  origin: 'https://willowy-malabi-f91a5d.netlify.app', // Your frontend URL
  methods: ['GET', 'POST'],
  credentials: true // Optional: include if using credentials
}));

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
      console.log("Hello from call-acceptedd")
      const {fromEmail,ans} = data
      console.log(fromEmail)
      const socketId = emailTosocketMapping.get(fromEmail)
      console.log(socketId)
      socket.to(socketId).emit("call-accepted",{ans})
    })
  });
app.listen(8000,()=>{
    console.log("App is listening in port 8000")
})
io.listen(8001)