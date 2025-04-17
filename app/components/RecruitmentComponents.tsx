"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useNotification } from "@coinbase/onchainkit/minikit";
import { TalentProfile, CredentialOption, CREDENTIAL_OPTIONS_GROUPED } from '../../lib/talentProtocolService';

// Profile list component to display GitHub accounts
export function ProfileList({
  profiles,
  onProfileClick,
  selectedCredential,
}: {
  profiles: TalentProfile[];
  onProfileClick: (profile: TalentProfile) => void;
  selectedCredential: CredentialOption;
}) {
  return (
    <div className="space-y-4">
      {profiles.length === 0 ? (
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-5 text-center">
          <p className="text-[var(--app-foreground-muted)]">
            No profiles found with {selectedCredential.displayName} credential.
          </p>
        </div>
      ) : (
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--app-card-border)]">
            <h3 className="text-lg font-medium text-[var(--app-foreground)]">
              Developers with {selectedCredential.displayName} ({profiles.length})
            </h3>
            <p className="text-xs text-[var(--app-foreground-muted)] mt-1">
              Sorted by credential value (highest first)
            </p>
          </div>
          <div className="divide-y divide-[var(--app-card-border)]">
            {profiles.map((profile) => (
              <div 
                key={profile.id}
                className="p-4 hover:bg-[var(--app-card-border-light)] cursor-pointer transition-colors"
                onClick={() => onProfileClick(profile)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden relative">
                      <Image 
                        src={profile.profilePicture || "https://via.placeholder.com/50"} 
                        alt={profile.fullName} 
                        className="object-cover"
                        fill
                        sizes="40px"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h4 className="text-[var(--app-foreground)] font-medium">
                        {profile.fullName}
                        {profile.humanVerified && (
                          <span className="ml-1 text-[var(--app-accent)]">✓</span>
                        )}
                      </h4>
                      {profile.username && (
                        <span className="text-xs text-[var(--app-foreground-muted)] ml-2">
                          {profile.username}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-[var(--app-foreground-muted)]">
                      {selectedCredential.displayName}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Profile detail component for viewing full profile
export function ProfileDetail({
  profile,
  onBack,
  selectedCredential,
  debugMode = false,
  credentialData = null,
}: {
  profile: TalentProfile;
  onBack: () => void;
  selectedCredential: CredentialOption;
  debugMode?: boolean;
  credentialData?: Record<string, any> | null;
}) {
  // Format credential value for display
  const formatCredentialValue = (value: string | number | boolean | undefined): string => {
    if (value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return value.toString();
  };

  return (
    <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] overflow-hidden">
      <div className="p-4">
        <button 
          onClick={onBack}
          className="mb-4 text-[var(--app-foreground-muted)] hover:text-[var(--app-foreground)] flex items-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to profiles
        </button>
        
        <div className="flex items-start mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden mr-4 flex-shrink-0 relative">
            <Image 
              src={profile.profilePicture || "https://via.placeholder.com/150"} 
              alt={profile.fullName} 
              className="object-cover"
              fill
              sizes="80px"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--app-foreground)]">
              {profile.fullName}
              {profile.humanVerified && (
                <span className="ml-1 text-[var(--app-accent)]">✓</span>
              )}
            </h2>
            {profile.username && (
              <div className="text-[var(--app-foreground-muted)]">
                @{profile.username}
              </div>
            )}
          </div>
        </div>
        
        {/* Credential Value Section */}
        {profile.credentialValue !== undefined && (
          <div className="bg-[var(--app-accent-light)] p-4 rounded-lg mb-4">
            <h3 className="text-[var(--app-accent)] font-bold text-sm mb-1">
              {selectedCredential.displayName}
            </h3>
            <div className="text-2xl font-bold text-[var(--app-accent)]">
              {formatCredentialValue(profile.credentialValue)}
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mb-4">
          {profile.score !== undefined && (
            <span className="px-2 py-1 bg-[var(--app-card-border)] text-[var(--app-foreground)] text-xs font-bold rounded-full">
              Builder Score: {profile.score}
            </span>
          )}
        </div>
        
        {profile.bio && (
          <div className="mb-4">
            <h3 className="text-md font-medium text-[var(--app-foreground)] mb-1">Bio</h3>
            <p className="text-[var(--app-foreground-muted)]">{profile.bio}</p>
          </div>
        )}
        
        {profile.tags && profile.tags.length > 0 && (
          <div className="mb-4">
            <h3 className="text-md font-medium text-[var(--app-foreground)] mb-1">Skills</h3>
            <div className="flex flex-wrap gap-1">
              {profile.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="px-2 py-1 bg-[var(--app-card-border)] text-[var(--app-foreground-muted)] text-sm rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Debug Credential Data Section */}
        {debugMode && credentialData && (
          <div className="mt-6 p-4 bg-gray-800 text-white rounded-lg overflow-auto max-h-96">
            <h3 className="text-md font-medium text-white mb-2">Profile Credential Data</h3>
            <pre className="text-xs whitespace-pre-wrap overflow-auto">
              {JSON.stringify(credentialData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// Credential selector dropdown component
export function CredentialSelector({
  selectedCredential,
  onCredentialChange,
}: {
  selectedCredential: CredentialOption;
  onCredentialChange: (credential: CredentialOption) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-2 px-4 bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg flex justify-between items-center text-[var(--app-foreground)]"
      >
        <span>
          <span className="font-medium">{selectedCredential.dataIssuer}</span>: {selectedCredential.displayName}
        </span>
        <svg
          className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-[var(--app-card-bg)] border border-[var(--app-card-border)] rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {Object.entries(CREDENTIAL_OPTIONS_GROUPED).map(([issuer, credentials]) => (
            <div key={issuer}>
              <div className="px-3 py-2 bg-[var(--app-card-border-light)] text-[var(--app-foreground-muted)] text-sm font-medium">
                {issuer}
              </div>
              <div className="divide-y divide-[var(--app-card-border)]">
                {credentials.map((credential) => (
                  <button
                    key={`${credential.dataIssuer}-${credential.name}`}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--app-card-border-light)] transition-colors ${
                      selectedCredential.name === credential.name && 
                      selectedCredential.dataIssuer === credential.dataIssuer
                        ? 'bg-[var(--app-accent-light)] text-[var(--app-accent)]'
                        : 'text-[var(--app-foreground)]'
                    }`}
                    onClick={() => {
                      onCredentialChange(credential);
                      setIsOpen(false);
                    }}
                  >
                    {credential.displayName}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// GitHub fetch button component
export function GitHubFilterButton({
  selectedCredential,
  onCredentialChange,
  onClick,
  isLoading,
}: {
  selectedCredential: CredentialOption;
  onCredentialChange: (credential: CredentialOption) => void;
  onClick: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-5 mb-4">
      <h3 className="text-lg font-medium text-[var(--app-foreground)] mb-2">
        Developer Credential Filter
      </h3>
      <p className="text-[var(--app-foreground-muted)] mb-4">
        Select a credential type and find developers with verified credentials:
      </p>
      
      <CredentialSelector 
        selectedCredential={selectedCredential}
        onCredentialChange={onCredentialChange}
      />
      
      <button
        onClick={onClick}
        disabled={isLoading}
        className="w-full py-2 px-4 bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex justify-center items-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading profiles...
          </>
        ) : (
          `Find Developers with ${selectedCredential.displayName}`
        )}
      </button>
    </div>
  );
}

// Main component that combines the filter button and profile list
export function GithubDeveloperSearch({
  profiles,
  selectedCredential,
  onCredentialChange,
  onProfileClick,
  onFetchGithubProfiles,
  isLoading,
}: {
  profiles: TalentProfile[];
  selectedCredential: CredentialOption;
  onCredentialChange: (credential: CredentialOption) => void;
  onProfileClick: (profile: TalentProfile) => void;
  onFetchGithubProfiles: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-4">
      <GitHubFilterButton 
        selectedCredential={selectedCredential}
        onCredentialChange={onCredentialChange}
        onClick={onFetchGithubProfiles}
        isLoading={isLoading}
      />
      
      {profiles.length > 0 && !isLoading && (
        <ProfileList 
          profiles={profiles}
          onProfileClick={onProfileClick}
          selectedCredential={selectedCredential}
        />
      )}
      
      {isLoading && profiles.length === 0 && (
        <div className="bg-[var(--app-card-bg)] backdrop-blur-md rounded-xl shadow-lg border border-[var(--app-card-border)] p-5 text-center">
          <p className="text-[var(--app-foreground-muted)]">Loading profiles...</p>
        </div>
      )}
    </div>
  );
} 