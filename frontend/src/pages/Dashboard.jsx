import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  CreditCardIcon, 
  ChartBarIcon, 
  ClockIcon,
  UserGroupIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const { user, api } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [chatStats, subscriptionUsage] = await Promise.all([
          api.get('/users/me/chat-statistics'),
          api.get('/users/me/subscription/usage')
        ])
        
        setStats({
          chatStats: chatStats.data,
          subscriptionUsage: subscriptionUsage.data
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [api])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.username}!</h1>
            <p className="text-gray-600 mt-1">Here's your account overview</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">₮{user?.credits || 0}</div>
            <div className="text-sm text-gray-500">Available Balance</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Chats */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Chats</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.chatStats?.total_chats || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Tokens Used */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tokens This Month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.subscriptionUsage?.tokens_this_month || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Chats This Hour */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Chats This Hour</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.subscriptionUsage?.chats_this_hour || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Total Cost */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCardIcon className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Cost</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₮{stats?.chatStats?.total_cost || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <PlusCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
            <span>Add Credits</span>
          </button>
          <button className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <CreditCardIcon className="h-5 w-5 text-green-500 mr-2" />
            <span>Manage Subscription</span>
          </button>
          <button className="flex items-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <ChartBarIcon className="h-5 w-5 text-purple-500 mr-2" />
            <span>View Analytics</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.chatStats?.model_stats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage by Model</h2>
          <div className="space-y-3">
            {Object.entries(stats.chatStats.model_stats).map(([model, data]) => (
              <div key={model} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">{model}</span>
                  <span className="ml-2 text-sm text-gray-500">{data.count} chats</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{data.tokens} tokens</div>
                  <div className="text-sm font-medium text-gray-900">₮{data.cost}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard