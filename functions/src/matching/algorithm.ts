/**
 * Foster Care Matching Algorithm
 * 
 * This module implements a weighted scoring system to match children with suitable carers
 * based on various criteria including age, location, experience, and preferences.
 */

import { CarerProfile, ChildReferral, MatchingResult, MatchDetail, MatchingCriteria } from '../types';

// Default matching criteria with weights and points
const DEFAULT_MATCHING_CRITERIA: MatchingCriteria = {
  ageRange: { weight: 1.0, points: 30 },
  siblings: { weight: 1.0, points: 20 },
  behavioural: { weight: 1.0, points: 15 },
  location: { weight: 1.0, points: 15 },
  sen: { weight: 1.0, points: 10 },
  pets: { weight: 1.0, points: 5 },
  capacity: { weight: 1.0, points: 5 }
};

/**
 * Calculate match score between a child referral and a carer profile
 */
export function calculateMatchScore(
  referral: ChildReferral,
  carer: CarerProfile,
  criteria: MatchingCriteria = DEFAULT_MATCHING_CRITERIA
): MatchingResult {
  const matchDetails: MatchDetail[] = [];
  let totalScore = 0;
  let maxPossibleScore = 0;

  // Calculate maximum possible score
  Object.values(criteria).forEach(criterion => {
    maxPossibleScore += criterion.points * criterion.weight;
  });

  // 1. Age Range Compatibility (30 points)
  const ageMatch = checkAgeCompatibility(referral, carer, criteria.ageRange);
  matchDetails.push(ageMatch);
  if (ageMatch.matched) {
    totalScore += ageMatch.points;
  }

  // 2. Sibling Group Acceptance (20 points)
  const siblingMatch = checkSiblingCompatibility(referral, carer, criteria.siblings);
  matchDetails.push(siblingMatch);
  if (siblingMatch.matched) {
    totalScore += siblingMatch.points;
  }

  // 3. Behavioural Needs Experience (15 points)
  const behaviouralMatch = checkBehaviouralCompatibility(referral, carer, criteria.behavioural);
  matchDetails.push(behaviouralMatch);
  if (behaviouralMatch.matched) {
    totalScore += behaviouralMatch.points;
  }

  // 4. Location Preferences (15 points)
  const locationMatch = checkLocationCompatibility(referral, carer, criteria.location);
  matchDetails.push(locationMatch);
  if (locationMatch.matched) {
    totalScore += locationMatch.points;
  }

  // 5. Special Educational Needs (SEN) Experience (10 points)
  const senMatch = checkSENCompatibility(referral, carer, criteria.sen);
  matchDetails.push(senMatch);
  if (senMatch.matched) {
    totalScore += senMatch.points;
  }

  // 6. Pet Compatibility (5 points)
  const petMatch = checkPetCompatibility(referral, carer, criteria.pets);
  matchDetails.push(petMatch);
  if (petMatch.matched) {
    totalScore += petMatch.points;
  }

  // 7. Available Capacity (5 points)
  const capacityMatch = checkCapacityAvailability(referral, carer, criteria.capacity);
  matchDetails.push(capacityMatch);
  if (capacityMatch.matched) {
    totalScore += capacityMatch.points;
  }

  // Determine if this is a recommended match (>= 70% score)
  const scorePercentage = (totalScore / maxPossibleScore) * 100;
  const recommended = scorePercentage >= 70;

  return {
    carerId: carer.id,
    score: totalScore,
    maxPossibleScore,
    matchDetails,
    recommended
  };
}

/**
 * Check if child's age falls within carer's accepted age range
 */
function checkAgeCompatibility(
  referral: ChildReferral,
  carer: CarerProfile,
  criteria: { weight: number; points: number }
): MatchDetail {
  const matched = referral.age >= carer.minAge && referral.age <= carer.maxAge;
  
  return {
    criterion: 'Age Range',
    points: matched ? criteria.points * criteria.weight : 0,
    matched,
    details: matched 
      ? `Child age ${referral.age} is within carer's range (${carer.minAge}-${carer.maxAge})`
      : `Child age ${referral.age} is outside carer's range (${carer.minAge}-${carer.maxAge})`
  };
}

/**
 * Check if carer accepts siblings when child is part of sibling group
 */
function checkSiblingCompatibility(
  referral: ChildReferral,
  carer: CarerProfile,
  criteria: { weight: number; points: number }
): MatchDetail {
  // If child is not part of sibling group, this criterion doesn't apply
  if (!referral.siblingGroup) {
    return {
      criterion: 'Sibling Group',
      points: 0,
      matched: true, // Neutral - doesn't affect score
      details: 'Child is not part of a sibling group'
    };
  }

  const matched = carer.acceptsSiblings;
  
  return {
    criterion: 'Sibling Group',
    points: matched ? criteria.points * criteria.weight : 0,
    matched,
    details: matched 
      ? 'Carer accepts sibling groups and child is part of sibling group'
      : 'Carer does not accept sibling groups but child is part of sibling group'
  };
}

/**
 * Check if carer has experience with behavioural needs
 */
function checkBehaviouralCompatibility(
  referral: ChildReferral,
  carer: CarerProfile,
  criteria: { weight: number; points: number }
): MatchDetail {
  // If child doesn't have behavioural needs, this criterion doesn't apply
  if (!referral.behaviouralNeeds) {
    return {
      criterion: 'Behavioural Needs',
      points: 0,
      matched: true, // Neutral - doesn't affect score
      details: 'Child does not have behavioural needs'
    };
  }

  const matched = carer.experienceWithBehaviouralNeeds;
  
  return {
    criterion: 'Behavioural Needs',
    points: matched ? criteria.points * criteria.weight : 0,
    matched,
    details: matched 
      ? 'Carer has experience with behavioural needs and child has behavioural needs'
      : 'Carer lacks experience with behavioural needs but child has behavioural needs'
  };
}

/**
 * Check location compatibility between referral and carer preferences
 */
function checkLocationCompatibility(
  referral: ChildReferral,
  carer: CarerProfile,
  criteria: { weight: number; points: number }
): MatchDetail {
  // Check if any of the child's preferred locations match carer's preferred location
  const preferredLocationMatch = referral.preferredLocations.some(
    location => location.toLowerCase() === carer.preferredLocation.toLowerCase()
  );

  // Check if carer's location is in child's excluded locations
  const carerLocationExcluded = referral.excludedLocations.some(
    location => location.toLowerCase() === carer.preferredLocation.toLowerCase()
  );

  // Check if any of child's preferred locations are in carer's excluded locations
  const childLocationExcluded = referral.preferredLocations.some(
    childLocation => carer.excludedLocations.some(
      carerExcluded => carerExcluded.toLowerCase() === childLocation.toLowerCase()
    )
  );

  let matched = false;
  let details = '';

  if (carerLocationExcluded) {
    matched = false;
    details = `Carer's location (${carer.preferredLocation}) is in child's excluded locations`;
  } else if (childLocationExcluded) {
    matched = false;
    details = 'Child\'s preferred locations conflict with carer\'s excluded locations';
  } else if (preferredLocationMatch) {
    matched = true;
    details = `Location match found: ${carer.preferredLocation}`;
  } else {
    matched = false;
    details = `No location match between child preferences (${referral.preferredLocations.join(', ')}) and carer location (${carer.preferredLocation})`;
  }

  return {
    criterion: 'Location',
    points: matched ? criteria.points * criteria.weight : 0,
    matched,
    details
  };
}

/**
 * Check if carer has SEN experience when child has SEN needs
 */
function checkSENCompatibility(
  referral: ChildReferral,
  carer: CarerProfile,
  criteria: { weight: number; points: number }
): MatchDetail {
  // If child doesn't have SEN needs, this criterion doesn't apply
  if (!referral.senNeeds) {
    return {
      criterion: 'SEN Experience',
      points: 0,
      matched: true, // Neutral - doesn't affect score
      details: 'Child does not have SEN needs'
    };
  }

  const matched = carer.experienceWithSEN;
  
  return {
    criterion: 'SEN Experience',
    points: matched ? criteria.points * criteria.weight : 0,
    matched,
    details: matched 
      ? 'Carer has SEN experience and child has SEN needs'
      : 'Carer lacks SEN experience but child has SEN needs'
  };
}

/**
 * Check pet compatibility between referral and carer
 */
function checkPetCompatibility(
  referral: ChildReferral,
  carer: CarerProfile,
  criteria: { weight: number; points: number }
): MatchDetail {
  // If child doesn't need pets allowed, this criterion doesn't apply
  if (!referral.petsAllowed) {
    return {
      criterion: 'Pet Compatibility',
      points: 0,
      matched: true, // Neutral - doesn't affect score
      details: 'Child does not require pets to be allowed'
    };
  }

  const matched = carer.allowsPets;
  
  return {
    criterion: 'Pet Compatibility',
    points: matched ? criteria.points * criteria.weight : 0,
    matched,
    details: matched 
      ? 'Carer allows pets and child requires pets to be allowed'
      : 'Carer does not allow pets but child requires pets to be allowed'
  };
}

/**
 * Check if carer has available capacity
 */
function checkCapacityAvailability(
  referral: ChildReferral,
  carer: CarerProfile,
  criteria: { weight: number; points: number }
): MatchDetail {
  // This is a simplified check - in a real system, you'd query current placements
  // For now, we assume carer has capacity if they're active
  const matched = carer.status === 'active' && carer.capacity > 0;
  
  return {
    criterion: 'Available Capacity',
    points: matched ? criteria.points * criteria.weight : 0,
    matched,
    details: matched 
      ? `Carer has available capacity (${carer.capacity})`
      : 'Carer does not have available capacity or is inactive'
  };
}

/**
 * Match a referral against all active carers and return sorted results
 */
export function matchReferralToCarers(
  referral: ChildReferral,
  carers: CarerProfile[],
  criteria: MatchingCriteria = DEFAULT_MATCHING_CRITERIA
): MatchingResult[] {
  // Filter to only active carers
  const activeCarers = carers.filter(carer => carer.status === 'active');

  // Calculate match scores for all active carers
  const matchResults = activeCarers.map(carer => 
    calculateMatchScore(referral, carer, criteria)
  );

  // Sort by score (highest first), then by recommendation status
  return matchResults.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }
    return b.recommended ? 1 : -1;
  });
}

/**
 * Get top N matches for a referral
 */
export function getTopMatches(
  referral: ChildReferral,
  carers: CarerProfile[],
  topN: number = 5,
  criteria: MatchingCriteria = DEFAULT_MATCHING_CRITERIA
): MatchingResult[] {
  const allMatches = matchReferralToCarers(referral, carers, criteria);
  return allMatches.slice(0, topN);
}

/**
 * Filter matches by minimum score threshold
 */
export function filterMatchesByScore(
  matches: MatchingResult[],
  minScore: number
): MatchingResult[] {
  return matches.filter(match => match.score >= minScore);
}

/**
 * Get only recommended matches
 */
export function getRecommendedMatches(matches: MatchingResult[]): MatchingResult[] {
  return matches.filter(match => match.recommended);
} 