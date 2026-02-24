import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  ChatBubbleLeftRightIcon, 
  SparklesIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

const Chat = () => {
  const { user, api } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState('')
  const [rateLimitStatus, setRateLimitStatus] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchModels()
    fetchRateLimitStatus()
  }, [api])

  const fetchModels = async () => {
    try {
      const response = await api.get('/models')
      setModels(response.data)
      if (response.data.length > 0) {
        setSelectedModel(response.data[0].name)
      }
    } catch (error) {
      console.error('Failed to fetch models:', error)
    }
  }

  const fetchRateLimitStatus = async () => {
    try {
      const response = await api.get('/users/me/rate-limit-status')
      setRateLimitStatus(response.data)
    } catch (error) {
      console.error('Failed to fetch rate limit status:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const newMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInput('')
    setLoading(true)
    setError('')

    try {
      // Simulate API call to Open WebUI
      // In a real implementation, this would call the actual Open WebUI API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Calculate tokens (simplified estimation)
      const inputTokens = Math.ceil(input.length / 4)
      const outputTokens = Math.ceil(input.length / 3) // Rough estimate
      const cost = calculateCost(inputTokens, outputTokens, selectedModel)

      // Create chat record
      const chatData = {
        model_name: selectedModel,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost: cost
      }

      const response = await api.post('/chats', chatData)
      
      if (response.data) {
        const botMessage = {
          id: Date.now() + 1,
          text: `Response from ${selectedModel} (Cost: ₮${cost})`,
          sender: 'bot',
          timestamp: new Date(),
          model: selectedModel,
          tokens: inputTokens + outputTokens
        }
        setMessages(prev => [...prev, botMessage])
        
        // Update user balance
        setUserBalance(prev => prev - cost)
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to send message')
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        text: `Error: ${error.response?.data?.detail || 'Failed to process message'}`,
        sender: 'error',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
      fetchRateLimitStatus() // Refresh rate limit status
    }
  }

  const calculateCost = (inputTokens, outputTokens, modelName) => {
    // Simplified cost calculation
    const pricing = {
      'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'llama-2': { input: 0.0005, output: 0.0005 },
      'vip-gpt-4': { input: 0.05, output: 0.10 }
    }
    
    const modelPricing = pricing[modelName] || pricing['gpt-3.5-turbo']
    const inputCost = (inputTokens / 1000) * modelPricing.input
    const outputCost = (outputTokens / 1000) * modelPricing.output
    
    return Math.round((inputCost + outputCost) * 100) / 100
  }

  const canSendMessage = rateLimitStatus?.can_send_chat
  const remainingChats = rateLimitStatus?.plan?.max_chats_per_hour - rateLimitStatus?.chats_this_hour
  const remainingTokens = rateLimitStatus?.plan?.max_tokens_per_month - rateLimitStatus?.tokens_this_month

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Chat Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Chat</h1>
              <p className="text-gray-600">Chat with AI models using your credits</p>
            </div>
          </div>
          
          {/* Balance Display */}
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">₮{user?.credits || 0}</div>
            <div className="text-sm text-gray-500">Available Balance</div>
          </div>
        </div>
      </div>

      {/* Rate Limit Status */}
      {rateLimitStatus && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">Rate Limit Status</h3>
              <div className="text-xs text-yellow-700 mt-1 space-y-1">
                <div>Chats this hour: {rateLimitStatus.chats_this_hour} / {rateLimitStatus.plan?.max_chats_per_hour}</div>
                <div>Tokens this month: {rateLimitStatus.tokens_this_month.toLocaleString()} / {rateLimitStatus.plan?.max_tokens_per_month.toLocaleString()}</div>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    canSendMessage ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {canSendMessage ? 'Can send messages' : 'Rate limit exceeded'}
                  </span>
                  {remainingChats > 0 && (
                    <span className="text-xs text-gray-600">Next chat available in {remainingChats} messages</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <div className="bg-white rounded-lg shadow">
        {/* Message List */}
        <div className="border-b border-gray-200 p-4 h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>Start a conversation with AI</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : message.sender === 'error'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="text-sm">{message.text}</div>
                    {message.model && (
                      <div className="text-xs opacity-75 mt-1 flex items-center">
                        <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                        Model: {message.model} • {message.tokens} tokens
                      </div>
                    )}
                    <div className="text-xs opacity-75 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <div className="flex-1">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-2"
                disabled={loading}
              >
                {models.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name} {model.requires_vip ? '(VIP)' : ''}
                  </option>
                ))}
              </select>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading || !canSendMessage}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim() || !canSendMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
              
              {!canSendMessage && (
                <p className="text-xs text-red-600 mt-1">Rate limit exceeded. Please wait before sending more messages.</p>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat