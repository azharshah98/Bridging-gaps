import { useState, useEffect } from 'react'
import { referralService } from '../lib/database'
import { useRouter } from 'next/router'

export default function Referrals() {
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingReferral, setEditingReferral] = useState(null)
  const [selectedReferral, setSelectedReferral] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterUrgency, setFilterUrgency] = useState('all')
  const [formData, setFormData] = useState({
    childName: '',
    childAge: '',
    childGender: '',
    urgency: 'medium',
    status: 'pending',
    referringAgency: '',
    socialWorker: '',
    socialWorkerEmail: '',
    socialWorkerPhone: '',
    placementType: 'emergency',
    duration: 'short_term',
    specialNeeds: '',
    behavioralIssues: '',
    medicalNeeds: '',
    educationalNeeds: '',
    siblings: false,
    siblingCount: '',
    siblingDetails: '',
    preferredLocation: '',
    additionalInfo: '',
    notes: ''
  })
  
  const router = useRouter()

  useEffect(() => {
    fetchReferrals()
    // Check if we should open the form (from query params)
    if (router.query.action === 'new') {
      setShowForm(true)
    }
  }, [router.query])

  const fetchReferrals = async () => {
    try {
      const referralList = await referralService.getAll()
      setReferrals(referralList)
    } catch (error) {
      console.error('Error fetching referrals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const referralData = {
        ...formData,
        childAge: parseInt(formData.childAge),
        siblingCount: formData.siblings ? parseInt(formData.siblingCount) : 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      if (editingReferral) {
        await referralService.update(editingReferral.id, referralData)
      } else {
        await referralService.create(referralData)
      }
      await fetchReferrals()
      resetForm()
    } catch (error) {
      console.error('Error saving referral:', error)
    }
  }

  const handleEdit = (referral) => {
    setEditingReferral(referral)
    setFormData({
      ...referral,
      childAge: referral.childAge?.toString() || '',
      siblingCount: referral.siblingCount?.toString() || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this referral?')) {
      try {
        await referralService.delete(id)
        await fetchReferrals()
      } catch (error) {
        console.error('Error deleting referral:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      childName: '',
      childAge: '',
      childGender: '',
      urgency: 'medium',
      status: 'pending',
      referringAgency: '',
      socialWorker: '',
      socialWorkerEmail: '',
      socialWorkerPhone: '',
      placementType: 'emergency',
      duration: 'short_term',
      specialNeeds: '',
      behavioralIssues: '',
      medicalNeeds: '',
      educationalNeeds: '',
      siblings: false,
      siblingCount: '',
      siblingDetails: '',
      preferredLocation: '',
      additionalInfo: '',
      notes: ''
    })
    setEditingReferral(null)
    setShowForm(false)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // Filter referrals based on search and filters
  const filteredReferrals = referrals.filter(referral => {
    const matchesSearch = !searchTerm || 
      referral.childName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referringAgency?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.socialWorker?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || referral.status === filterStatus
    const matchesUrgency = filterUrgency === 'all' || referral.urgency === filterUrgency
    
    return matchesSearch && matchesStatus && matchesUrgency
  })

  // Calculate stats
  const stats = {
    total: referrals.length,
    pending: referrals.filter(r => r.status === 'pending').length,
    matched: referrals.filter(r => r.status === 'matched').length,
    assigned: referrals.filter(r => r.status === 'assigned').length,
    urgent: referrals.filter(r => r.urgency === 'urgent').length
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'matched': return 'bg-blue-100 text-blue-800'
      case 'assigned': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading referrals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Referrals Management</h1>
            <p className="text-gray-600 mt-1">Manage child referrals and carer matching</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button 
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Referral
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold">📋</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Referrals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">⏳</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold">🎯</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Matched</p>
              <p className="text-2xl font-bold text-gray-900">{stats.matched}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-semibold">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-gray-900">{stats.assigned}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-semibold">🚨</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Urgent</p>
              <p className="text-2xl font-bold text-gray-900">{stats.urgent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search referrals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div className="flex space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="matched">Matched</option>
              <option value="assigned">Assigned</option>
              <option value="closed">Closed</option>
            </select>
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">All Urgency</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Referrals Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Child Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referring Agency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urgency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Placement Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReferrals.map((referral) => (
                <tr key={referral.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {referral.childName || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {referral.childAge ? `${referral.childAge} years old` : 'Age unknown'} • {referral.childGender || 'Gender unknown'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{referral.referringAgency || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">{referral.socialWorker || 'No social worker assigned'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(referral.status)}`}>
                      {referral.status || 'unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(referral.urgency)}`}>
                      {referral.urgency || 'medium'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {referral.placementType || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {referral.createdAt ? new Date(referral.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(referral)}
                        className="text-teal-600 hover:text-teal-900"
                      >
                        Edit
                      </button>
                      {referral.status === 'matched' && referral.matchedCarers && referral.matchedCarers.length > 0 && (
                        <button
                          onClick={() => setSelectedReferral(referral)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Matches
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(referral.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredReferrals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No referrals found</div>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Add/Edit Referral Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingReferral ? 'Edit Referral' : 'New Referral'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Child Information */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Child Information</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Child Name *
                  </label>
                  <input
                    type="text"
                    name="childName"
                    value={formData.childName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="childAge"
                    value={formData.childAge}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="childGender"
                    value={formData.childGender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency *
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Referral Information */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Referral Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referring Agency *
                  </label>
                  <input
                    type="text"
                    name="referringAgency"
                    value={formData.referringAgency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Worker *
                  </label>
                  <input
                    type="text"
                    name="socialWorker"
                    value={formData.socialWorker}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Worker Email
                  </label>
                  <input
                    type="email"
                    name="socialWorkerEmail"
                    value={formData.socialWorkerEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Worker Phone
                  </label>
                  <input
                    type="tel"
                    name="socialWorkerPhone"
                    value={formData.socialWorkerPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                {/* Placement Details */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Placement Details</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Placement Type *
                  </label>
                  <select
                    name="placementType"
                    value={formData.placementType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  >
                    <option value="emergency">Emergency</option>
                    <option value="short_term">Short Term</option>
                    <option value="long_term">Long Term</option>
                    <option value="respite">Respite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="short_term">Short Term (&lt; 6 months)</option>
                    <option value="medium_term">Medium Term (6-12 months)</option>
                    <option value="long_term">Long Term (&gt; 12 months)</option>
                    <option value="permanent">Permanent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Location
                  </label>
                  <input
                    type="text"
                    name="preferredLocation"
                    value={formData.preferredLocation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="matched">Matched</option>
                    <option value="assigned">Assigned</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Siblings */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Siblings</h3>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="siblings"
                      checked={formData.siblings}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Child has siblings that need placement</span>
                  </label>
                </div>

                {formData.siblings && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Siblings
                      </label>
                      <input
                        type="number"
                        name="siblingCount"
                        value={formData.siblingCount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sibling Details
                      </label>
                      <textarea
                        name="siblingDetails"
                        value={formData.siblingDetails}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Ages, names, special needs, etc."
                      />
                    </div>
                  </>
                )}

                {/* Needs Assessment */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Needs Assessment</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Needs
                  </label>
                  <textarea
                    name="specialNeeds"
                    value={formData.specialNeeds}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Describe any special needs or disabilities"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Behavioral Issues
                  </label>
                  <textarea
                    name="behavioralIssues"
                    value={formData.behavioralIssues}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Describe any behavioral challenges"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medical Needs
                  </label>
                  <textarea
                    name="medicalNeeds"
                    value={formData.medicalNeeds}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Describe any medical conditions or needs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Educational Needs
                  </label>
                  <textarea
                    name="educationalNeeds"
                    value={formData.educationalNeeds}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Describe any educational support needed"
                  />
                </div>

                {/* Additional Information */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Additional Information</h3>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Information
                  </label>
                  <textarea
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Any other relevant information"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Internal notes for staff use"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                >
                  {editingReferral ? 'Update Referral' : 'Create Referral'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Matched Carers Modal */}
      {selectedReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Matched Carers for {selectedReferral.childName}
                </h2>
                <button
                  onClick={() => setSelectedReferral(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {selectedReferral.matchedCarers && selectedReferral.matchedCarers.length > 0 ? (
                <div className="space-y-4">
                  {selectedReferral.matchedCarers
                    .filter(match => match.score > 0)
                    .sort((a, b) => b.score - a.score)
                    .map((match, index) => (
                    <div key={match.carerId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">
                            {match.carerName}
                          </h3>
                          <span className={`ml-3 inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                            match.score >= 80 ? 'bg-green-100 text-green-800' :
                            match.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {match.score}% Match
                          </span>
                          {match.recommended && (
                            <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                              Recommended
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">Rank #{index + 1}</p>
                        </div>
                      </div>
                      
                      {match.matchDetails && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(match.matchDetails).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="font-medium text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                              <span className="ml-2 text-gray-900">{value} points</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                          View Profile
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
                          Assign to Carer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg mb-2">No matches found</div>
                  <p className="text-gray-400">This referral has no matched carers yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 