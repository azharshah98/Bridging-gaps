/**
 * PDF Processing for IFA Referral Forms
 * 
 * Extracts structured data from PDF referral forms using pdf-parse
 * Attempts to identify and extract child information, needs, and placement requirements
 */

import pdfParse from 'pdf-parse';
import { ChildReferral } from '../types';

export interface PDFExtractionResult {
  success: boolean;
  childData?: Partial<ChildReferral>;
  rawText?: string;
  error?: string;
}

export async function extractDataFromPDF(pdfBuffer: Buffer): Promise<PDFExtractionResult> {
  try {
    const pdfData = await pdfParse(pdfBuffer);
    const extractedText = pdfData.text;
    
    console.log(`Extracted ${extractedText.length} characters from PDF`);
    
    // Extract child data using pattern matching
    const childData = extractChildData(extractedText);
    
    const result: PDFExtractionResult = {
      success: true,
      rawText: extractedText,
      childData,
      error: undefined
    };
    
    console.log('PDF extraction completed successfully');
    return result;
    
  } catch (error) {
    console.error('PDF extraction failed:', error);
    
    return {
      success: false,
      rawText: '',
      error: error instanceof Error ? error.message : 'Unknown extraction error'
    };
  }
}

/**
 * Extract child data from PDF text using pattern matching
 */
function extractChildData(text: string): Partial<ChildReferral> {
  const childData: Partial<ChildReferral> = {};
  
  // Normalize text for better matching
  const normalizedText = text.toLowerCase().replace(/\s+/g, ' ');
  
  // Extract age
  const ageMatch = extractAge(normalizedText);
  if (ageMatch) {
    childData.age = ageMatch;
  }
  
  // Extract gender
  const genderMatch = extractGender(normalizedText);
  if (genderMatch) {
    childData.gender = genderMatch;
  }
  
  // Extract ethnicity
  const ethnicityMatch = extractEthnicity(normalizedText);
  if (ethnicityMatch) {
    childData.ethnicity = ethnicityMatch;
  }
  
  // Extract cultural background
  const culturalMatch = extractCulturalBackground(normalizedText);
  if (culturalMatch) {
    childData.culturalBackground = culturalMatch;
  }
  
  // Extract SEN needs
  const senNeeds = extractSENNeeds(normalizedText);
  childData.senNeeds = senNeeds;
  
  // Extract disabilities
  const disabilities = extractDisabilities(normalizedText);
  if (disabilities.length > 0) {
    childData.disabilities = disabilities;
  }
  
  // Extract behavioural needs
  const behaviouralInfo = extractBehaviouralNeeds(normalizedText);
  childData.behaviouralNeeds = behaviouralInfo.hasNeeds;
  if (behaviouralInfo.details) {
    childData.behaviouralDetails = behaviouralInfo.details;
  }
  
  // Extract placement type
  const placementType = extractPlacementType(normalizedText);
  if (placementType) {
    childData.placementType = placementType;
  }
  
  // Extract sibling information
  const siblingInfo = extractSiblingInfo(normalizedText);
  childData.siblingGroup = siblingInfo.isSiblingGroup;
  if (siblingInfo.count) {
    childData.siblingCount = siblingInfo.count;
  }
  
  // Extract pet requirements
  const petsAllowed = extractPetRequirements(normalizedText);
  childData.petsAllowed = petsAllowed;
  
  // Extract location preferences
  const locationInfo = extractLocationPreferences(normalizedText);
  if (locationInfo.preferred.length > 0) {
    childData.preferredLocations = locationInfo.preferred;
  }
  if (locationInfo.excluded.length > 0) {
    childData.excludedLocations = locationInfo.excluded;
  }
  
  // Extract carer gender preference
  const carerGenderPref = extractCarerGenderPreference(normalizedText);
  if (carerGenderPref) {
    childData.carerGenderPreference = carerGenderPref;
  }
  
  // Extract support needs
  const supportNeeds = extractSupportNeeds(normalizedText);
  if (supportNeeds.length > 0) {
    childData.supportNeeds = supportNeeds;
  }
  
  // Extract medical needs
  const medicalNeeds = extractMedicalNeeds(normalizedText);
  if (medicalNeeds.length > 0) {
    childData.medicalNeeds = medicalNeeds;
  }
  
  // Extract educational needs
  const educationalNeeds = extractEducationalNeeds(normalizedText);
  if (educationalNeeds.length > 0) {
    childData.educationalNeeds = educationalNeeds;
  }
  
  // Determine urgency
  const urgency = extractUrgency(normalizedText);
  if (urgency) {
    childData.urgency = urgency;
  }
  
  return childData;
}

/**
 * Extract age from text
 */
function extractAge(text: string): number | null {
  const agePatterns = [
    /age[:\s]+(\d+)/,
    /(\d+)\s+years?\s+old/,
    /dob[:\s]+\d+[\/\-]\d+[\/\-](\d{4})/,
    /date of birth[:\s]+\d+[\/\-]\d+[\/\-](\d{4})/
  ];
  
  for (const pattern of agePatterns) {
    const match = text.match(pattern);
    if (match) {
      if (pattern.source.includes('dob') || pattern.source.includes('date of birth')) {
        // Calculate age from birth year
        const birthYear = parseInt(match[1]);
        const currentYear = new Date().getFullYear();
        const age = currentYear - birthYear;
        if (age >= 0 && age <= 18) {
          return age;
        }
      } else {
        const age = parseInt(match[1]);
        if (age >= 0 && age <= 18) {
          return age;
        }
      }
    }
  }
  
  return null;
}

/**
 * Extract gender from text
 */
function extractGender(text: string): 'male' | 'female' | null {
  const malePatterns = [
    /gender[:\s]+male/,
    /sex[:\s]+male/,
    /\bmale\b/,
    /\bboy\b/,
    /\bhe\b/,
    /\bhim\b/,
    /\bhis\b/
  ];
  
  const femalePatterns = [
    /gender[:\s]+female/,
    /sex[:\s]+female/,
    /\bfemale\b/,
    /\bgirl\b/,
    /\bshe\b/,
    /\bher\b/
  ];
  
  for (const pattern of malePatterns) {
    if (text.match(pattern)) {
      return 'male';
    }
  }
  
  for (const pattern of femalePatterns) {
    if (text.match(pattern)) {
      return 'female';
    }
  }
  
  return null;
}

/**
 * Extract ethnicity from text
 */
function extractEthnicity(text: string): string | null {
  const ethnicityPatterns = [
    /ethnicity[:\s]+([a-z\s]+)/,
    /ethnic[:\s]+([a-z\s]+)/,
    /race[:\s]+([a-z\s]+)/,
    /background[:\s]+([a-z\s]+)/
  ];
  
  const commonEthnicities = [
    'white british', 'white english', 'white scottish', 'white welsh', 'white irish',
    'black caribbean', 'black african', 'black british',
    'asian indian', 'asian pakistani', 'asian bangladeshi', 'asian chinese',
    'mixed white and black caribbean', 'mixed white and black african',
    'mixed white and asian', 'mixed other'
  ];
  
  for (const pattern of ethnicityPatterns) {
    const match = text.match(pattern);
    if (match) {
      const ethnicity = match[1].trim();
      // Check if it matches common ethnicities
      const found = commonEthnicities.find(e => ethnicity.includes(e));
      if (found) {
        return found;
      }
      return ethnicity;
    }
  }
  
  return null;
}

/**
 * Extract cultural background from text
 */
function extractCulturalBackground(text: string): string | null {
  const culturalPatterns = [
    /cultural background[:\s]+([a-z\s]+)/,
    /culture[:\s]+([a-z\s]+)/,
    /heritage[:\s]+([a-z\s]+)/,
    /religion[:\s]+([a-z\s]+)/
  ];
  
  for (const pattern of culturalPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  return null;
}

/**
 * Extract SEN needs from text
 */
function extractSENNeeds(text: string): boolean {
  const senPatterns = [
    /special educational needs/,
    /\bsen\b/,
    /learning difficulties/,
    /learning disability/,
    /special needs/,
    /educational support/,
    /statement of needs/,
    /ehcp/,
    /education health care plan/
  ];
  
  return senPatterns.some(pattern => text.match(pattern));
}

/**
 * Extract disabilities from text
 */
function extractDisabilities(text: string): string[] {
  const disabilities: string[] = [];
  
  const disabilityPatterns = [
    /autism/,
    /adhd/,
    /cerebral palsy/,
    /down syndrome/,
    /epilepsy/,
    /hearing impairment/,
    /visual impairment/,
    /physical disability/,
    /learning disability/,
    /mental health/,
    /developmental delay/
  ];
  
  for (const pattern of disabilityPatterns) {
    const match = text.match(pattern);
    if (match) {
      disabilities.push(match[0]);
    }
  }
  
  return disabilities;
}

/**
 * Extract behavioural needs from text
 */
function extractBehaviouralNeeds(text: string): { hasNeeds: boolean; details?: string } {
  const behaviouralPatterns = [
    /behavioural/,
    /challenging behaviour/,
    /conduct disorder/,
    /oppositional defiant/,
    /anger management/,
    /aggressive/,
    /disruptive/,
    /attachment issues/,
    /trauma/
  ];
  
  const hasNeeds = behaviouralPatterns.some(pattern => text.match(pattern));
  
  let details = '';
  if (hasNeeds) {
    // Try to extract more detailed information
    const detailMatch = text.match(/behavioural[:\s]+([^.]+)/);
    if (detailMatch) {
      details = detailMatch[1].trim();
    }
  }
  
  return { hasNeeds, details: details || undefined };
}

/**
 * Extract placement type from text
 */
function extractPlacementType(text: string): 'emergency' | 'short-term' | 'long-term' | 'respite' | null {
  if (text.includes('emergency')) return 'emergency';
  if (text.includes('long-term') || text.includes('permanent')) return 'long-term';
  if (text.includes('respite')) return 'respite';
  if (text.includes('short-term') || text.includes('temporary')) return 'short-term';
  
  return null;
}

/**
 * Extract sibling information from text
 */
function extractSiblingInfo(text: string): { isSiblingGroup: boolean; count?: number } {
  const siblingPatterns = [
    /sibling group/,
    /siblings/,
    /brother/,
    /sister/,
    /(\d+)\s+children/
  ];
  
  const isSiblingGroup = siblingPatterns.some(pattern => text.match(pattern));
  
  let count: number | undefined;
  const countMatch = text.match(/(\d+)\s+children/);
  if (countMatch) {
    count = parseInt(countMatch[1]);
  }
  
  return { isSiblingGroup, count };
}

/**
 * Extract pet requirements from text
 */
function extractPetRequirements(text: string): boolean {
  const petPatterns = [
    /pets allowed/,
    /pet friendly/,
    /animals allowed/,
    /dog friendly/,
    /cat friendly/
  ];
  
  return petPatterns.some(pattern => text.match(pattern));
}

/**
 * Extract location preferences from text
 */
function extractLocationPreferences(text: string): { preferred: string[]; excluded: string[] } {
  const preferred: string[] = [];
  const excluded: string[] = [];
  
  // Common UK locations
  const locations = [
    'london', 'manchester', 'birmingham', 'leeds', 'glasgow', 'liverpool',
    'edinburgh', 'bristol', 'cardiff', 'belfast', 'newcastle', 'sheffield',
    'nottingham', 'brighton', 'cambridge', 'oxford', 'york', 'bath'
  ];
  
  for (const location of locations) {
    if (text.includes(`preferred: ${location}`) || text.includes(`prefer ${location}`)) {
      preferred.push(location);
    }
    if (text.includes(`not ${location}`) || text.includes(`avoid ${location}`)) {
      excluded.push(location);
    }
  }
  
  return { preferred, excluded };
}

/**
 * Extract carer gender preference from text
 */
function extractCarerGenderPreference(text: string): 'male' | 'female' | null {
  if (text.includes('male carer') || text.includes('male foster')) return 'male';
  if (text.includes('female carer') || text.includes('female foster')) return 'female';
  
  return null;
}

/**
 * Extract support needs from text
 */
function extractSupportNeeds(text: string): string[] {
  const supportNeeds: string[] = [];
  
  const supportPatterns = [
    /therapy/,
    /counselling/,
    /social work/,
    /mental health support/,
    /educational support/,
    /medical support/,
    /speech therapy/,
    /occupational therapy/,
    /physiotherapy/
  ];
  
  for (const pattern of supportPatterns) {
    const match = text.match(pattern);
    if (match) {
      supportNeeds.push(match[0]);
    }
  }
  
  return supportNeeds;
}

/**
 * Extract medical needs from text
 */
function extractMedicalNeeds(text: string): string[] {
  const medicalNeeds: string[] = [];
  
  const medicalPatterns = [
    /medication/,
    /medical condition/,
    /hospital/,
    /doctor/,
    /treatment/,
    /therapy/,
    /chronic condition/,
    /health condition/
  ];
  
  for (const pattern of medicalPatterns) {
    const match = text.match(pattern);
    if (match) {
      medicalNeeds.push(match[0]);
    }
  }
  
  return medicalNeeds;
}

/**
 * Extract educational needs from text
 */
function extractEducationalNeeds(text: string): string[] {
  const educationalNeeds: string[] = [];
  
  const educationalPatterns = [
    /special school/,
    /mainstream school/,
    /home schooling/,
    /tutoring/,
    /educational support/,
    /sen support/,
    /school transport/
  ];
  
  for (const pattern of educationalPatterns) {
    const match = text.match(pattern);
    if (match) {
      educationalNeeds.push(match[0]);
    }
  }
  
  return educationalNeeds;
}

/**
 * Extract urgency level from text
 */
function extractUrgency(text: string): 'low' | 'medium' | 'high' | 'emergency' | null {
  if (text.includes('emergency') || text.includes('urgent')) return 'emergency';
  if (text.includes('high priority')) return 'high';
  if (text.includes('low priority')) return 'low';
  
  return 'medium'; // Default
} 