import { useState, useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useSocket } from "../context/SocketContext";
import { Send, Image, Smile, Info, Users, MessageCircle, X } from "lucide-react";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import GroupInfoModal from "./GroupInfoModal";

const ChatWindow = () => {
  const { 
    selectedChat, 
    isGroup,
    selectedGroup,
    messages, 
    groupMessages,
    getMessages, 
    getGroupMessages,
    sendMessage,
    sendGroupMessage,
    addMessage,
    addGroupMessage,
  } = useChatStore();
  
  const { authUser } = useAuthStore();
  const { socket, typingUsers, sendTypingStatus, joinGroup } = useSocket();
  
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isGroupInfoModalOpen, setIsGroupInfoModalOpen] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Get messages when selected chat changes
  useEffect(() => {
    if (selectedChat) {
      getMessages(selectedChat._id);
    }
  }, [selectedChat, getMessages]);
  
  // Get group messages when selected group changes
  useEffect(() => {
    if (selectedGroup) {
      getGroupMessages(selectedGroup._id);
      joinGroup(selectedGroup._id);
    }
  }, [selectedGroup, getGroupMessages, joinGroup]);
  
  // Socket.io event listeners
  useEffect(() => {
    if (!socket) return;
    
    // Listen for new messages
    socket.on("newMessage", (newMessage) => {
      if (
        selectedChat && 
        ((newMessage.senderId === selectedChat._id && newMessage.receiverId === authUser._id) ||
         (newMessage.senderId === authUser._id && newMessage.receiverId === selectedChat._id))
      ) {
        addMessage(newMessage);
      }
    });
    
    // Listen for new group messages
    socket.on("newGroupMessage", (newMessage) => {
      if (selectedGroup && newMessage.groupId === selectedGroup._id) {
        addGroupMessage(newMessage);
      }
    });
    
    return () => {
      socket.off("newMessage");
      socket.off("newGroupMessage");
    };
  }, [socket, selectedChat, selectedGroup, authUser, addMessage, addGroupMessage]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, groupMessages, typingUsers]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Handle typing indicator
  useEffect(() => {
    let typingTimer;
    
    if (message && selectedChat && !isTyping) {
      setIsTyping(true);
      sendTypingStatus(selectedChat._id, true);
    }
    
    if (typingTimer) {
      clearTimeout(typingTimer);
    }
    
    typingTimer = setTimeout(() => {
      if (isTyping && selectedChat) {
        sendTypingStatus(selectedChat._id, false);
        setIsTyping(false);
      }
    }, 2000);
    
    return () => {
      clearTimeout(typingTimer);
      if (isTyping && selectedChat) {
        sendTypingStatus(selectedChat._id, false);
      }
    };
  }, [message, selectedChat, isTyping, sendTypingStatus]);
  
  const handleSendMessage = async () => {
    if ((!message.trim() && !image) || (!selectedChat && !selectedGroup)) return;
    
    try {
      if (selectedChat) {
        await sendMessage(selectedChat._id, message, image);
      } else if (selectedGroup) {
        await sendGroupMessage(selectedGroup._id, message, image);
      }
      
      // Reset form
      setMessage("");
      setImage(null);
      setPreviewImage(null);
      setIsEmojiPickerOpen(false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji.native);
    setIsEmojiPickerOpen(false);
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const isUserTyping = selectedChat && typingUsers[selectedChat._id];
  
  const displayMessages = isGroup ? groupMessages : messages;
  const chatPartner = isGroup ? selectedGroup : selectedChat;
  
  if (!chatPartner) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-base-200/50 text-base-content/70">
        <MessageCircle size={48} strokeWidth={1} />
        <h3 className="text-xl font-medium mt-4">Select a chat to start messaging</h3>
        <p className="text-sm mt-2">Search for users or select an existing conversation</p>
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-base-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="w-10 rounded-full">
              <img 
                src={
                  isGroup 
                    ? (chatPartner.groupImage || "/avatar.png") 
                    : (chatPartner.profilePic || "/avatar.png")
                } 
                alt={isGroup ? chatPartner.name : chatPartner.fullName} 
              />
            </div>
          </div>
          <div>
            <h3 className="font-medium">
              {isGroup ? chatPartner.name : chatPartner.fullName}
            </h3>
            {isGroup ? (
              <p className="text-xs text-base-content/70">
                {chatPartner.members.length} members
              </p>
            ) : isUserTyping ? (
              <p className="text-xs text-success">Typing...</p>
            ) : (
              <p className="text-xs text-base-content/70">{chatPartner.email}</p>
            )}
          </div>
        </div>
        
        {isGroup && (
          <button 
            className="btn btn-sm btn-ghost btn-circle"
            onClick={() => setIsGroupInfoModalOpen(true)}
          >
            <Info size={18} />
          </button>
        )}
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-base-content/70">
            <p>No messages yet</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        ) : (
          displayMessages.map((msg) => {
            const isSentByMe = msg.senderId._id === authUser._id || msg.senderId === authUser._id;
            
            return (
              <div 
                key={msg._id}
                className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[70%] ${isSentByMe ? "bg-primary text-primary-content" : "bg-base-200"} rounded-lg p-3`}>
                  {isGroup && !isSentByMe && (
                    <p className="text-xs font-medium mb-1">
                      {msg.senderId.fullName}
                    </p>
                  )}
                  
                  {msg.image && (
                    <div className="mb-2">
                      <img 
                        src={msg.image} 
                        alt="Message attachment" 
                        className="rounded-md max-w-full max-h-60 object-contain"
                      />
                    </div>
                  )}
                  
                  {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                  
                  <p className={`text-xs mt-1 ${isSentByMe ? "text-primary-content/70" : "text-base-content/70"}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing indicator */}
        {isUserTyping && (
          <div className="flex justify-start">
            <div className="bg-base-200 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-base-content/70 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-base-content/70 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 rounded-full bg-base-content/70 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="p-4 border-t border-base-200">
        {previewImage && (
          <div className="mb-2 relative inline-block">
            <img 
              src={previewImage} 
              alt="Preview" 
              className="h-20 rounded-md object-contain"
            />
            <button 
              className="absolute top-1 right-1 btn btn-xs btn-circle btn-error"
              onClick={() => {
                setPreviewImage(null);
                setImage(null);
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <button 
            className="btn btn-circle btn-ghost"
            onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
          >
            <Smile size={20} />
          </button>
          
          <button 
            className="btn btn-circle btn-ghost"
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
          </button>
          
          <div className="relative flex-1">
            <textarea 
              className="textarea textarea-bordered w-full resize-none"
              placeholder="Type a message..."
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            
            {isEmojiPickerOpen && (
              <div className="absolute bottom-full mb-2">
                <Picker 
                  data={data} 
                  onEmojiSelect={handleEmojiSelect}
                  theme="light"
                />
              </div>
            )}
          </div>
          
          <button 
            className="btn btn-circle btn-primary"
            onClick={handleSendMessage}
            disabled={(!message.trim() && !image)}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
      
      {/* Group Info Modal */}
      {isGroup && (
        <GroupInfoModal 
          isOpen={isGroupInfoModalOpen} 
          onClose={() => setIsGroupInfoModalOpen(false)}
          group={selectedGroup}
        />
      )}
    </div>
  );
};

export default ChatWindow; 