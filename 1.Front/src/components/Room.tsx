import Ribbons from "./ui/Ribbons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { socket } from "./Socket";

const Room = () => {
  const navigate = useNavigate();
  const [createUserName, setCreateUserName] = useState("");
  const [joinUserName, setJoinUserName] = useState("");
  const [createRoomId, setCreateRoomId] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");

  useEffect(() => {
    socket.on("roomCreated", (roomId) => {
      setCreateRoomId(roomId);
      setCreateUserName("");
    });

    socket.on("roomJoined", (roomId) => {
      setJoinRoomId(roomId);
      setJoinUserName("");
      localStorage.setItem("roomId", roomId);
      navigate("/game");
    });

    socket.on("startGame", ({ text, roomId }) => {
      navigate("/game", { state: { text, roomId }, replace: true });
    });

    return () => {
      socket.off("roomCreated");
      socket.off("roomJoined");
      socket.off("startGame");
    };
  }, []);

  const createRoom = () => {
    if (!createUserName.trim()) return;
    socket.emit("createRoom", createUserName);
  };

  const joinRoom = () => {
    if (!joinUserName.trim() || !joinRoomId.trim()) return;
    socket.emit("joinRoom", { joinUserName, joinRoomId });
  };
  return (
    <>
      <div
        className="h-screen w-screen relative overflow-hidden flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1689443111130-6e9c7dfd8f9e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Z2FtaW5nJTIwYmFja2dyb3VuZHxlbnwwfHwwfHx8MA%3D%3D&fm=jpg&q=60&w=3000')",
        }}
      >
        <h1 className="absolute top-6 left-6 text-fuchsia-700 text-4xl font-bold z-20">
          TypeRival
        </h1>
        <Ribbons
          baseThickness={20}
          colors={["#8B5CF6", "#FF00FF"]}
          speedMultiplier={0.5}
          maxAge={500}
          enableFade={false}
          enableShaderEffect={true}
        />
      </div>
      <h1 className="absolute top-25 left-128 text-4xl font-bold text-white">
        Create or Join the Game Room
      </h1>

      <div className="absolute top-16 left-111 h-[450px] w-[650px] mt-35 rounded-lg items-center justify-center bg-linear-to-b from-black via-neutral-900 to-gray-800 flex flex-col">
        {createRoomId === "" && (
          <div className="flex mt-3">
            <div className="border border-gray-600 rounded-lg p-8 m-4 flex flex-col items-center shadow-[0_0_20px_rgba(217,70,239,0.5)]">
              <label className="text-white mb-2 mt-5">User Name</label>
              <input
                type="text"
                placeholder="Enter User Name"
                className="p-2 rounded-lg bg-amber-50 mb-5"
                onChange={(e) => setCreateUserName(e.target.value)}
                required
              />
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 15px rgba(255,255,255,0.4)",
                }}
                whileTap={{ scale: 0.9, rotate: -3 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                onClick={createRoom}
                className="bg-linear-to-r from-purple-500 via-violet-500 to-pink-500 mt-4 font-bold px-6 py-3 rounded-2xl shadow-lg focus:outline-none"
              >
                Create Room
              </motion.button>
            </div>
            <div className="border border-gray-600 rounded-lg p-8 m-4 flex flex-col items-center shadow-[0_0_20px_rgba(217,70,239,0.5)]">
              <label className="text-white mb-2">User Name</label>
              <input
                type="text"
                placeholder="Enter User Name"
                className="p-2 rounded-lg bg-amber-50 mb-5"
                onChange={(e) => setJoinUserName(e.target.value)}
                required
              />
              <label className="text-white mb-2">Room Id</label>
              <input
                type="text"
                placeholder="Enter Room Id"
                className="p-2 rounded-lg bg-amber-50 mb-5"
                onChange={(e) => setJoinRoomId(e.target.value)}
              />
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 15px rgba(255,255,255,0.4)",
                }}
                whileTap={{ scale: 0.9, rotate: -3 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                onClick={joinRoom}
                className="bg-linear-to-r from-purple-500 via-violet-500 to-pink-500 font-bold px-6 py-3 rounded-2xl shadow-lg focus:outline-none"
              >
                Join Room
              </motion.button>
            </div>
          </div>
        )}

        {createRoomId && (
          <p className="text-amber-100 text-5xl mb-5">
            Waiting for opponent...
          </p>
        )}

        <div className="rounded-lg m-2 pl-2 pr-2 flex flex-col items-center">
          <p className="text-white">Share this Room ID with friends:</p>
          <p className="text-white font-bold">
            {createRoomId || "No Room Created Yet"}
          </p>
          {createRoomId && (
            <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 15px rgba(255,255,255,0.4)",
                }}
                whileTap={{ scale: 0.9, rotate: -3 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                onClick={() => navigator.clipboard.writeText(createRoomId)}
                className="bg-linear-to-r from-purple-500 via-violet-500 to-pink-500 mt-4 font-bold px-6 py-3 rounded-2xl shadow-lg focus:outline-none"
              >
                Copy Room ID
              </motion.button>
          )}
        </div>
      </div>
    </>
  );
};

export default Room;
