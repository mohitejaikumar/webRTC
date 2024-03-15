import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from "react-player";
import peer from "../services/peer";

export default function Room() {
  const socket = useSocket();
  const [remoteUser, setRemoteUser] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback((data) => {
    const { email, id } = data;
    setRemoteUser(id);
    console.log(`User with ${email} joined room`);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteUser, offer });
    setMyStream(stream);
  }, [socket, remoteUser]);

  const handleIncomingCall = useCallback(
    async (data) => {
      const { from, offer } = data;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log("incoming call" , offer, from);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );
  const sendStream = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(async (data) => {
    const {  ans } = data;
   await peer.setRemoteDescription(ans);
    console.log("Call Accepted");
    sendStream();
  }, [sendStream]);

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { to: remoteUser, offer });
  }, [socket, remoteUser]);

  const handleNegoNeededIncoming = useCallback(
    async (data) => {
      const { from, offer } = data;
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoFinal = useCallback(async (data) => {
    const { from, ans } = data;
    await peer.setRemoteDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded" , handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const stream = ev.streams;
      console.log("GOT TRACKS !!");
      setRemoteStream(stream[0]);
    });
   
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeededIncoming);
    socket.on("peer:nego:final", handleNegoFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeededIncoming);
      socket.off("peer:nego:final", handleNegoFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeededIncoming,
    handleNegoFinal,
  ]);

  return (
    <div>
      <h1>Hi from Room</h1>
      <h3>{remoteUser ? "Connected" : "No one in Room"}</h3>
      {myStream && <button onClick={sendStream}>Send Stream</button>}
      {remoteUser && <button onClick={handleCallUser}>CALL</button>}
      {myStream && <ReactPlayer playing url={myStream}></ReactPlayer>}
      {remoteStream && <h1>Remote Stream</h1>}
      {remoteStream && <ReactPlayer playing  height="100px" width="100px" url={remoteStream}></ReactPlayer>}
    </div>
  );
}
