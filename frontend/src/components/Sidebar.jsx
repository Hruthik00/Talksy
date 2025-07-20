import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useSocket } from "../context/SocketContext";
import { Search, Users, Plus, MessageCircle } from "lucide-react";
import CreateGroupModal from "./CreateGroupModal";

const Sidebar = () => {
  const { authUser, searchUsers } = useAuthStore();
  const { 
    chats, 
    getChats, 
    setSelectedChat, 
    selectedChat, 
    groups, 
    getGroups, 
    setSelectedGroup, 
    selectedGroup 
  } = useChatStore();
  const { onlineUsers } = useSocket();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("chats"); // "chats" or "groups"
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  
  useEffect(() => {
    if (authUser) {
      getChats();
      getGroups();
    }
  }, [getChats, getGroups, authUser]);
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  
  const isOnline = (userId) => {
    if (!onlineUsers || !Array.isArray(onlineUsers)) {
      return false;
    }
    return onlineUsers.some(user => user === userId);
  };
  
  const renderUserItem = (user) => {
    const isSelected = selectedChat?._id === user._id;
    const online = isOnline(user._id);
    
    return (
      <div 
        key={user._id}
        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${
          isSelected ? "bg-base-200" : ""
        }`}
        onClick={() => setSelectedChat(user)}
      >
        <div className="relative">
          <div className="avatar">
            <div className="w-12 rounded-full">
              <img 
                src={user.profilePic || "/avatar.png"} 
                alt={user.fullName} 
              />
            </div>
          </div>
          {online && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100"></span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{user.fullName}</p>
          <p className="text-xs text-base-content/70 truncate">{user.email}</p>
        </div>
      </div>
    );
  };
  
  const renderGroupItem = (group) => {
    const isSelected = selectedGroup?._id === group._id;
    
    return (
      <div 
        key={group._id}
        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${
          isSelected ? "bg-base-200" : ""
        }`}
        onClick={() => setSelectedGroup(group)}
      >
        <div className="avatar">
          <div className="w-12 rounded-full">
            <img 
              src={group.groupImage || "/avatar.png"} 
              alt={group.name} 
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{group.name}</p>
          <p className="text-xs text-base-content/70 truncate">
            {group.members.length} members
          </p>
        </div>
      </div>
    );
  };
  
  return (
    <div className="w-80 h-full border-r border-base-200 flex flex-col">
      <div className="p-4 border-b border-base-200">
        <div className="flex items-center gap-2">
          <div className="input-group w-full">
            <input
              type="text"
              placeholder="Search users..."
              className="input input-sm input-bordered w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button 
              className="btn btn-sm btn-square" 
              onClick={handleSearch}
              disabled={isSearching}
            >
              <Search size={18} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="tabs tabs-boxed bg-transparent justify-center p-2">
        <button
          className={`tab ${activeTab === "chats" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("chats")}
        >
          <MessageCircle size={18} className="mr-1" /> Chats
        </button>
        <button
          className={`tab ${activeTab === "groups" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("groups")}
        >
          <Users size={18} className="mr-1" /> Groups
        </button>
      </div>
      
      {activeTab === "groups" && (
        <div className="p-2">
          <button 
            className="btn btn-sm btn-outline w-full flex items-center gap-2"
            onClick={() => setIsCreateGroupModalOpen(true)}
          >
            <Plus size={16} /> Create Group
          </button>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-3">
        {isSearching ? (
          <div className="flex justify-center p-4">
            <span className="loading loading-spinner"></span>
          </div>
        ) : searchQuery && searchResults.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-base-content/70 mb-2">Search Results</h3>
            {searchResults.map(renderUserItem)}
          </div>
        ) : searchQuery && searchResults.length === 0 ? (
          <div className="text-center py-4 text-base-content/70">
            No users found
          </div>
        ) : activeTab === "chats" ? (
          <div className="space-y-2">
            {chats.length > 0 ? (
              chats.map(renderUserItem)
            ) : (
              <div className="text-center py-4 text-base-content/70">
                No chats yet
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {groups.length > 0 ? (
              groups.map(renderGroupItem)
            ) : (
              <div className="text-center py-4 text-base-content/70">
                No groups yet
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* User profile preview */}
      {authUser && (
        <div className="p-3 border-t border-base-200">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img 
                  src={authUser.profilePic || "/avatar.png"} 
                  alt={authUser.fullName} 
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{authUser.fullName}</p>
              <p className="text-xs text-base-content/70 truncate">{authUser.email}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Create Group Modal */}
      <CreateGroupModal 
        isOpen={isCreateGroupModalOpen} 
        onClose={() => setIsCreateGroupModalOpen(false)} 
      />
    </div>
  );
};

export default Sidebar; 