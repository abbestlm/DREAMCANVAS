// InsightAI - A personal project for visual analysis and creative conversation
import { useState, useRef, useEffect } from "react";
import { 
  Eye, 
  Image as ImageIcon, 
  MessageSquare, 
  Upload, 
  Download, 
  Loader2, 
  Send,
  Trash2,
  ChevronRight,
  Info,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { cn } from "@/src/lib/utils";
import { analyzeImage, chatWithAI } from "@/src/services/gemini";

type Tab = "analyze" | "chat";

interface Message {
  role: "user" | "ai";
  content: string;
  image?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("analyze");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Image Analysis State
  const [analysisImage, setAnalysisImage] = useState<string | null>(null);
  const [analysisPrompt, setAnalysisPrompt] = useState("Tell me a creative story about this image.");
  const [analysisResult, setAnalysisResult] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Chat State
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnalysisImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!analysisImage || !analysisPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const result = await analyzeImage(analysisPrompt, analysisImage);
      setAnalysisResult(result || "No analysis generated.");
    } catch (error) {
      console.error(error);
      alert("Failed to analyze image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg: Message = { role: "user", content: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput("");
    setIsGenerating(true);
    try {
      const response = await chatWithAI(chatInput);
      setChatHistory(prev => [...prev, { role: "ai", content: response || "I couldn't process that." }]);
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, { role: "ai", content: "Sorry, I encountered an error." }]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-200">
              <Zap className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-display font-bold text-slate-900">InsightAI</h1>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors"
            >
              GitHub
            </a>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 p-1 bg-slate-100 rounded-2xl w-fit mx-auto">
          <TabButton 
            active={activeTab === "analyze"} 
            onClick={() => setActiveTab("analyze")}
            icon={<Eye className="w-4 h-4" />}
            label="Visual Insight"
          />
          <TabButton 
            active={activeTab === "chat"} 
            onClick={() => setActiveTab("chat")}
            icon={<MessageSquare className="w-4 h-4" />}
            label="Creative Chat"
          />
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "analyze" && (
            <motion.div
              key="analyze"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-8 items-start"
            >
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                  <h2 className="text-2xl mb-4">Visual Insight</h2>
                  <p className="text-slate-500 mb-6">Upload an image and ask the AI to analyze it or write a story.</p>
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "w-full aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative",
                      analysisImage ? "border-brand-500" : "border-slate-200 hover:border-brand-400 hover:bg-slate-50"
                    )}
                  >
                    {analysisImage ? (
                      <img src={analysisImage} alt="Upload" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-slate-300 mb-2" />
                        <p className="text-slate-400 text-sm font-medium">Click to upload image</p>
                      </>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      accept="image/*" 
                    />
                  </div>

                  <div className="mt-6 space-y-4">
                    <label className="text-sm font-bold text-slate-700">What should the AI do?</label>
                    <input
                      type="text"
                      value={analysisPrompt}
                      onChange={(e) => setAnalysisPrompt(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                  </div>
                  
                  <button
                    onClick={handleAnalyzeImage}
                    disabled={isGenerating || !analysisImage}
                    className="w-full mt-6 py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-200"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Zap className="w-5 h-5" />
                    )}
                    Analyze Image
                  </button>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 min-h-[400px]">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-brand-600" />
                  AI Response
                </h3>
                {analysisResult ? (
                  <div className="prose prose-slate max-w-none">
                    <Markdown>{analysisResult}</Markdown>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <ChevronRight className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-slate-400">Upload and analyze an image to see the AI's creative response here.</p>
                  </div>
                )}
                {isGenerating && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
                    <p className="text-slate-500 font-medium">Thinking deeply...</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto w-full flex flex-col h-[600px] bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">Creative Assistant</h3>
                    <p className="text-xs text-slate-400">Insight Engine v1.0</p>
                  </div>
                </div>
                <button 
                  onClick={() => setChatHistory([])}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center">
                      <Zap className="w-10 h-10 text-brand-400" />
                    </div>
                    <div className="max-w-xs">
                      <p className="font-bold text-slate-700">Start a conversation</p>
                      <p className="text-sm text-slate-400">Ask me to write a poem, explain a concept, or brainstorm ideas.</p>
                    </div>
                  </div>
                ) : (
                  chatHistory.map((msg, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i}
                      className={cn(
                        "flex flex-col max-w-[80%]",
                        msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      <div className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed",
                        msg.role === "user" 
                          ? "bg-brand-600 text-white rounded-tr-none shadow-md shadow-brand-100" 
                          : "bg-white text-slate-800 rounded-tl-none shadow-sm border border-slate-100"
                      )}>
                        {msg.role === "ai" ? (
                          <div className="prose prose-sm prose-slate max-w-none">
                            <Markdown>{msg.content}</Markdown>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                        {msg.role === "user" ? "You" : "Assistant"}
                      </span>
                    </motion.div>
                  ))
                )}
                {isGenerating && (
                  <div className="flex items-start gap-2">
                    <div className="p-4 bg-white rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                      <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleChat()}
                    placeholder="Type your message..."
                    className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                  <button
                    onClick={handleChat}
                    disabled={isGenerating || !chatInput.trim()}
                    className="p-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white rounded-2xl transition-all shadow-lg shadow-brand-200"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} InsightAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all",
        active 
          ? "bg-white text-brand-600 shadow-sm" 
          : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
