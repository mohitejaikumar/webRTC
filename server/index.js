import express  from 'express';
import { Server } from 'socket.io';

const expressPort = 3000;

const app = express();
const io = new Server(8000,{
    cors: true,
});

app.use(express.json());

const eamiltoSocketId = new Map();
const socketIdtoEmail = new Map();

io.on('connection',(socket)=>{
    console.log("socket connection " + socket.id );
    socket.on('room:join',(data)=>{
        const {email , roomId} = data;
        eamiltoSocketId.set(email,socket.id);
        socketIdtoEmail.set(socket.id , email);
        io.to(roomId).emit('user:joined',{email,id:socket.id});
        socket.join(roomId);
        io.to(socket.id).emit('room:join' , data);
    })
    socket.on('user:call' ,(data)=>{
        const {to , offer} = data;
        io.to(to).emit('incoming:call',{from:socket.id , offer});
    })
    socket.on("call:accepted" , (data)=>{
        const {to,ans} = data;
        io.to(to).emit('call:accepted',{from:socket.id , ans});
    })
    socket.on('peer:nego:needed',(data)=>{
        const {to , offer} = data;
        io.to(to).emit("peer:nego:needed",{from:socket.id , offer});
    })
    socket.on('peer:nego:done',(data)=>{
        const {to , ans} = data;
        io.to(to).emit("peer:nego:done",{from:socket.id ,ans});
    })
})

app.listen(expressPort,()=> console.log('listening on port '+ expressPort));





