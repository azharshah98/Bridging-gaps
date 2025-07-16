import { useState, useEffect } from 'react'
import { referralService, carerService } from '../lib/database'

export default function Matching() {
  const [referrals, setReferrals] = useState([])
  const [carers, setCarers] = useState([])
  const [selectedReferral, setSelectedReferral] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [matchingLoading, setMatchingLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [referralList, carerList] = await Promise.all([
        referralService.getAll(),
        carerService.getAll()
      ])
      

      
      setReferrals(referralList.filter(r => r.status === 'pending' || r.status === 'matched'))
      setCarers(carerList.filter(c => c.availability?.status === 'active'))
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Simple matching algorithm (client-side for demo)
  const calculateMatches = (referral) => {
    if (!referral || !carers.length) return []
    
    // Debug: log the carers being processed
    console.log('Carers being matched:', carers)

    const matchResults = carers.filter(carer => {
      // INSTANT DECLINE: Age range compatibility check
      const childAge = referral.childAge || 0
      const carerMinAge = carer.ageRangeMin || 0
      const carerMaxAge = carer.ageRangeMax || 18
      
      // If child age is outside carer's age range, exclude this carer completely
      if (childAge < carerMinAge || childAge > carerMaxAge) {
        console.log(`DECLINED: ${carer.name || 'Unknown Carer'} - Child age ${childAge} outside carer range ${carerMinAge}-${carerMaxAge}`)
        return false
      }
      
      return true
    }).map(carer => {
      let score = 0
      let maxScore = 0
      const matchDetails = []

      // Age range compatibility (30 points) - Already filtered, so this is always a match
      maxScore += 30
      const childAge = referral.childAge || 0
      const carerMinAge = carer.ageRangeMin || 0
      const carerMaxAge = carer.ageRangeMax || 18
      
      score += 30
      matchDetails.push({ 
        criterion: 'Age Range', 
        status: 'match', 
        details: `Child age ${childAge} fits carer range ${carerMinAge}-${carerMaxAge}` 
      })

      // Sibling group compatibility (20 points)
      maxScore += 20
      if (referral.siblings && referral.siblingCount) {
        const totalChildren = 1 + parseInt(referral.siblingCount)
        const carerCapacity = carer.maxChildren || 1
        
        if (totalChildren <= carerCapacity) {
          score += 20
          matchDetails.push({ 
            criterion: 'Sibling Group', 
            status: 'match', 
            details: `Can accommodate ${totalChildren} children (capacity: ${carerCapacity})` 
          })
        } else {
          matchDetails.push({ 
            criterion: 'Sibling Group', 
            status: 'mismatch', 
            details: `Cannot accommodate ${totalChildren} children (capacity: ${carerCapacity})` 
          })
        }
      } else {
        score += 20
        matchDetails.push({ 
          criterion: 'Sibling Group', 
          status: 'match', 
          details: 'Single child placement - no sibling considerations' 
        })
      }

      // Special needs experience (15 points)
      maxScore += 15
      if (referral.specialNeeds && referral.specialNeeds.trim()) {
        if (carer.specialNeeds) {
          score += 15
          matchDetails.push({ 
            criterion: 'Special Needs', 
            status: 'match', 
            details: 'Carer has special needs experience' 
          })
        } else {
          matchDetails.push({ 
            criterion: 'Special Needs', 
            status: 'mismatch', 
            details: 'Child has special needs but carer lacks experience' 
          })
        }
      } else {
        score += 15
        matchDetails.push({ 
          criterion: 'Special Needs', 
          status: 'match', 
          details: 'No special needs requirements' 
        })
      }

      // Behavioral support (15 points)
      maxScore += 15
      if (referral.behavioralIssues && referral.behavioralIssues.trim()) {
        if (carer.behavioralSupport) {
          score += 15
          matchDetails.push({ 
            criterion: 'Behavioral Support', 
            status: 'match', 
            details: 'Carer has behavioral support experience' 
          })
        } else {
          matchDetails.push({ 
            criterion: 'Behavioral Support', 
            status: 'mismatch', 
            details: 'Child has behavioral issues but carer lacks experience' 
          })
        }
      } else {
        score += 15
        matchDetails.push({ 
          criterion: 'Behavioral Support', 
          status: 'match', 
          details: 'No behavioral support requirements' 
        })
      }

      // Location preference (10 points)
      maxScore += 10
      if (referral.preferredLocation && carer.city) {
        if (referral.preferredLocation.toLowerCase().includes(carer.city.toLowerCase()) ||
            carer.city.toLowerCase().includes(referral.preferredLocation.toLowerCase())) {
          score += 10
          matchDetails.push({ 
            criterion: 'Location', 
            status: 'match', 
            details: `Preferred location matches carer area` 
          })
        } else {
          matchDetails.push({ 
            criterion: 'Location', 
            status: 'partial', 
            details: `Different location but may be acceptable` 
          })
          score += 5
        }
      } else {
        score += 10
        matchDetails.push({ 
          criterion: 'Location', 
          status: 'match', 
          details: 'No specific location requirements' 
        })
      }

      // Placement type compatibility (10 points)
      maxScore += 10
      const urgencyScore = {
        'urgent': 10,
        'high': 8,
        'medium': 6,
        'low': 4
      }
      
      score += urgencyScore[referral.urgency] || 6
      matchDetails.push({ 
        criterion: 'Urgency', 
        status: 'match', 
        details: `Urgency level: ${referral.urgency || 'medium'}` 
      })

      const percentageScore = Math.round((score / maxScore) * 100)
      const recommended = percentageScore >= 70

      return {
        carer,
        score: percentageScore,
        matchDetails,
        recommended
      }
    })

    // Sort by score (highest first) and filter out zero scores
    return matchResults
      .filter(match => match.score > 0)
      .sort((a, b) => b.score - a.score)
  }

  const handleReferralSelect = (referral) => {
    setSelectedReferral(referral)
    setMatchingLoading(true)
    
    // Simulate processing time
    setTimeout(() => {
      const matchResults = calculateMatches(referral)
      setMatches(matchResults)
      setMatchingLoading(false)
    }, 1000)
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getMatchStatusColor = (status) => {
    switch (status) {
      case 'match': return 'text-green-600 bg-green-100'
      case 'partial': return 'text-yellow-600 bg-yellow-100'
      case 'mismatch': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getMatchStatusIcon = (status) => {
    switch (status) {
      case 'match': return '✅'
      case 'partial': return '⚠️'
      case 'mismatch': return '❌'
      default: return '❓'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading matching system...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Smart Matching System</h1>
            <p className="text-gray-600 mt-1">Find the best carer matches for child referrals</p>
          </div>
          <div className="mt-4 sm:mt-0 text-sm text-gray-500">
            {referrals.length} pending referrals • {carers.length} available carers
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referrals List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Pending Referrals</h2>
              <p className="text-sm text-gray-600 mt-1">Select a referral to find matches</p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  onClick={() => handleReferralSelect(referral)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                    selectedReferral?.id === referral.id
                      ? 'bg-teal-50 border-teal-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {referral.childName || 'Unknown Child'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {referral.childAge ? `${referral.childAge} years old` : 'Age unknown'} • {referral.childGender || 'Gender unknown'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {referral.referringAgency || 'Unknown Agency'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        referral.urgency === 'urgent' ? 'bg-red-100 text-red-800' :
                        referral.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                        referral.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {referral.urgency || 'medium'}
                      </span>
                      {referral.siblings && (
                        <span className="text-xs text-gray-500 mt-1">
                          +{referral.siblingCount || 0} siblings
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {referrals.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">📋</div>
                <p>No pending referrals</p>
              </div>
            )}
          </div>
        </div>

        {/* Matching Results */}
        <div className="lg:col-span-2">
          {!selectedReferral ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Smart Matching</h2>
                <p className="text-gray-600 mb-6">Select a referral from the left to see compatible carer matches</p>
                <div className="bg-teal-50 rounded-lg p-4 text-left max-w-md mx-auto">
                  <h3 className="font-semibold text-teal-900 mb-2">Matching Criteria:</h3>
                  <ul className="text-sm text-teal-800 space-y-1">
                    <li>• Age range compatibility (30%)</li>
                    <li>• Sibling group capacity (20%)</li>
                    <li>• Special needs experience (15%)</li>
                    <li>• Behavioral support skills (15%)</li>
                    <li>• Location preferences (10%)</li>
                    <li>• Urgency level (10%)</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Selected Referral Info */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Matching for: {selectedReferral.childName || 'Unknown Child'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Age & Gender:</span>
                    <p className="text-sm text-gray-900">
                      {selectedReferral.childAge ? `${selectedReferral.childAge} years old` : 'Age unknown'} • {selectedReferral.childGender || 'Gender unknown'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Urgency:</span>
                    <p className="text-sm text-gray-900">{selectedReferral.urgency || 'Medium'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Siblings:</span>
                    <p className="text-sm text-gray-900">
                      {selectedReferral.siblings ? `Yes (${selectedReferral.siblingCount || 0} siblings)` : 'No'}
                    </p>
                  </div>
                </div>
                {(selectedReferral.specialNeeds || selectedReferral.behavioralIssues) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedReferral.specialNeeds && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Special Needs:</span>
                          <p className="text-sm text-gray-900">
                            {typeof selectedReferral.specialNeeds === 'object' 
                              ? JSON.stringify(selectedReferral.specialNeeds) 
                              : selectedReferral.specialNeeds}
                          </p>
                        </div>
                      )}
                      {selectedReferral.behavioralIssues && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Behavioral Issues:</span>
                          <p className="text-sm text-gray-900">
                            {typeof selectedReferral.behavioralIssues === 'object' 
                              ? JSON.stringify(selectedReferral.behavioralIssues) 
                              : selectedReferral.behavioralIssues}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Matching Results */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Carer Matches</h3>
                    {matchingLoading && (
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600 mr-2"></div>
                        Calculating matches...
                      </div>
                    )}
                  </div>
                </div>

                {matchingLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Analyzing compatibility...</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {matches.map((match, index) => (
                      <div key={match.carer.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h4 className="text-lg font-medium text-gray-900">
                                {match.carer.name || `${match.carer.firstName || ''} ${match.carer.lastName || ''}`.trim() || 'Unknown Carer'}
                              </h4>
                              <span className={`ml-3 inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getScoreColor(match.score)}`}>
                                {match.score}% Match
                              </span>
                              {match.recommended && (
                                <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {match.carer.city || 'Location unknown'} • {(() => {
                                const exp = match.carer.experience;
                                if (!exp) return 'Experience unknown';
                                if (typeof exp === 'string') return exp;
                                if (exp.level) return exp.level;
                                if (exp.yearsOfExperience) return `${exp.yearsOfExperience} years`;
                                return 'Experience available';
                              })()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">Rank #{index + 1}</p>
                            <p className="text-xs text-gray-500">of {matches.length} matches</p>
                          </div>
                        </div>

                        {/* Match Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {match.matchDetails.map((detail, detailIndex) => (
                            <div key={detailIndex} className={`p-3 rounded-lg border ${getMatchStatusColor(detail.status)}`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{detail.criterion}</span>
                                <span className="text-lg">{getMatchStatusIcon(detail.status)}</span>
                              </div>
                              <p className="text-xs opacity-90">{detail.details}</p>
                            </div>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                            View Full Profile
                          </button>
                          <button className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
                            Assign to Carer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {matches.length === 0 && !matchingLoading && (
                  <div className="p-8 text-center text-gray-500">
                    <div className="text-4xl mb-2">🔍</div>
                    <p>No compatible carers found</p>
                    <p className="text-sm mt-1">Try adjusting the referral criteria or check carer availability</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 