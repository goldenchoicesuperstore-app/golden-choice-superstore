"use client";

import { useState } from "react";

export default function PexelsSearch({ onSelect }: { onSelect: (url: string) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: number; src: { original: string; small: string; medium: string } }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=6`, {
        headers: {
          Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY || ""
        }
      });
      const data = await res.json();
      setResults(data.photos || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 bg-white p-5 border border-amber-100 rounded-2xl shadow-sm">
      <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">Search Stock Photos</label>
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
          placeholder="e.g. hair oil, insecticide spray"
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none font-bold text-gray-900 transition-all"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="bg-gradient-to-r from-[#F5C200] to-[#C9980A] text-gray-900 font-extrabold px-8 rounded-xl hover:shadow-[0_0_15px_rgba(245,194,0,0.4)] transition-all disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {results.map((photo) => (
            <img
              key={photo.id}
              src={photo.src.medium}
              alt="Stock photo"
              onClick={() => onSelect(photo.src.original)}
              className="w-full h-28 object-cover rounded-xl cursor-pointer hover:ring-4 hover:ring-amber-400 hover:scale-105 transition-all shadow-sm"
            />
          ))}
        </div>
      )}
    </div>
  );
}
