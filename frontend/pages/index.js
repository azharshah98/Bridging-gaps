import { useState, useEffect } from 'react'
import { dashboardService } from '../lib/database'
import Link from 'next/link'

export default function Home() {
  const [stats, setStats] = useState({
    totalCarers: 0,
    activeReferrals: 0,
    assignedReferrals: 0
  })
  const [dailySummary, setDailySummary] = useState({
    totalToday: 0,
    urgentToday: 0,
    matchedToday: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    async function fetchStats() {
      try {
        const [dashboardStats, dailySummaryData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getDailyReferralsSummary()
        ])
        
        setStats(dashboardStats)
        setDailySummary(dailySummaryData)
        
        // Generate recent activity from actual data
        const activity = []
        
        // Add recent carers
        if (dashboardStats.totalCarers > 0) {
          activity.push({
            id: 1,
            type: 'carer',
            message: `${dashboardStats.totalCarers} foster carers registered in system`,
            time: 'System data',
            icon: '👥'
          })
        }
        
        // Add recent referrals
        if (dashboardStats.activeReferrals > 0) {
          activity.push({
            id: 2,
            type: 'referral',
            message: `${dashboardStats.activeReferrals} active referrals awaiting matching`,
            time: 'Current status',
            icon: '📋'
          })
        }
        
        // Add assigned referrals
        if (dashboardStats.assignedReferrals > 0) {
          activity.push({
            id: 3,
            type: 'assignment',
            message: `${dashboardStats.assignedReferrals} referrals assigned to carers`,
            time: 'Current status',
            icon: '✅'
          })
        }
        
        // Add daily summary
        if (dailySummaryData.totalToday > 0) {
          activity.push({
            id: 4,
            type: 'daily',
            message: `${dailySummaryData.totalToday} new referrals received today`,
            time: 'Today',
            icon: '📅'
          })
        }
        
        // Add system status
        activity.push({
          id: 5,
          type: 'system',
          message: 'BGFA Management System operational',
          time: 'System status',
          icon: '✅'
        })
        
        setRecentActivity(activity)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'Foster Carers',
      value: stats.totalCarers,
      icon: '👥',
      color: 'bg-teal-500',
      lightColor: 'bg-teal-50',
      textColor: 'text-teal-700'
    },
    {
      title: 'Active Referrals',
      value: stats.activeReferrals,
      icon: '📋',
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Assigned Referrals',
      value: stats.assignedReferrals,
      icon: '✅',
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    }
  ]

  const dailyCards = [
    {
      title: 'Today\'s Referrals',
      value: dailySummary.totalToday,
      icon: '📅',
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'Urgent Today',
      value: dailySummary.urgentToday,
      icon: '🚨',
      color: 'bg-red-500',
      lightColor: 'bg-red-50',
      textColor: 'text-red-700'
    },
    {
      title: 'Matched Today',
      value: dailySummary.matchedToday,
      icon: '🎯',
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
      textColor: 'text-green-700'
    }
  ]

  const quickActions = [
    { name: 'New Referral', href: '/referrals?action=new', icon: '📝', color: 'bg-teal-600 hover:bg-teal-700', description: 'Process a new child referral' },
    { name: 'Add Carer', href: '/carers?action=new', icon: '👤', color: 'bg-green-600 hover:bg-green-700', description: 'Register a new foster carer' },
    { name: 'Smart Match', href: '/matching', icon: '🎯', color: 'bg-blue-600 hover:bg-blue-700', description: 'Find suitable carer matches' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome to BGFA Management System</h1>
            <p className="text-teal-100">Secure A Child's Future - Here's what's happening with your fostering agency today.</p>
          </div>
          <div className="hidden md:block">
            <div className="text-6xl opacity-20">🏠</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`w-12 h-12 ${card.lightColor} rounded-lg flex items-center justify-center text-xl`}>
                {card.icon}
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dailyCards.map((card, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className={`w-10 h-10 ${card.lightColor} rounded-lg flex items-center justify-center text-lg`}>
                  {card.icon}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
                  <p className="text-xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className={`${action.color} text-white p-4 rounded-lg transition-colors group`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{action.icon}</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-sm">{action.name}</h3>
              <p className="text-xs opacity-90 mt-1">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-sm">
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}