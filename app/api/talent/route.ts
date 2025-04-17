import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.talentprotocol.com';
const API_KEY = process.env.TALENT_PROTOCOL_API_KEY;

// Define interfaces for credential data types
interface Credential {
  name: string;
  slug?: string;
  data_issuer: string;
  value?: string | number | boolean;
}

interface UserCredential {
  credential?: Credential;
  value?: string | number | boolean;
}

// Enhanced logging for better debugging
function logDebugInfo(message: string, data?: unknown): void {
  console.log(`[Talent API Route] ${message}`);
  if (data) {
    try {
      console.log(JSON.stringify(data, null, 2));
    } catch {
      console.log('Could not stringify data:', data);
    }
  }
}

// Mock data for when API access fails
const mockResponse = {
  profiles: [
    {
      id: "101",
      display_name: "Alex Johnson",
      username: "alexj",
      bio: "Full-stack developer specializing in React and Node.js",
      image_url: "https://randomuser.me/api/portraits/men/1.jpg",
      builder_score: { points: 85 },
      human_checkmark: true,
      tags: ["React", "Node.js", "TypeScript"]
    },
    {
      id: "102",
      display_name: "Sarah Williams",
      username: "sarahw",
      bio: "Frontend developer with a passion for UI/UX",
      image_url: "https://randomuser.me/api/portraits/women/2.jpg",
      builder_score: { points: 78 },
      human_checkmark: true,
      tags: ["JavaScript", "React", "CSS"]
    },
    {
      id: "103",
      display_name: "Miguel Sanchez",
      username: "miguels",
      bio: "Backend engineer specialized in scalable systems",
      image_url: "https://randomuser.me/api/portraits/men/3.jpg",
      builder_score: { points: 92 },
      human_checkmark: true,
      tags: ["Go", "Microservices", "Docker"]
    },
    {
      id: "104",
      display_name: "Emily Chen",
      username: "emilyc",
      bio: "Machine learning engineer with focus on computer vision",
      image_url: "https://randomuser.me/api/portraits/women/4.jpg",
      builder_score: { points: 88 },
      human_checkmark: true,
      tags: ["Python", "TensorFlow", "Computer Vision"]
    }
  ]
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint');

  logDebugInfo(`GET request for endpoint: ${endpoint}`);

  if (!endpoint) {
    logDebugInfo('Missing endpoint parameter');
    return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
  }

  // Check if API key is available
  if (!API_KEY) {
    logDebugInfo('API Key is missing in environment variables, returning mock data');
    
    // If this is a credential endpoint, return mock credential data
    if (endpoint.includes('credentials')) {
      return NextResponse.json({ 
        user_credentials: [
          {
            credential: {
              name: "GitHub Stars",
              slug: "github-stars",
              data_issuer: "GitHub"
            },
            value: 120
          },
          {
            credential: {
              name: "GitHub Repositories",
              slug: "github-repositories",
              data_issuer: "GitHub"
            },
            value: 25
          }
        ]
      });
    }
    
    return NextResponse.json(mockResponse);
  }

  // Log API key length and first/last few characters for debugging
  logDebugInfo(`API Key length: ${API_KEY.length}`);
  if (API_KEY.length > 8) {
    const maskedKey = `${API_KEY.substring(0, 4)}...${API_KEY.substring(API_KEY.length - 4)}`;
    logDebugInfo(`API Key (masked): ${maskedKey}`);
  }

  try {
    const apiUrl = `${API_BASE_URL}/${endpoint}`;
    logDebugInfo(`Forwarding GET request to: ${apiUrl}`);
    
    const hasApiKey = Boolean(API_KEY);
    logDebugInfo(`API Key present: ${hasApiKey ? 'Yes' : 'No'}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'X-API-KEY': API_KEY,
        'Accept': 'application/json',
      },
    });

    logDebugInfo(`Response status: ${response.status}`);
    
    // Log all headers as an object
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    logDebugInfo('Response headers:', responseHeaders);

    if (!response.ok) {
      const errorText = await response.text();
      logDebugInfo(`API error response: ${errorText}`);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    logDebugInfo('API response received successfully');
    
    // Enhanced logging for profile credential data
    if (endpoint.includes('profiles') && endpoint.includes('credentials')) {
      const profileId = endpoint.split('/')[1]; // Extract profile ID from the endpoint
      logDebugInfo(`Credential data for profile ${profileId}:`);
      
      if (data.user_credentials && Array.isArray(data.user_credentials)) {
        logDebugInfo(`Found ${data.user_credentials.length} credentials for profile`);
        
        // Log each credential with formatted details
        data.user_credentials.forEach((cred: UserCredential, index: number) => {
          const credName = cred.credential?.name || 'Unknown';
          const credIssuer = cred.credential?.data_issuer || 'Unknown';
          const credValue = cred.value !== undefined ? cred.value : 'N/A';
          
          logDebugInfo(`Credential #${index + 1}: ${credIssuer} - ${credName} = ${credValue}`);
        });
        
        // Create a simplified map for easier debugging
        const credentialMap: Record<string, Record<string, string | number | boolean>> = {};
        data.user_credentials.forEach((cred: UserCredential) => {
          if (cred.credential?.slug) {
            credentialMap[cred.credential.slug] = {
              name: cred.credential.name,
              issuer: cred.credential.data_issuer,
              value: cred.value !== undefined ? cred.value : 'N/A'
            };
          }
        });
        
        logDebugInfo('Credential map for easy reference:', credentialMap);
      } else {
        logDebugInfo('No credential data found for this profile');
      }
    }
    
    return NextResponse.json(data);
  } catch (error) {
    logDebugInfo(`Error in GET request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return NextResponse.json({ error: 'Failed to fetch data from Talent Protocol' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint');

  logDebugInfo(`POST request for endpoint: ${endpoint}`);

  if (!endpoint) {
    logDebugInfo('Missing endpoint parameter');
    return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
  }

  // Check if API key is available
  if (!API_KEY) {
    logDebugInfo('API Key is missing in environment variables, returning mock data');
    
    // Return mock data for search endpoints
    if (endpoint.includes('search')) {
      return NextResponse.json(mockResponse);
    }
    
    return NextResponse.json({ 
      success: true,
      message: "Mock data returned due to missing API key"
    });
  }

  // Log API key length and first/last few characters for debugging
  logDebugInfo(`API Key length: ${API_KEY.length}`);
  if (API_KEY.length > 8) {
    const maskedKey = `${API_KEY.substring(0, 4)}...${API_KEY.substring(API_KEY.length - 4)}`;
    logDebugInfo(`API Key (masked): ${maskedKey}`);
  }

  try {
    const body = await request.json();
    logDebugInfo('Request body:', body);
    
    // For advanced search, we need to use the correctly formatted parameters
    if (endpoint === 'search/advanced/profiles') {
      logDebugInfo('Using advanced search format for profiles');
      
      // Using GET with URL-encoded query parameters as recommended in the docs
      const queryString = Object.keys(body)
        .map(key => `${key}=${encodeURIComponent(JSON.stringify(body[key]))}`)
        .join('&');
      
      const url = `${API_BASE_URL}/${endpoint}?${queryString}`;
      logDebugInfo(`Full URL for API request: ${url}`);
      
      // Log API key for debugging (masked for security)
      logDebugInfo(`API Key present: ${Boolean(API_KEY) ? 'Yes' : 'No'}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': API_KEY,
          'Accept': 'application/json',
        },
      });
      
      logDebugInfo(`Response status: ${response.status}`);
      
      // Log all headers as an object
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      logDebugInfo('Response headers:', responseHeaders);
      
      if (!response.ok) {
        const errorText = await response.text();
        logDebugInfo(`API error response: ${errorText}`);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      const profilesCount = data.profiles?.length || 0;
      logDebugInfo(`API response received with ${profilesCount} profiles`);
      
      // Log a sample of the first profile if available
      if (data.profiles && data.profiles.length > 0) {
        logDebugInfo('First profile sample:', data.profiles[0]);
      }
      
      return NextResponse.json(data);
    } else {
      // Default POST request for other endpoints
      const apiUrl = `${API_BASE_URL}/${endpoint}`;
      logDebugInfo(`Forwarding POST request to: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'X-API-KEY': API_KEY,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      logDebugInfo(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        logDebugInfo(`API error response: ${errorText}`);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      logDebugInfo('API response received successfully');
      
      return NextResponse.json(data);
    }
  } catch (error) {
    logDebugInfo(`Error in POST request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    logDebugInfo(`Error stack: ${error instanceof Error ? error.stack : 'No stack trace'}`);
    
    return NextResponse.json({ 
      error: 'Failed to post data to Talent Protocol',
      details: error instanceof Error ? error.message : undefined
    }, { status: 500 });
  }
} 