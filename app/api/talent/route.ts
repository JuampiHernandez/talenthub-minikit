import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.talentprotocol.com';
const API_KEY = process.env.TALENT_PROTOCOL_API_KEY;

// Enhanced logging for better debugging
function logDebugInfo(message: string, data?: any) {
  console.log(`[Talent API Route] ${message}`);
  if (data) {
    try {
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Could not stringify data:', data);
    }
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint');

  logDebugInfo(`GET request for endpoint: ${endpoint}`);

  if (!endpoint) {
    logDebugInfo('Missing endpoint parameter');
    return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
  }

  try {
    const apiUrl = `${API_BASE_URL}/${endpoint}`;
    logDebugInfo(`Forwarding GET request to: ${apiUrl}`);
    
    const hasApiKey = Boolean(API_KEY);
    logDebugInfo(`API Key present: ${hasApiKey ? 'Yes' : 'No'}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'X-API-KEY': API_KEY || '',
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
        data.user_credentials.forEach((cred: any, index: number) => {
          const credName = cred.credential?.name || 'Unknown';
          const credIssuer = cred.credential?.data_issuer || 'Unknown';
          const credValue = cred.value !== undefined ? cred.value : 'N/A';
          
          logDebugInfo(`Credential #${index + 1}: ${credIssuer} - ${credName} = ${credValue}`);
        });
        
        // Create a simplified map for easier debugging
        const credentialMap: Record<string, any> = {};
        data.user_credentials.forEach((cred: any) => {
          if (cred.credential?.slug) {
            credentialMap[cred.credential.slug] = {
              name: cred.credential.name,
              issuer: cred.credential.data_issuer,
              value: cred.value
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
      const apiKey = API_KEY || '';
      logDebugInfo(`API Key present: ${apiKey ? 'Yes' : 'No'}`);
      if (apiKey) {
        const maskedKey = apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
        logDebugInfo(`API Key (masked): ${maskedKey}`);
      } else {
        logDebugInfo('API Key is missing! Check your environment variables.');
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-KEY': apiKey,
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
          'X-API-KEY': API_KEY || '',
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