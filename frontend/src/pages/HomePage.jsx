import { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { useSocket } from '../context/SocketContext';
import { useAuthStore } from '../store/useAuthStore';

const HomePage = () => {
  const { socket } = useSocket();
  const { authUser } = useAuthStore();

  // Connect to socket when component mounts
  useEffect(() => {
    if (socket && authUser) {
      socket.emit('join', authUser._id);
    }
  }, [socket, authUser]);

  return (
    <div className="h-screen pt-16 pb-4 px-4">
      <div className="h-full flex rounded-lg shadow-lg overflow-hidden">
        <Sidebar />
        <ChatWindow />
      </div>
    </div>
  );
};

export default HomePage;