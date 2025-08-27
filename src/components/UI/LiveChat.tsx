import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, User, Bot, Clock } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  typing?: boolean;
}

interface LiveChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LiveChat({ isOpen, onClose }: LiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'connecting' | 'online' | 'typing'>('connecting');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agentResponses = [
    "Hi there! 👋 I'm Sarah from BrickSure. How can I help you protect your property today?",
    "That's a great question! Let me help you with that. Our Basic tier starts with fire, lightning, and explosion coverage - perfect for essential protection.",
    "Absolutely! You can add multiple properties to your account. Each property gets its own policy and certificate.",
    "Our quotes are instant! Once you upload your property details, you'll see pricing options immediately. Most customers get approved within minutes.",
    "Yes, we accept all major payment methods - cards, bank transfers, USSD, or you can fund your BrickSure wallet for faster transactions.",
    "Your certificate comes with a QR code that banks, landlords, or authorities can scan to verify instantly. It's completely digital and secure.",
    "Great question! Our policies are underwritten by Sovereign Trust Insurance PLC, so you're backed by a licensed Nigerian insurer.",
    "I'd be happy to help you get started! Would you like me to guide you through adding your first property?"
  ];

  const quickReplies = [
    "How much does it cost?",
    "What's covered?",
    "How fast is approval?",
    "Can I add multiple properties?",
    "How do I get started?"
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Simulate connection and first message
      setTimeout(() => {
        setAgentStatus('online');
        addAgentMessage(agentResponses[0]);
      }, 1500);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addAgentMessage = (text: string) => {
    setIsTyping(true);
    setAgentStatus('typing');
    
    // Simulate typing delay based on message length
    const typingDelay = Math.min(text.length * 30, 2000);
    
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text,
        sender: 'agent',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
      setAgentStatus('online');
    }, typingDelay);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate agent response
    setTimeout(() => {
      const randomResponse = agentResponses[Math.floor(Math.random() * (agentResponses.length - 1)) + 1];
      addAgentMessage(randomResponse);
    }, 800 + Math.random() * 1200);
  };

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      addUserMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleQuickReply = (reply: string) => {
    addUserMessage(reply);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none">
      <Card className="w-full max-w-md h-[600px] flex flex-col pointer-events-auto animate-in slide-in-from-bottom-4 duration-300 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                agentStatus === 'online' ? 'bg-green-500' : 
                agentStatus === 'typing' ? 'bg-yellow-500' : 'bg-gray-400'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold">Sarah</h3>
              <p className="text-xs text-blue-100">
                {agentStatus === 'connecting' ? 'Connecting...' :
                 agentStatus === 'typing' ? 'Typing...' : 'Online'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {agentStatus === 'connecting' && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm">Connecting you to an agent...</span>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`max-w-[80%] ${
                message.sender === 'user' 
                  ? 'bg-blue-500 text-white rounded-l-lg rounded-tr-lg' 
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-r-lg rounded-tl-lg shadow-sm'
              } px-4 py-2`}>
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="bg-white dark:bg-gray-800 rounded-r-lg rounded-tl-lg shadow-sm px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {messages.length > 0 && messages.length < 3 && (
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick replies:</p>
            <div className="flex flex-wrap gap-2">
              {quickReplies.slice(0, 3).map((reply, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickReply(reply)}
                  className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              disabled={agentStatus === 'connecting'}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || agentStatus === 'connecting'}
              size="sm"
              className="px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Powered by BrickSure • We typically reply instantly
          </p>
        </div>
      </Card>
    </div>
  );
}