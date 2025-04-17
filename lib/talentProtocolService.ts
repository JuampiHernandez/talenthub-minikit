// Service to interact with the Talent Protocol API
// Using our API route to handle server-side API calls
const API_BASE_URL = '/api/talent';

export type TalentProfile = {
  id: string;
  fullName: string;
  username?: string;
  bio?: string;
  profilePicture?: string;
  score?: number;
  humanVerified?: boolean;
  tags?: string[];
  // Add credential value field for sorting
  credentialValue?: number | string;
};

// Define credential options for filtering
export type CredentialOption = {
  name: string;
  dataIssuer: string;
  displayName: string;
  // Add slug for credential details lookup
  slug?: string;
};

// Type for credential details response
export type CredentialDetail = {
  id: string;
  name: string;
  slug: string;
  data_issuer: string;
  data_issuer_display_name: string;
  display_name: string;
  description: string;
  image_url: string;
  created_at: string;
  updated_at: string;
};

// Available credential options for filtering
export const CREDENTIAL_OPTIONS: CredentialOption[] = [
  { name: "GitHub Account", dataIssuer: "GitHub", displayName: "GitHub Account", slug: "github-account" },
  { name: "GitHub Crypto Repositories Commits", dataIssuer: "GitHub", displayName: "GitHub Crypto Commits", slug: "github-crypto-repositories-commits" },
  { name: "GitHub Crypto Repositories Contributed", dataIssuer: "GitHub", displayName: "GitHub Crypto Contributions", slug: "github-crypto-repositories-contributed" },
  { name: "GitHub Forks", dataIssuer: "GitHub", displayName: "GitHub Forks", slug: "github-forks" },
  { name: "GitHub Repositories", dataIssuer: "GitHub", displayName: "GitHub Repositories", slug: "github-repositories" },
  { name: "GitHub Stars", dataIssuer: "GitHub", displayName: "GitHub Stars", slug: "github-stars" },
  { name: "GitHub Total Contributions", dataIssuer: "GitHub", displayName: "GitHub Total Contributions", slug: "github-total-contributions" },
  { name: "Base Active Smart Contracts", dataIssuer: "Base", displayName: "Base Active Smart Contracts", slug: "base-active-smart-contracts" },
  { name: "Base Around The World Participant", dataIssuer: "Base", displayName: "Base Around The World Participant", slug: "base-around-the-world-participant" },
  { name: "Base Around The World Winner", dataIssuer: "Base", displayName: "Base Around The World Winner", slug: "base-around-the-world-winner" },
  { name: "Basecamp Attendee", dataIssuer: "Base", displayName: "Basecamp Attendee", slug: "basecamp-attendee" },
  { name: "Contracts Deployed (Mainnet)", dataIssuer: "Base", displayName: "Contracts Deployed (Mainnet)", slug: "contracts-deployed-mainnet" },
  { name: "Contracts Deployed (Testnet)", dataIssuer: "Base", displayName: "Contracts Deployed (Testnet)", slug: "contracts-deployed-testnet" },
  { name: "Onchain Summer Buildathon Participant", dataIssuer: "Base", displayName: "Onchain Summer Buildathon Participant", slug: "onchain-summer-buildathon-participant" },
  { name: "Onchain Summer Buildathon Winner", dataIssuer: "Base", displayName: "Onchain Summer Buildathon Winner", slug: "onchain-summer-buildathon-winner" },
];

// Group credentials by issuer for better UI organization
export const CREDENTIAL_OPTIONS_GROUPED = CREDENTIAL_OPTIONS.reduce((acc, credential) => {
  if (!acc[credential.dataIssuer]) {
    acc[credential.dataIssuer] = [];
  }
  acc[credential.dataIssuer].push(credential);
  return acc;
}, {} as Record<string, CredentialOption[]>);

// Function to fetch all credential details
export async function fetchCredentialDetails(): Promise<CredentialDetail[]> {
  try {
    const apiUrl = `${API_BASE_URL}?endpoint=credentials`;
    console.log('Fetching credential details from:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch credential details: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Fetched ${data.credentials?.length || 0} credential details`);
    
    if (data.credentials && Array.isArray(data.credentials)) {
      return data.credentials;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching credential details:', error);
    return [];
  }
}

// Function to fetch credential values for a specific profile and credential
export async function fetchProfileCredentialValues(profileId: string): Promise<Record<string, any>> {
  try {
    const apiUrl = `${API_BASE_URL}?endpoint=profiles/${profileId}/credentials`;
    console.log(`Fetching credential values for profile ${profileId}`);
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch profile credential values: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.user_credentials && Array.isArray(data.user_credentials)) {
      // Create a map of credential slug to value
      const credentialValues: Record<string, any> = {};
      
      data.user_credentials.forEach((cred: any) => {
        if (cred.credential?.slug && cred.value !== undefined) {
          credentialValues[cred.credential.slug] = cred.value;
        }
      });
      
      return credentialValues;
    }
    
    return {};
  } catch (error) {
    console.error(`Error fetching credential values for profile ${profileId}:`, error);
    return {};
  }
}

// Function to fetch profiles with specific credential
export async function fetchProfilesByCredential(credential: CredentialOption): Promise<TalentProfile[]> {
  try {
    // Creating query parameters based on the Talent Protocol API documentation
    const queryParams = {
      query: {
        credentials: [{
          name: credential.name,
          dataIssuer: credential.dataIssuer
        }]
      },
      sort: {
        score: { 
          order: "desc"
        }
      },
      page: 1,
      per_page: 25  // Changed from 50 to 25 to comply with API limit
    };

    console.log(`Searching for profiles with ${credential.dataIssuer} ${credential.name}`);
    console.log('Params:', JSON.stringify(queryParams, null, 2));

    // Add this to check if the API key is correctly loaded
    const apiUrl = `${API_BASE_URL}?endpoint=search/advanced/profiles`;
    console.log('API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryParams),
    });

    // Log the response status and headers
    console.log('Response status:', response.status);
    // Fix HeadersIterator issue by converting to Array first
    const headersObj: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    console.log('Response headers:', headersObj);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`Failed to fetch profiles: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    // Enhanced logging for API response
    console.log('API response received with status:', response.status);
    
    // Check and log profiles array length if it exists
    if (data.profiles && Array.isArray(data.profiles)) {
      console.log(`Found ${data.profiles.length} profiles in the API response`);
      
      // Log sample of first profile if available
      if (data.profiles.length > 0) {
        console.log('First profile sample:', JSON.stringify(data.profiles[0], null, 2));
      }
    } else {
      console.log('API response structure:', Object.keys(data));
    }
    
    // Add this to check if the API response has profiles
    if (!data.profiles) {
      console.error('No profiles found in API response');
      console.log('Full API response:', JSON.stringify(data, null, 2));
      return mockProfiles;
    }
    
    // Transform the API response to match our app's expected TalentProfile format
    if (data.profiles && Array.isArray(data.profiles)) {
      const transformedProfiles = data.profiles.map((profile: any) => ({
        id: profile.id || '',
        fullName: profile.display_name || profile.name || 'Unknown',
        username: profile.username,
        bio: profile.bio,
        profilePicture: profile.image_url,
        score: profile.builder_score?.points,
        humanVerified: profile.human_checkmark || false,
        tags: profile.tags || []
      }));

      // Log transformed profiles
      console.log(`Transformed ${transformedProfiles.length} profiles`);
      
      // Now fetch credential values for each profile if we have a slug to look up
      if (credential.slug && transformedProfiles.length > 0) {
        console.log(`Fetching credential values for ${transformedProfiles.length} profiles using slug: ${credential.slug}`);
        
        // Fetch credential values for all profiles
        const profileCredentialValuesPromises = transformedProfiles.map((profile: TalentProfile) => 
          fetchProfileCredentialValues(profile.id)
            .then(values => {
              // Set credential value if available
              if (values[credential.slug!]) {
                profile.credentialValue = values[credential.slug!];
              }
              return profile;
            })
        );
        
        // Wait for all profiles to be updated with credential values
        const profilesWithCredValues = await Promise.all(profileCredentialValuesPromises);
        
        // Sort profiles by credential value (descending)
        profilesWithCredValues.sort((a, b) => {
          // If no credential value, put at the end
          if (a.credentialValue === undefined) return 1;
          if (b.credentialValue === undefined) return -1;
          
          // Handle different types of values
          if (typeof a.credentialValue === 'number' && typeof b.credentialValue === 'number') {
            return b.credentialValue - a.credentialValue;
          }
          
          // Convert to string for comparison
          return String(b.credentialValue).localeCompare(String(a.credentialValue));
        });
        
        console.log('Profiles sorted by credential value');
        if (profilesWithCredValues.length > 0) {
          console.log('First profile credential value:', profilesWithCredValues[0].credentialValue);
        }
        
        return profilesWithCredValues;
      }
      
      return transformedProfiles;
    }
    
    return [];
  } catch (error) {
    // Improve error logging
    console.error('Error fetching profiles by credential:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Return mock data for development
    return mockProfiles;
  }
}

// Backward compatibility - this now uses the new function internally
export async function fetchGitHubAccounts(): Promise<TalentProfile[]> {
  return fetchProfilesByCredential(CREDENTIAL_OPTIONS[0]); // GitHub Account credential
}

// Mock data for profiles - these are used when the API can't be reached
// or for local development
const mockProfiles = [
  {
    id: "101",
    fullName: "Alex Johnson",
    username: "alexj",
    bio: "Full-stack developer specializing in React and Node.js",
    profilePicture: "https://randomuser.me/api/portraits/men/1.jpg",
    score: 85,
    humanVerified: true,
    tags: ["React", "Node.js", "TypeScript"],
    credentialValue: 120
  },
  {
    id: "102",
    fullName: "Sarah Williams",
    username: "sarahw",
    bio: "Frontend developer with a passion for UI/UX",
    profilePicture: "https://randomuser.me/api/portraits/women/2.jpg",
    score: 78,
    humanVerified: true,
    tags: ["JavaScript", "React", "CSS"],
    credentialValue: 85
  },
  {
    id: "103",
    fullName: "Miguel Sanchez",
    username: "miguels",
    bio: "Backend engineer specialized in scalable systems",
    profilePicture: "https://randomuser.me/api/portraits/men/3.jpg",
    score: 92,
    humanVerified: true,
    tags: ["Go", "Microservices", "Docker"],
    credentialValue: 210
  },
  {
    id: "104",
    fullName: "Emily Chen",
    username: "emilyc",
    bio: "Machine learning engineer with focus on computer vision",
    profilePicture: "https://randomuser.me/api/portraits/women/4.jpg",
    score: 88,
    humanVerified: true,
    tags: ["Python", "TensorFlow", "Computer Vision"],
    credentialValue: 150
  }
]; 