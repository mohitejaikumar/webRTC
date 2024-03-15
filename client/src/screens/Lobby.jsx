import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

export default function Lobby() {
  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");
  const navigate  = useNavigate();
  const socket = useSocket();

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
   
      socket.emit("room:join", { email, roomId });
    },
    [email, roomId]
  );

  const handleJoinRoom = useCallback((data)=>{
     const {email,roomId} = data;
     console.log(email,roomId);
     navigate(`/room/${roomId}`);
  },[email ,roomId,navigate])



  useEffect(()=>{
      socket.on('room:join',handleJoinRoom);
      console.log("hi");
      return ()=>{
        socket.off('room:join',handleJoinRoom);
      }
  },[socket,handleJoinRoom]);

  return (
    <div className="lobbyContainer">
      <input
        type="text"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="text"
        placeholder="Room"
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
