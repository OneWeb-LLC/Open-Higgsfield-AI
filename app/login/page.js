import { Suspense } from 'react';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#050505] text-white">
      <div className="hidden md:flex flex-col justify-between p-12 border-r border-white/5">
        <div>
          <p className="text-xs tracking-[0.2em] text-white/40 uppercase">OWeb Satellite</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">Open Higgsfield AI</h1>
          <p className="mt-4 max-w-md text-white/60">
            AI image, video, cinema, and lip sync — shared OneID with OWeb. Your MuAPI key stays
            yours (BYOK).
          </p>
        </div>
        <p className="text-xs text-white/30">One OS · auth.oweb.one</p>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <Suspense fallback={<p className="text-sm text-white/50">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
