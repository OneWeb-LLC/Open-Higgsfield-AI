'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ImageStudio, VideoStudio, LipSyncStudio, CinemaStudio } from 'studio';
import ApiKeyModal from './ApiKeyModal';
import { createClient } from '@/lib/supabase/client';
import { muapiStorageKey } from '@/lib/ohf/constants';

const TABS = [
  { id: 'image', label: 'Image Studio' },
  { id: 'video', label: 'Video Studio' },
  { id: 'lipsync', label: 'Lip Sync' },
  { id: 'cinema', label: 'Cinema Studio' },
];

export default function StandaloneShell({
  userId = null,
  userEmail = null,
  oneId = null,
  workspaceId = null,
}) {
  const router = useRouter();
  const storageKey = userId ? muapiStorageKey(userId) : 'muapi_key';

  const [apiKey, setApiKey] = useState(null);
  const [activeTab, setActiveTab] = useState('image');
  const [showSettings, setShowSettings] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const stored = localStorage.getItem(storageKey);
    if (stored) setApiKey(stored);
  }, [storageKey]);

  const handleKeySave = useCallback(
    (key) => {
      localStorage.setItem(storageKey, key);
      setApiKey(key);
    },
    [storageKey],
  );

  const handleKeyChange = useCallback(() => {
    localStorage.removeItem(storageKey);
    setApiKey(null);
  }, [storageKey]);

  const handleSignOut = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      /* ignore */
    }
    router.push('/login');
    router.refresh();
  }, [router]);

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-spin text-[#d9ff00] text-3xl">◌</div>
      </div>
    );
  }

  if (!apiKey) {
    return <ApiKeyModal onSave={handleKeySave} />;
  }

  return (
    <div className="h-screen bg-[#050505] flex flex-col overflow-hidden">
      <header className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-0 border-b border-white/5">
        <div className="flex flex-col gap-0.5">
          <span className="text-white font-black text-lg tracking-wider uppercase">
            Open Higgsfield AI
          </span>
          {(oneId || userEmail) && (
            <span className="text-[10px] text-white/40 font-mono truncate max-w-[220px]">
              {oneId ? `${oneId}` : userEmail}
              {workspaceId ? ` · ws ${workspaceId.slice(0, 8)}…` : null}
            </span>
          )}
        </div>

        <nav className="flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#d9ff00] text-black'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {userId && (
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="text-white/40 hover:text-white text-xs transition-colors"
            >
              Sign out
            </button>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="text-white/40 hover:text-white text-sm transition-colors"
          >
            ⚙ Settings
          </button>
        </div>
      </header>

      <div className="flex-1">
        {activeTab === 'image' && <ImageStudio apiKey={apiKey} />}
        {activeTab === 'video' && <VideoStudio apiKey={apiKey} />}
        {activeTab === 'lipsync' && <LipSyncStudio apiKey={apiKey} />}
        {activeTab === 'cinema' && <CinemaStudio apiKey={apiKey} />}
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-white font-bold text-xl mb-6">Settings</h2>
            <p className="text-white/50 text-sm mb-2">
              MuAPI key (BYOK, stored in this browser only for your OneID):
            </p>
            <p className="text-white/80 font-mono text-sm mb-4">
              {apiKey.slice(0, 8)}••••••••
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleKeyChange}
                className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm transition-colors"
              >
                Change API Key
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
