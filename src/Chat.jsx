import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const encryptedAPIKey = "Z3NrX1JjWDBvdk5IS1FXYzhCSzZLNWJnV0dkeWIzRlkydzhwcFg2UmhTcE9UcFhERUwzN0VIblM=";
const decryptAPIKey = () => atob(encryptedAPIKey);


const Chat = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const sendMessage = async (task) => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const prompt = task === 'proofread'
        ? `Convert the following text into simple, natural English. If it's in Hindi or a mix of Hindi and English, translate it to English without changing the meaning. 
           Keep it casual by making small mistakes and avoiding some punctuation. Add '...' where it feels natural. Don't use fancy English or extra words. 
           Only return the transformed text, no explanations:\n\n"${input}"`
        : input;

      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 1,
          max_completion_tokens: 1024,
          top_p: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${decryptAPIKey().replace('w', 'W')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setResponse(res.data.choices[0]?.message?.content.trim() || 'No response');
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error occurred!');
    }
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage('chat');
    }
  };

  // Dynamic background and text colors based on mode
  const bgClass = isDarkMode
    ? "bg-black text-white"
    : "bg-white text-black";

  const containerClass = isDarkMode
    ? "bg-black/80 border-white/10"
    : "bg-gray-100/80 border-gray-200/10";

  const textareaClass = isDarkMode
    ? "bg-gray-900/50 border-white/10 focus:ring-blue-500 placeholder-white/40"
    : "bg-gray-200/50 border-gray-300/10 focus:ring-blue-400 placeholder-black/40";

  const responseClass = isDarkMode
    ? "bg-gray-900/50 border-white/10"
    : "bg-gray-200/50 border-gray-300/10";

  return (
    <div className={`min-h-screen ${bgClass} flex items-center justify-center p-4 overflow-hidden safe-area-top safe-area-bottom`}>
      {/* Mode Toggle */}
      <div className="fixed top-4 right-4 z-20">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2 rounded-full transition-all duration-300 ${isDarkMode
              ? "bg-white/10 text-white hover:bg-white/20"
              : "bg-black/10 text-black hover:bg-black/20"
            }`}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Dynamic Background */}
      <div className={`fixed inset-0 ${isDarkMode
          ? "bg-gradient-to-br from-black via-black/90 to-gray-900"
          : "bg-gradient-to-br from-gray-100 via-white to-gray-200"
        } opacity-100 pointer-events-none`}></div>

      {/* Main Container */}
      <div className={`relative z-10 w-full max-w-[390px] ${containerClass} backdrop-blur-2xl rounded-[40px] border shadow-2xl overflow-hidden`}>
        {/* Input and Interaction Area */}
        <div className="p-4 space-y-4">
          {/* Textarea with Dynamic Height */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              className={`w-full ${textareaClass} text-inherit p-3 pr-10 rounded-2xl border 
                         focus:outline-none focus:ring-2 
                         transition-all duration-300 resize-none 
                         text-base leading-relaxed max-h-[200px] min-h-[100px]`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type your message here..."
            />
            {input && (
              <button
                onClick={() => setInput('')}
                className={`absolute top-1/2 right-2 transform -translate-y-1/2 
                           ${isDarkMode ? 'text-white/50 hover:text-white/80' : 'text-black/50 hover:text-black/80'}
                           transition-all duration-300 z-10`}
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => sendMessage('proofread')}
              disabled={loading || !input.trim()}
              className={`flex-1 ${isDarkMode
                  ? "bg-gradient-to-r from-blue-600 to-blue-400"
                  : "bg-gradient-to-r from-blue-500 to-blue-700"
                } text-white 
                         py-3 rounded-2xl text-base
                         hover:opacity-90 
                         transition-all duration-300 
                         disabled:opacity-40 disabled:cursor-not-allowed 
                         active:scale-[0.98]`}
            >
              {loading ? 'Processing...' : 'Proofread'}
            </button>
          </div>

          {/* Response Section */}
          {response && (
            <div className={`${responseClass} rounded-2xl p-4 border relative`}>
              <p className={`${isDarkMode ? 'text-white/90' : 'text-black/90'} mb-2 text-base`}>
                {response}
              </p>
              <button
                onClick={() => copyToClipboard(response)}
                className={`absolute top-2 right-2 ${isDarkMode
                    ? "bg-blue-600/50 hover:bg-blue-700/50"
                    : "bg-blue-500/30 hover:bg-blue-500/50"
                  } 
                           text-white px-3 py-1.5 rounded-xl text-sm
                           transition-all duration-300 
                           active:scale-[0.95]`}
              >
                Copy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;