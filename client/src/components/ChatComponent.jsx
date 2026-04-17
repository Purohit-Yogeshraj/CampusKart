import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL, request } from "../utils/api";
import "../chat.css";

function getMessageSenderId(message) {
  if (!message?.sender) {
    return "";
  }

  if (typeof message.sender === "string") {
    return message.sender;
  }

  return message.sender._id || "";
}

export function ChatComponent({
  currentUserId,
  otherUserId,
  listing,
  onMessagesChange,
}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await request(`/chat/conversation/${otherUserId}`);
        setMessages(data.messages);
        onMessagesChange?.(data.messages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    socketRef.current = io(API_BASE_URL.replace(/\/api$/, ""), {
      withCredentials: true,
    });

    socketRef.current.emit("user-online", currentUserId);

    socketRef.current.on("new-message", (data) => {
      if (data.sender === otherUserId) {
        setMessages((prev) => {
          const next = [...prev, data];
          onMessagesChange?.(next);
          return next;
        });
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUserId, otherUserId, onMessagesChange]);

  useEffect(() => {
    if (messagesEndRef.current) {
      const parent = messagesEndRef.current.parentElement;
      if (parent) {
        parent.scrollTo({ top: parent.scrollHeight, behavior: "smooth" });
      }
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    try {
      const data = await request("/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: otherUserId,
          message: inputMessage,
          listingId: listing?._id,
        }),
      });

      if (data.success) {
        setMessages((prev) => {
          const next = [...prev, data.message];
          onMessagesChange?.(next);
          return next;
        });
        socketRef.current?.emit("send-message", {
          senderId: currentUserId,
          recipientId: otherUserId,
          message: inputMessage,
          listing,
        });
        setInputMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (isLoading) {
    return <div className="chat-loading">Loading messages...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Message</h3>
        {listing && <span className="listing-link">{listing.title}</span>}
      </div>

      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="no-messages">
            No messages yet. Start the conversation.
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message ${getMessageSenderId(msg) === currentUserId ? "sent" : "received"}`}
            >
              {msg.listing?.title && (
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#7f8c8d",
                    marginBottom: "6px",
                  }}
                >
                  About: {msg.listing.title}
                </div>
              )}
              <div className="message-content">{msg.message}</div>
              <div className="message-time">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="message-input"
          placeholder="Type your message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button type="submit" className="send-btn">
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
}
