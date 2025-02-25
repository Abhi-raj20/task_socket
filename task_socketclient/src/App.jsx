import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import queryString from "query-string";

const socket = io("http://localhost:3000"); // Change to your backend URL

const Join = () => {
  const navigate = useNavigate(); 
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");

  const joinChat = (e) => {
    e.preventDefault();
    if (username && room) {
      navigate(`/chat?username=${username}&room=${room}`);
    }
  };

  return (
    <div className="join-container">
      <header className="join-header">
        <h1>Chat App</h1>
      </header>
      <main className="join-main">
        <form onSubmit={joinChat}>
          <div className="form-control">
            <label>Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="form-control">
            <label>Room</label>
            <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} required />
          </div>
          <button type="submit">Join Chat</button>
        </form>
      </main>
    </div>
  );
};

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, room } = queryString.parse(location.search);

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!username || !room) {
      navigate("/");
      return;
    }

    socket.emit("joinRoom", { username, room });

    socket.on("roomUsers", ({ room, users }) => {
      setUsers(users);
    });

    socket.on("message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [username, room, navigate]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("chatMessage", message);
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <h1>Chat App</h1>
        <button onClick={() => navigate("/")}>Leave Room</button>
      </header>
      <main className="chat-main">
        <div className="chat-sidebar">
          <h3>Room: {room}</h3>
          <h3>Users:</h3>
          <ul>
            {users.map((user, index) => (
              <li key={index}>{user.username}</li>
            ))}
          </ul>
        </div>
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className="message">
              <p className="meta">{msg.username} <span>{msg.time}</span></p>
              <p className="text">{msg.text}</p>
            </div>
          ))}
        </div>
      </main>
      <div className="chat-form-container">
        <form onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Enter Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            autoComplete="off"
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Join />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
};

export default App;
