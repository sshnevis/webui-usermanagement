import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { CreditCardIcon, CheckIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline'

const Subscriptions = () => {
  const { user, api } = useAuth()
  const [plans, setPlans] = useState([])
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansResponse, subscriptionResponse] = await Promise.all([
          api.get('/subscription-plans'),
          api.get('/users/me/subscription')
        ])
        
        setPlans(plansResponse.data)
        setCurrentSubscription(subscriptionResponse.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [api])

  const handleSubscribe = async (planId) => {
    setLoading(true)
    setMessage('')

    try {
      const response = await api.post('/subscribe', { plan_id: planId })
      setMessage('Successfully subscribed to the plan!')
      
      // Refresh subscription data
      const subscriptionResponse = await api.get('/users/me/subscription')
      setCurrentSubscription(subscriptionResponse.data)
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to subscribe')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (plan) => {
    if (currentSubscription && currentSubscription.plan_id === plan.id) {
      return 'bg-green-100 text-green-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (plan) => {
    if (currentSubscription && currentSubscription.plan_id === plan.id) {
      return 'Current Plan'
    }
    return 'Available'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Current Subscription */}
      {currentSubscription && currentSubscription.plan && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Subscription</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Plan Name</h3>
              <p className="text-blue-800 mt-1">{currentSubscription.plan.name}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Price</h3>
              <p className="text-blue-800 mt-1">₮{currentSubscription.plan.price}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Expires</h3>
              <p className="text-blue-800 mt-1">
                {new Date(currentSubscription.end_date).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Status</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Available Plans</h2>
          <p className="text-sm text-gray-600">Choose a plan that fits your needs</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`border rounded-lg p-6 hover:shadow-lg transition-shadow ${
                  currentSubscription && currentSubscription.plan_id === plan.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(plan)}`}>
                    {getStatusText(plan)}
                  </span>
                </div>
                
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">₮{plan.price}</span>
                  <span className="text-gray-600 ml-1">/ {plan.duration_days} days</span>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    {plan.max_chats_per_hour} chats per hour
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    {plan.max_tokens_per_month.toLocaleString()} tokens per month
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    {plan.can_access_vip_models ? 'VIP model access' : 'Standard models only'}
                  </div>
                </div>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading || (currentSubscription && currentSubscription.plan_id === plan.id)}
                  className={`w-full py-2 px-4 rounded-md font-medium ${
                    currentSubscription && currentSubscription.plan_id === plan.id
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {currentSubscription && currentSubscription.plan_id === plan.id
                    ? 'Current Plan'
                    : 'Subscribe Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Comparison */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Plan Comparison</h2>
          <p className="text-sm text-gray-600">Compare features across all plans</p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feature
                  </th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Price
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₮{plan.price}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Duration
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {plan.duration_days} days
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Max Chats per Hour
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {plan.max_chats_per_hour}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Max Tokens per Month
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {plan.max_tokens_per_month.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    VIP Model Access
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {plan.can_access_vip_models ? (
                        <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <XMarkIcon className="h-5 w-5 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-lg ${message.includes('successfully') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message}
        </div>
      )}
    </div>
  )
}

export default Subscriptions