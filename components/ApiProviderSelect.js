'use client';

export default function ApiProviderSelect({ providers, value, onChange, className = '' }) {
  if (!providers?.length) return null;

  return (
    <div className={className}>
      <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">
        Generative API
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d9ff00]/40 transition-colors"
      >
        {providers.map((p) => (
          <option key={p.id} value={p.id} className="bg-[#111]">
            {p.label}
          </option>
        ))}
      </select>
      {providers.find((p) => p.id === value)?.description ? (
        <p className="mt-2 text-xs text-white/35 leading-relaxed">
          {providers.find((p) => p.id === value).description}
        </p>
      ) : null}
    </div>
  );
}
