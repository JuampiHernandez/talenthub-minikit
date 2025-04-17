"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
  useClose,
  useNotification,
} from "@coinbase/onchainkit/minikit";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "./components/DemoComponents";
import { Icon } from "./components/DemoComponents";
import { 
  GithubDeveloperSearch, 
  ProfileDetail 
} from "./components/RecruitmentComponents";
import { 
  fetchProfilesByCredential,
  type TalentProfile,
  type CredentialOption,
  CREDENTIAL_OPTIONS
} from "../lib/talentProtocolService";

// Error message component
function ErrorMessage({ 
  message,
  onRetry
}: { 
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mt-4 p-4 bg-red-50 border border-red-300 text-red-800 rounded-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">API Error</h3>
          <div className="mt-1 text-sm">
            <p>{message}</p>
          </div>
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="text-red-600 hover:text-red-800"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Debug panel component to display API data
function DebugPanel({ 
  apiData, 
  isVisible 
}: { 
  apiData: Record<string, unknown> | null; 
  isVisible: boolean 
}) {
  if (!isVisible) return null;

  return (
    <div className="mt-4 p-4 bg-gray-800 text-white rounded-lg overflow-auto max-h-96">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">API Debug Data</h2>
      </div>
      <pre className="text-xs whitespace-pre-wrap overflow-auto">
        {JSON.stringify(apiData, null, 2)}
      </pre>
    </div>
  );
}

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState<TalentProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<TalentProfile | null>(null);
  const [selectedCredential, setSelectedCredential] = useState<CredentialOption>(CREDENTIAL_OPTIONS[0]);
  
  // Add states for debugging and error handling
  const [debugMode, setDebugMode] = useState(false);
  const [apiResponseData, setApiResponseData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Add state for profile credential data
  const [profileCredentialData, setProfileCredentialData] = useState<Record<string, unknown> | null>(null);

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();
  const closeApp = useClose();
  const sendNotification = useNotification();

  // Initialize the app
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Handle adding the frame to user's collection
  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));

    // Send a welcome notification if the frame was added
    if (frameAdded) {
      try {
        await sendNotification({
          title: 'Welcome to TalentHub!',
          body: 'Thanks for adding our mini app. Find top developers with GitHub accounts!'
        });
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    }
  }, [addFrame, sendNotification]);

  // Extract a user-friendly error message
  const extractErrorMessage = useCallback((apiError: Record<string, unknown>): string => {
    try {
      // Check if it's a structured error from our API
      if (typeof apiError.details === 'string') {
        // Try to parse JSON error messages
        if (apiError.details.includes('{')) {
          const match = apiError.details.match(/\{.*\}/);
          if (match) {
            const errorObj = JSON.parse(match[0]);
            if (errorObj.error) {
              return errorObj.error;
            }
          }
        }
        return apiError.details;
      }
      // If it's a simple error message
      else if (typeof apiError.error === 'string') {
        return apiError.error;
      }
      // If error is a string
      else if (typeof apiError === 'string') {
        return apiError;
      }
      // Fallback
      return 'An error occurred while fetching data. Please try again.';
    } catch (e) {
      return 'An unexpected error occurred. Please try again.';
    }
  }, []);

  // Handle credential change
  const handleCredentialChange = useCallback((credential: CredentialOption) => {
    setSelectedCredential(credential);
    // Reset profiles when changing credential
    setProfiles([]);
  }, []);

  // Handle fetching profiles by credential
  const handleFetchProfiles = useCallback(async () => {
    setIsLoading(true);
    setApiResponseData(null);
    setError(null);
    
    try {
      console.log(`Fetching profiles with ${selectedCredential.dataIssuer} ${selectedCredential.name} credential`);
      
      // Fetch raw API data first to display in debug panel
      const response = await fetch('/api/talent?endpoint=search/advanced/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: {
            credentials: [{
              name: selectedCredential.name,
              dataIssuer: selectedCredential.dataIssuer
            }]
          },
          sort: {
            score: { 
              order: "desc"
            }
          },
          page: 1,
          per_page: 25
        })
      });
      
      const rawData = await response.json();
      setApiResponseData(rawData);
      
      // Check if the response contains an error
      if (rawData.error) {
        const errorMessage = extractErrorMessage(rawData);
        setError(errorMessage);
        setProfiles([]);
        setIsLoading(false);
        return;
      }
      
      // Use the service function to get the formatted profiles
      const fetchedProfiles = await fetchProfilesByCredential(selectedCredential);
      console.log('Fetched profiles:', fetchedProfiles);
      setProfiles(fetchedProfiles);
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
      setApiResponseData({ error: error instanceof Error ? error.message : 'Unknown error' });
      setError('Failed to connect to the API. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCredential, extractErrorMessage]);

  // Fetch credential data for a specific profile
  const fetchProfileCredentialData = useCallback(async (profileId: string) => {
    setProfileCredentialData(null);
    
    try {
      console.log(`Fetching credential data for profile ${profileId}`);
      const response = await fetch(`/api/talent?endpoint=profiles/${profileId}/credentials`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch credential data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Credential data received:', data);
      setProfileCredentialData(data);
      
      return data;
    } catch (error) {
      console.error('Error fetching credential data:', error);
      setProfileCredentialData({ error: error instanceof Error ? error.message : 'Error fetching credential data' });
      return null;
    }
  }, []);

  // Handle profile selection
  const handleProfileClick = useCallback((profile: TalentProfile) => {
    setSelectedProfile(profile);
    
    // Fetch credential data for the selected profile
    fetchProfileCredentialData(profile.id);
  }, [fetchProfileCredentialData]);

  // Handle going back to profile list
  const handleBackToList = useCallback(() => {
    setSelectedProfile(null);
    setProfileCredentialData(null);
  }, []);

  // Toggle debug mode
  const toggleDebugMode = useCallback(() => {
    setDebugMode(prev => !prev);
  }, []);

  // Create the save frame button
  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="text-[var(--app-accent)] p-4"
          icon={<Icon name="plus" size="sm" />}
        >
          Save App
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
          <Icon name="check" size="sm" className="text-[#0052FF]" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto px-4 py-3">
        <header className="flex justify-between items-center mb-3 h-11">
          <div className="flex items-center">
            <h1 className="text-lg font-bold text-[var(--app-foreground)]">Talent Protocol Hub</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDebugMode}
              className="text-[var(--app-foreground-muted)]"
            >
              {debugMode ? "Hide Debug" : "Debug"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeApp}
              className="text-[var(--app-foreground-muted)]"
            >
              Close
            </Button>
            {saveFrameButton}
          </div>
        </header>

        <div className="mb-4">
          <p className="text-[var(--app-foreground-muted)] text-sm">
            Find developers with verified credentials on Talent Protocol.
          </p>
        </div>

        <main className="flex-1">
          {selectedProfile ? (
            <ProfileDetail
              profile={selectedProfile}
              onBack={handleBackToList}
              selectedCredential={selectedCredential}
              debugMode={debugMode}
              credentialData={profileCredentialData}
            />
          ) : (
            <>
              <GithubDeveloperSearch
                profiles={profiles}
                selectedCredential={selectedCredential}
                onCredentialChange={handleCredentialChange}
                onProfileClick={handleProfileClick}
                onFetchGithubProfiles={handleFetchProfiles}
                isLoading={isLoading}
              />
              
              {error && (
                <ErrorMessage 
                  message={error}
                  onRetry={handleFetchProfiles}
                />
              )}
            </>
          )}
          
          <DebugPanel 
            apiData={apiResponseData}
            isVisible={debugMode}
          />
        </main>

        <footer className="mt-4 pt-4 flex justify-center border-t border-[var(--app-card-border)]">
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--app-foreground-muted)] text-xs"
            onClick={() => openUrl("https://talentprotocol.com")}
          >
            Powered by Talent Protocol
          </Button>
        </footer>
      </div>
    </div>
  );
}
