import { MessageSquare } from "lucide-react"; // Assuming you're using lucide-react or similar

const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="relative flex items-center justify-center bg-base-200 p-12 min-h-screen">
      {/* Animated chat icon */}
      <div className="absolute top-1/3 z-0 flex justify-center w-full">
        <div className="animate-float bg-primary text-primary-content p-4 rounded-full shadow-xl">
          <MessageSquare className="w-10 h-10" />
        </div>
      </div>

      {/* Text content */}
      <div className="relative text-center max-w-md z-10 mt-32">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AuthImagePattern;
