import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { CreditCardIcon, ReceiptRefundIcon, ClockIcon } from '@heroicons/react/24/outline'

const Billing = () => {
  const { user, api } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')

  useEffect(() => {
    fetchTransactions()
  }, [api])

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/users/me/transactions')
      setTransactions(response.data)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCredits = async () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    try {
      const response = await api.post('/users/me/add-credits', { amount: parseFloat(amount) })
      alert('Credits added successfully!')
      setAmount('')
      fetchTransactions() // Refresh transactions
    } catch (error) {
      alert('Failed to add credits: ' + (error.response?.data?.detail || 'Unknown error'))
    }
  }

  const getStatusColor = (type) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-100 text-green-800'
      case 'withdrawal':
        return 'bg-red-100 text-red-800'
      case 'chat_cost':
        return 'bg-yellow-100 text-yellow-800'
      case 'subscription':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (type) => {
    switch (type) {
      case 'deposit':
        return 'Added'
      case 'withdrawal':
        return 'Withdrawn'
      case 'chat_cost':
        return 'Chat Cost'
      case 'subscription':
        return 'Subscription'
      default:
        return type
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <CreditCardIcon className="h-5 w-5 text-green-500" />
      case 'withdrawal':
        return <ReceiptRefundIcon className="h-5 w-5 text-red-500" />
      case 'chat_cost':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case 'subscription':
        return <CreditCardIcon className="h-5 w-5 text-blue-500" />
      default:
        return <CreditCardIcon className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Balance Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Account Balance</h2>
            <p className="text-gray-600">Manage your credits and view transaction history</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">₮{user?.credits || 0}</div>
            <div className="text-sm text-gray-500">Available Balance</div>
          </div>
        </div>
      </div>

      {/* Add Credits */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Credits</h2>
        <div className="flex space-x-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleAddCredits}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Add Credits
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Enter the amount of credits you want to add to your account
        </p>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
          <p className="text-sm text-gray-600">View all your credit transactions</p>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions found
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getIcon(transaction.transaction_type)}
                    <div>
                      <div className="font-medium text-gray-900">
                        {getStatusText(transaction.transaction_type)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.description || 'No description'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(transaction.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.amount > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount} ₮
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Balance: {transaction.balance_after} ₮
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Billing