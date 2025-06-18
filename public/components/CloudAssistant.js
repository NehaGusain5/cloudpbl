import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaShoppingCart } from 'react-icons/fa';

const CloudAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [userPreferences, setUserPreferences] = useState({
    priceRange: null,
    category: null
  });
  const messagesEndRef = useRef(null);

  const initialMessage = {
    type: 'assistant',
    content: "Hi! I'm Cloud, your AI shopping assistant. How can I help you today? You can ask me about products, prices, or get personalized recommendations."
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([initialMessage]);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getRecommendations = async (preferences) => {
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });
      const data = await response.json();
      if (data.success) {
        return data.products;
      }
      return [];
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  };

  const getPersonalizedRecommendations = async () => {
    try {
      const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
      const response = await fetch('/api/ai/personalized-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartItems }),
      });
      const data = await response.json();
      if (data.success) {
        return data.products;
      }
      return [];
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return [];
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      type: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Process user input and generate response
    const response = await processUserInput(input);
    setMessages(prev => [...prev, { type: 'assistant', content: response.message }]);
    
    if (response.recommendations) {
      setRecommendations(response.recommendations);
    }
    
    setIsTyping(false);
  };

  const processUserInput = async (userInput) => {
    const lowerInput = userInput.toLowerCase();
    
    // Handle price range queries
    if (lowerInput.includes('price') || lowerInput.includes('budget')) {
      const priceMatch = userInput.match(/\d+/g);
      if (priceMatch) {
        const maxPrice = parseInt(priceMatch[0]);
        setUserPreferences(prev => ({
          ...prev,
          priceRange: { min: 0, max: maxPrice }
        }));
        const recommendations = await getRecommendations({
          priceRange: { min: 0, max: maxPrice }
        });
        return {
          message: `I've found some products within your budget of $${maxPrice}. Here are some recommendations:`,
          recommendations
        };
      }
      return {
        message: "What's your price range? Please specify a maximum amount you'd like to spend."
      };
    }
    
    // Handle category queries
    if (lowerInput.includes('looking for') || lowerInput.includes('interested in')) {
      const categories = ['electronics', 'clothing', 'books', 'home', 'beauty'];
      const matchedCategory = categories.find(cat => lowerInput.includes(cat));
      
      if (matchedCategory) {
        setUserPreferences(prev => ({
          ...prev,
          category: matchedCategory
        }));
        const recommendations = await getRecommendations({
          category: matchedCategory
        });
        return {
          message: `Here are some great ${matchedCategory} products I think you'll like:`,
          recommendations
        };
      }
      return {
        message: "What type of products are you interested in? I can help you find electronics, clothing, books, home goods, or beauty products."
      };
    }
    
    // Handle recommendation requests
    if (lowerInput.includes('recommend') || lowerInput.includes('suggestion')) {
      const recommendations = await getPersonalizedRecommendations();
      if (recommendations.length > 0) {
        return {
          message: "Based on your shopping history, here are some products you might like:",
          recommendations
        };
      }
      return {
        message: "I'd be happy to recommend some products! What type of items are you interested in?"
      };
    }
    
    // Default response
    return {
      message: "I understand you're looking for something. Could you tell me more about what you're interested in? I can help you find products by category or price range."
    };
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    setMessages(prev => [...prev, {
      type: 'assistant',
      content: `I've added ${product.name} to your cart!`
    }]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all"
        >
          <FaRobot className="text-2xl" />
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-96 h-[600px] flex flex-col">
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <FaRobot className="text-2xl mr-2" />
              <h2 className="text-lg font-semibold">Cloud Assistant</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:text-gray-200"
            >
              <FaTimes />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {recommendations.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-semibold text-gray-800">Recommended Products:</h3>
                {recommendations.map((product, index) => (
                  <div key={index} className="bg-white border rounded-lg p-3 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-gray-600">${product.price}</p>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                      >
                        <FaShoppingCart />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                  Cloud is typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-all"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudAssistant; 