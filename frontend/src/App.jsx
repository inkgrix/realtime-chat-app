import io from "socket.io-client";
import { useState, useEffect, useRef } from "react";

const socket = io.connect("http://localhost:3001");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [usersCount, setUsersCount] = useState(0);

  const scrollRef = useRef(null);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

  const leaveRoom = () => {
    socket.emit("leave_room");
    setShowChat(false);
    setMessageList([]);
    setRoom("");
  };

  const sendMessage = async () => {
    if (message !== "") {
      const messageData = {
        room: room,
        author: username,
        message: message,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes().toString().padStart(2, "0"),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setMessage("");
    }
  };

  useEffect(() => {
    const receiveMessage = (data) => {
      setMessageList((list) => [...list, data]);
    };

    const updateUsers = (count) => {
      setUsersCount(count);
    };

    socket.on("receive_message", receiveMessage);
    socket.on("room_users", updateUsers);

    return () => {
      socket.off("receive_message", receiveMessage);
      socket.off("room_users", updateUsers);
    };
  }, [socket]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  return (
    // ✅ ปรับ Container หลัก: บนมือถือ (p-0) ไม่ต้องมี Padding, บนจอใหญ่ (sm:p-4) มี Padding ปกติ
    <div className="min-h-screen bg-gray-100 sm:bg-gradient-to-br sm:from-gray-100 sm:to-gray-200 flex items-center justify-center font-sans p-0 sm:p-4">
      {!showChat ? (
        /* --- หน้า Join Room --- */
        // ✅ ปรับความกว้างและการ์ด: บนมือถือเต็มจอเล็กน้อย, บนจอใหญ่เป็น Card
        <div className="bg-white p-6 sm:p-8 rounded-none sm:rounded-2xl shadow-none sm:shadow-xl w-full h-screen sm:h-auto sm:max-w-md flex flex-col justify-center transform transition-all hover:scale-100 sm:hover:scale-105 duration-300">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-800 mb-2">Chat 🚀</h3>
            <p className="text-gray-500 text-sm">
              Join a room to start chatting
            </p>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              placeholder="Display Name..."
              onChange={(event) => setUsername(event.target.value)}
            />
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              placeholder="Room ID (e.g., 123)"
              onChange={(event) => setRoom(event.target.value)}
            />
            <button
              onClick={joinRoom}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg shadow-lg transition active:scale-95"
            >
              Join Room
            </button>
          </div>
        </div>
      ) : (
        /* --- หน้า Chat Window --- */
        // ✅ Responsive หัวใจสำคัญอยู่ตรงนี้:
        // - w-full: กว้างเต็ม
        // - h-[100dvh]: ความสูงเต็มจอแบบ Dynamic (แก้บั๊ก Safari มือถือ)
        // - sm:h-[600px]: จอใหญ่สูงแค่ 600px พอ
        // - sm:rounded-2xl: จอใหญ่มีมุมมน, มือถือเหลี่ยม
        <div className="bg-white w-full sm:max-w-md md:max-w-lg rounded-none sm:rounded-2xl shadow-none sm:shadow-2xl overflow-hidden flex flex-col h-[100dvh] sm:h-[600px]">
          
          {/* Header */}
          <div className="bg-gray-900 p-4 flex justify-between items-center shadow-md z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                {username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold flex items-center gap-2 text-sm sm:text-base">
                  Room: {room}
                  <span className="bg-gray-700 text-[10px] sm:text-xs px-2 py-0.5 rounded-full text-emerald-400 border border-emerald-500">
                    {usersCount}
                  </span>
                </p>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <p className="text-gray-400 text-xs">Online</p>
                </div>
              </div>
            </div>
            <button
              onClick={leaveRoom}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg text-xs font-bold transition shadow-md whitespace-nowrap"
            >
              Exit 🚪
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messageList.map((messageContent, index) => {
              const isMe = username === messageContent.author;
              return (
                <div
                  key={index}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] px-4 py-2 rounded-2xl shadow-sm relative ${
                      isMe
                        ? "bg-emerald-500 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm break-words leading-relaxed">
                      {messageContent.message}
                    </p>
                    <div
                      className={`text-[10px] mt-1 flex gap-1 ${
                        isMe ? "text-emerald-100 justify-end" : "text-gray-400"
                      }`}
                    >
                      <span>{messageContent.time}</span>
                      {!isMe && (
                        <span className="font-bold">
                          · {messageContent.author}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>

          {/* Footer Input */}
          <div className="p-3 sm:p-4 bg-white border-t border-gray-100 shrink-0 safe-area-bottom">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
              <input
                type="text"
                value={message}
                className="flex-1 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400 text-sm sm:text-base"
                placeholder="Type a message..."
                onChange={(event) => setMessage(event.target.value)}
                onKeyPress={(event) => {
                  event.key === "Enter" && sendMessage();
                }}
              />
              <button
                onClick={sendMessage}
                className="bg-emerald-500 p-2 rounded-full text-white hover:bg-emerald-600 transition shadow-md flex items-center justify-center shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 ml-0.5"
                >
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;