import { useState, useEffect } from "react";
import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { Send, Moon, Sun, Palette } from "lucide-react";
import toast from "react-hot-toast";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
  { id: 3, content: "Check out this new theme option!", isSent: false },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentTheme, setCurrentTheme] = useState(theme);
  
  // Sync with theme store
  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);
  
  // Filter themes by category
  const filterThemes = () => {
    if (selectedCategory === "all") return THEMES;
    if (selectedCategory === "light") return THEMES.filter(t => !t.includes("dark") && !["dracula", "night", "coffee", "business", "forest", "halloween", "luxury", "black", "dim", "nord", "sunset"].includes(t));
    if (selectedCategory === "dark") return THEMES.filter(t => t.includes("dark") || ["dracula", "night", "coffee", "business", "forest", "halloween", "luxury", "black", "dim", "nord", "sunset"].includes(t));
    return THEMES;
  };
  
  // Handle theme change with feedback
  const handleThemeChange = (newTheme) => {
    try {
      setTheme(newTheme);
      toast.success(`Theme changed to ${newTheme}`);
    } catch (error) {
      console.error("Error changing theme:", error);
      toast.error("Failed to change theme");
    }
  };

  return (
    <div className="container mx-auto px-4 pt-20 pb-10 max-w-5xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-base-content/70">Customize your chat experience</p>
        </div>
        
        <div className="divider"></div>
        
        <div className="space-y-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Palette size={20} />
              <h2 className="text-lg font-semibold">Appearance</h2>
            </div>
            <p className="text-sm text-base-content/70">Choose a theme for your chat interface</p>
          </div>
          
          {/* Theme Preview */}
          <div className="bg-base-200 rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">Preview</h3>
            <div className="flex flex-col gap-3 max-w-md mx-auto">
              {PREVIEW_MESSAGES.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isSent ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] ${
                      msg.isSent
                        ? "bg-primary text-primary-content"
                        : "bg-base-300"
                    } rounded-lg p-3`}
                  >
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}
              
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1">
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="Type a message..."
                    disabled
                  />
                </div>
                <button className="btn btn-circle btn-primary">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Theme Filters */}
          <div className="flex gap-2 flex-wrap">
            <button
              className={`btn btn-sm ${selectedCategory === "all" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setSelectedCategory("all")}
            >
              All Themes
            </button>
            <button
              className={`btn btn-sm ${selectedCategory === "light" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setSelectedCategory("light")}
            >
              <Sun size={16} className="mr-1" /> Light
            </button>
            <button
              className={`btn btn-sm ${selectedCategory === "dark" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setSelectedCategory("dark")}
            >
              <Moon size={16} className="mr-1" /> Dark
            </button>
          </div>
          
          {/* Theme Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filterThemes().map((t) => (
              <button
                key={t}
                className={`
                  group flex flex-col items-center gap-1.5 p-3 rounded-lg transition-colors
                  ${currentTheme === t ? "bg-base-200" : "hover:bg-base-200/50"}
                `}
                onClick={() => handleThemeChange(t)}
              >
                <div className="relative h-12 w-full rounded-md overflow-hidden" data-theme={t}>
                  <div className="absolute inset-0 grid grid-cols-2 gap-px p-1">
                    <div className="flex flex-col gap-1">
                      <div className="rounded h-2 bg-primary"></div>
                      <div className="rounded h-2 bg-secondary"></div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="rounded h-2 bg-accent"></div>
                      <div className="rounded h-2 bg-neutral"></div>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-medium truncate w-full text-center">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
                {currentTheme === t && (
                  <div className="badge badge-xs badge-primary absolute top-2 right-2"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
