import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { X, Upload, Search, Check } from "lucide-react";

const CreateGroupModal = ({ isOpen, onClose }) => {
  const { createGroup } = useChatStore();
  const { searchUsers } = useAuthStore();
  
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupImage, setGroupImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setGroupName("");
      setDescription("");
      setSearchQuery("");
      setSearchResults([]);
      setSelectedMembers([]);
      setGroupImage(null);
      setPreviewImage(null);
    }
  }, [isOpen]);
  
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
  
  const toggleSelectMember = (user) => {
    setSelectedMembers(prev => {
      const isSelected = prev.some(member => member._id === user._id);
      
      if (isSelected) {
        return prev.filter(member => member._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result);
      setGroupImage(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) return;
    if (selectedMembers.length === 0) return;
    
    setIsCreating(true);
    try {
      await createGroup({
        name: groupName,
        description,
        members: selectedMembers.map(member => member._id),
        groupImage,
      });
      onClose();
    } catch (error) {
      console.error("Create group error:", error);
    } finally {
      setIsCreating(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-base-200">
          <h2 className="text-lg font-semibold">Create New Group</h2>
          <button 
            className="btn btn-sm btn-circle btn-ghost" 
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Group Image */}
          <div className="flex flex-col items-center gap-2">
            <div className="avatar">
              <div className="w-24 rounded-full">
                <img 
                  src={previewImage || "/avatar.png"} 
                  alt="Group" 
                />
              </div>
            </div>
            <label className="btn btn-sm btn-outline">
              <Upload size={16} className="mr-2" />
              Upload Image
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange} 
              />
            </label>
          </div>
          
          {/* Group Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Group Name</span>
            </label>
            <input 
              type="text" 
              className="input input-bordered w-full" 
              placeholder="Enter group name" 
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>
          
          {/* Group Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description (Optional)</span>
            </label>
            <textarea 
              className="textarea textarea-bordered w-full" 
              placeholder="Enter group description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          {/* Search Members */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Add Members</span>
            </label>
            <div className="input-group">
              <input 
                type="text" 
                className="input input-bordered w-full" 
                placeholder="Search users..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button 
                type="button"
                className="btn" 
                onClick={handleSearch}
                disabled={isSearching}
              >
                <Search size={18} />
              </button>
            </div>
          </div>
          
          {/* Search Results */}
          {isSearching ? (
            <div className="flex justify-center p-4">
              <span className="loading loading-spinner"></span>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Search Results</h3>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {searchResults.map(user => {
                  const isSelected = selectedMembers.some(
                    member => member._id === user._id
                  );
                  
                  return (
                    <div 
                      key={user._id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-base-200 transition-colors ${
                        isSelected ? "bg-base-200" : ""
                      }`}
                      onClick={() => toggleSelectMember(user)}
                    >
                      <div className="avatar">
                        <div className="w-10 rounded-full">
                          <img 
                            src={user.profilePic || "/avatar.png"} 
                            alt={user.fullName} 
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.fullName}</p>
                        <p className="text-xs text-base-content/70 truncate">{user.email}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check size={14} className="text-primary-content" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-base-300"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          
          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Selected Members ({selectedMembers.length})</h3>
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map(member => (
                  <div 
                    key={member._id}
                    className="badge badge-primary gap-1 p-3"
                  >
                    <span>{member.fullName}</span>
                    <button 
                      type="button"
                      className="btn btn-xs btn-circle btn-ghost"
                      onClick={() => toggleSelectMember(member)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="pt-4 flex justify-end gap-2">
            <button 
              type="button"
              className="btn btn-ghost" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn btn-primary" 
              disabled={!groupName.trim() || selectedMembers.length === 0 || isCreating}
            >
              {isCreating ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal; 