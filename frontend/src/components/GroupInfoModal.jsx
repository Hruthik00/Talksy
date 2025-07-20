import { useState } from "react";
import { X, Upload, UserPlus, UserMinus, Edit, Trash } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const GroupInfoModal = ({ isOpen, onClose, group }) => {
  const { authUser } = useAuthStore();
  const { getGroups } = useChatStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState(group?.name || "");
  const [description, setDescription] = useState(group?.description || "");
  const [groupImage, setGroupImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(group?.groupImage || null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  
  if (!isOpen || !group) return null;
  
  const isAdmin = group.admin._id === authUser._id;
  
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
  
  const handleUpdate = async () => {
    if (!groupName.trim()) return;
    
    setIsUpdating(true);
    try {
      await axiosInstance.put(`/groups/${group._id}`, {
        name: groupName,
        description,
        groupImage,
      });
      
      toast.success("Group updated successfully");
      getGroups();
      setIsEditing(false);
    } catch (error) {
      console.error("Update group error:", error);
      toast.error("Failed to update group");
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDeleteGroup = async () => {
    if (!confirm("Are you sure you want to delete this group?")) return;
    
    try {
      await axiosInstance.delete(`/groups/${group._id}`);
      toast.success("Group deleted successfully");
      getGroups();
      onClose();
    } catch (error) {
      console.error("Delete group error:", error);
      toast.error("Failed to delete group");
    }
  };
  
  const handleRemoveMember = async (memberId) => {
    try {
      await axiosInstance.delete(`/groups/${group._id}/members/${memberId}`);
      toast.success("Member removed successfully");
      getGroups();
    } catch (error) {
      console.error("Remove member error:", error);
      toast.error("Failed to remove member");
    }
  };
  
  const handleLeaveGroup = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;
    
    try {
      await axiosInstance.delete(`/groups/${group._id}/members/${authUser._id}`);
      toast.success("Left group successfully");
      getGroups();
      onClose();
    } catch (error) {
      console.error("Leave group error:", error);
      toast.error("Failed to leave group");
    }
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const res = await axiosInstance.get(`/auth/search?query=${searchQuery}`);
      
      // Filter out users who are already members
      const memberIds = group.members.map(member => member._id);
      const filteredResults = res.data.filter(user => !memberIds.includes(user._id));
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search users");
    }
  };
  
  const handleAddMembers = async (selectedUsers) => {
    try {
      await axiosInstance.post(`/groups/${group._id}/members`, {
        members: selectedUsers.map(user => user._id),
      });
      
      toast.success("Members added successfully");
      getGroups();
      setIsAddingMembers(false);
      setSearchResults([]);
      setSearchQuery("");
    } catch (error) {
      console.error("Add members error:", error);
      toast.error("Failed to add members");
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-base-200">
          <h2 className="text-lg font-semibold">Group Info</h2>
          <button 
            className="btn btn-sm btn-circle btn-ghost" 
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isEditing ? (
            <div className="space-y-4">
              {/* Group Image */}
              <div className="flex flex-col items-center gap-2">
                <div className="avatar">
                  <div className="w-24 rounded-full">
                    <img 
                      src={previewImage || "/avatar.png"} 
                      alt={groupName} 
                    />
                  </div>
                </div>
                <label className="btn btn-sm btn-outline">
                  <Upload size={16} className="mr-2" />
                  Change Image
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
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />
              </div>
              
              {/* Group Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea 
                  className="textarea textarea-bordered w-full" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button 
                  className="btn btn-ghost" 
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleUpdate}
                  disabled={!groupName.trim() || isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          ) : isAddingMembers ? (
            <div className="space-y-4">
              <h3 className="font-medium">Add Members</h3>
              
              <div className="form-control">
                <div className="input-group">
                  <input 
                    type="text" 
                    className="input input-bordered w-full" 
                    placeholder="Search users..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <button 
                    className="btn" 
                    onClick={handleSearch}
                  >
                    Search
                  </button>
                </div>
              </div>
              
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Search Results</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {searchResults.map(user => (
                      <div 
                        key={user._id}
                        className="flex items-center gap-3 p-2 rounded-lg"
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
                        <button 
                          className="btn btn-sm btn-primary btn-circle"
                          onClick={() => handleAddMembers([user])}
                        >
                          <UserPlus size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : searchQuery ? (
                <p className="text-center py-4 text-base-content/70">
                  No users found
                </p>
              ) : null}
              
              <div className="flex justify-end">
                <button 
                  className="btn btn-ghost" 
                  onClick={() => setIsAddingMembers(false)}
                >
                  Back
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Group Image */}
              <div className="flex flex-col items-center gap-2">
                <div className="avatar">
                  <div className="w-24 rounded-full">
                    <img 
                      src={group.groupImage || "/avatar.png"} 
                      alt={group.name} 
                    />
                  </div>
                </div>
              </div>
              
              {/* Group Details */}
              <div>
                <h3 className="text-lg font-medium">{group.name}</h3>
                {group.description && (
                  <p className="text-base-content/70 mt-1">{group.description}</p>
                )}
                <p className="text-sm text-base-content/70 mt-2">
                  Created by {group.admin.fullName}
                </p>
              </div>
              
              {/* Admin Actions */}
              {isAdmin && (
                <div className="flex flex-wrap gap-2">
                  <button 
                    className="btn btn-sm btn-outline gap-2"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit size={16} />
                    Edit Group
                  </button>
                  <button 
                    className="btn btn-sm btn-outline gap-2"
                    onClick={() => setIsAddingMembers(true)}
                  >
                    <UserPlus size={16} />
                    Add Members
                  </button>
                  <button 
                    className="btn btn-sm btn-error gap-2"
                    onClick={handleDeleteGroup}
                  >
                    <Trash size={16} />
                    Delete Group
                  </button>
                </div>
              )}
              
              {/* Members List */}
              <div>
                <h3 className="font-medium mb-2">Members ({group.members.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {group.members.map(member => (
                    <div 
                      key={member._id}
                      className="flex items-center gap-3 p-2 rounded-lg"
                    >
                      <div className="avatar">
                        <div className="w-10 rounded-full">
                          <img 
                            src={member.profilePic || "/avatar.png"} 
                            alt={member.fullName} 
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{member.fullName}</p>
                          {member._id === group.admin._id && (
                            <span className="badge badge-sm">Admin</span>
                          )}
                          {member._id === authUser._id && (
                            <span className="badge badge-sm badge-primary">You</span>
                          )}
                        </div>
                        <p className="text-xs text-base-content/70 truncate">{member.email}</p>
                      </div>
                      {isAdmin && member._id !== authUser._id && (
                        <button 
                          className="btn btn-sm btn-ghost btn-circle text-error"
                          onClick={() => handleRemoveMember(member._id)}
                        >
                          <UserMinus size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Leave Group (for non-admins) */}
              {!isAdmin && (
                <div className="pt-4">
                  <button 
                    className="btn btn-error w-full"
                    onClick={handleLeaveGroup}
                  >
                    Leave Group
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupInfoModal; 