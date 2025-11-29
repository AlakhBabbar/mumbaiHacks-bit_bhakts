import { useState, useEffect, useRef } from 'react';
import { auth } from '../firebase/firebase';
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2 } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadChatHistory();
    }
  }, [isOpen]);

  const loadChatHistory = async () => {
    setLoadingHistory(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const response = await fetch(`http://localhost:3000/api/chat/history?userId=${user.uid}`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        // Load existing conversation
        const historyMessages = data.data.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp?.seconds * 1000 || msg.timestamp)
        }));
        setMessages(historyMessages);
      } else {
        // Show initial greeting if no history
        setMessages([
          {
            role: 'assistant',
            content: 'Hello! I\'m your financial AI assistant. I have access to your financial data and can help you with spending insights, investment advice, goal planning, and more. How can I help you today?',
            timestamp: new Date()
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Show greeting on error
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! I\'m your financial AI assistant. How can I help you today?',
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const user = auth.currentUser;
    if (!user) {
      alert('Please login to use the chat assistant');
      return;
    }

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageContent = input.trim();
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          message: messageContent
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(data.timestamp || new Date())
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-emerald-400 text-black p-4 rounded-full shadow-lg hover:bg-emerald-300 transition-all hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" strokeWidth={2} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-gradient-to-r from-emerald-400/10 to-emerald-600/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-400/20 rounded-full flex items-center justify-center border border-emerald-400/30">
                <Bot className="w-5 h-5 text-emerald-400" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">AI Assistant</h3>
                <p className="text-gray-400 text-xs">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-emerald-400/10 rounded-full flex items-center justify-center border border-emerald-400/20">
                    <Bot className="w-4 h-4 text-emerald-400" strokeWidth={2} />
                  </div>
                )}

                <div className={`flex flex-col max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-emerald-400 text-black'
                        : 'bg-zinc-800 text-white border border-zinc-700'
                    }`}
                  >
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 px-1">
                    {formatTime(message.timestamp)}
                  </span>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
                    <User className="w-4 h-4 text-gray-400" strokeWidth={2} />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-400/10 rounded-full flex items-center justify-center border border-emerald-400/20">
                  <Bot className="w-4 h-4 text-emerald-400" strokeWidth={2} />
                </div>
                <div className="bg-zinc-800 rounded-2xl px-4 py-2 border border-zinc-700">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
                    <span className="text-xs text-gray-400">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-zinc-800">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={loading}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-400 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-emerald-400 text-black p-2 rounded-xl hover:bg-emerald-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-4 h-4" strokeWidth={2} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
