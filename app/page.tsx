"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Heart, Lock, Search, ShieldAlert } from "lucide-react";
import { useState } from "react";

// Returns true if query looks like a plain name (not an email or phone number)
function looksLikeName(q: string): boolean {
  if (!q || q.trim().length === 0) return false;
  const isEmail = q.includes("@");
  const isPhone = /^[\d\s()\-+]{6,}$/.test(q.trim());
  return !isEmail && !isPhone;
}

// Animated spinner component
function Spinner() {
  return (
    <svg
      className="animate-spin w-4 h-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// Skeleton pulse for loading state
function SearchingSkeleton({ query }: { query: string }) {
  return (
    <motion.div
      key="skeleton"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mt-16 w-full max-w-xl"
    >
      <Card className="glass-card border-t border-t-white/20">
        <CardContent className="pt-6 pb-8">
          <div className="flex flex-col items-center gap-5 text-center">
            {/* Pulsing icon placeholder */}
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 animate-pulse" />
              <div className="absolute w-8 h-8 rounded-full bg-primary/40 animate-ping" />
            </div>

            {/* Scanning label */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-white font-semibold text-lg tracking-wide">
                Scanning the database
                <span className="inline-flex gap-0.5 ml-1">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <motion.span
                      key={i}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay }}
                      className="text-primary"
                    >
                      .
                    </motion.span>
                  ))}
                </span>
              </p>
              <p className="text-slate-400 text-sm">Looking for overlapping claims on <span className="text-primary font-medium">&quot;{query}&quot;</span></p>
            </div>

            {/* Skeleton lines */}
            <div className="w-full space-y-3 mt-2">
              {[1, 0.7, 0.5].map((w, i) => (
                <div
                  key={i}
                  className="h-3 rounded-full bg-white/10 animate-pulse"
                  style={{ width: `${w * 100}%`, margin: "0 auto" }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  const isNameSearch = looksLikeName(query);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setIsSearching(true);
    setResults(null); // Clear previous results while searching
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.matches);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error(error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] w-full px-4 text-center mt-10">

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl flex flex-col items-center gap-6"
      >
        <div className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-full inline-flex items-center gap-2 mb-4">
          <Heart className="w-4 h-4" />
          <span className="text-sm font-semibold tracking-wide">The Ultimate Relationship Fun Test</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Is Your Partner{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent animate-pulse-slow block sm:inline mt-2 sm:mt-0">
            Truly Yours?
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mt-4">
          A purely fun, entertaining way to see if there are overlapping claims on your boyfriend or girlfriend.
          Enter a phone number, email, or name below.
        </p>

        {/* Search Form */}
        <div className="w-full max-w-xl mt-8 relative">
          <form onSubmit={handleSearch} className="relative flex items-center w-full">
            {/* Search icon — becomes a spinner when searching */}
            <AnimatePresence mode="wait">
              {isSearching ? (
                <motion.span
                  key="spinner"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none"
                >
                  <Spinner />
                </motion.span>
              ) : (
                <motion.span
                  key="icon"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                >
                  <Search className="w-5 h-5" />
                </motion.span>
              )}
            </AnimatePresence>

            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by phone number, email..."
              disabled={isSearching}
              className={`pl-12 pr-32 h-14 text-lg rounded-2xl bg-white/5 border-white/20 hover:border-white/40 focus:border-primary focus:bg-white/10 transition-all duration-300 ${isSearching ? "opacity-70 border-primary/50 bg-primary/5" : ""
                }`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Button
                type="submit"
                disabled={isSearching || !query}
                className="rounded-xl px-6 h-10 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-accent border-0 min-w-[100px] transition-all duration-200"
              >
                <AnimatePresence mode="wait">
                  {isSearching ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Spinner />
                      Searching
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Search
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </form>

          {/* Name-only search warning */}
          <AnimatePresence>
            {isNameSearch && !isSearching && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-3 mx-1 rounded-xl bg-amber-500/10 border border-amber-500/25 px-4 py-3 flex items-start gap-3 text-left">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-amber-300 text-xs leading-relaxed">
                    <span className="font-semibold">Name-only searches may not be accurate</span> — multiple people can share the same name. For{" "}
                    <span className="font-semibold text-amber-200">100% accurate results</span>, try searching by{" "}
                    <span className="font-semibold text-amber-200">phone number</span> or{" "}
                    <span className="font-semibold text-amber-200">email</span> instead.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Searching status bar */}
          <AnimatePresence>
            {isSearching && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 mx-1 rounded-xl bg-primary/10 border border-primary/25 px-4 py-2.5 flex items-center gap-3">
                  {/* Animated scan bar */}
                  <div className="relative flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                      style={{ width: "50%" }}
                    />
                  </div>
                  <span className="text-primary text-xs font-semibold whitespace-nowrap tracking-wide">
                    Scanning database…
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5 mt-4">
            <Lock className="w-3.5 h-3.5" />
            Nobody will know who searched for this data. 100% anonymous.
          </div>
        </div>
      </motion.div>

      {/* Results / Skeleton Section */}
      <AnimatePresence mode="wait">
        {isSearching ? (
          <SearchingSkeleton key="skeleton" query={query} />
        ) : results !== null ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-16 w-full max-w-xl"
          >
            <Card className="glass-card border-t border-t-white/20">
              <CardContent className="pt-6">
                {results.length > 0 ? (
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-16 h-16 bg-destructive/20 text-destructive rounded-full flex items-center justify-center animate-pulse">
                      <ShieldAlert className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Yikes! Match Found</h2>
                    <p className="text-slate-300">
                      We found <strong className="text-destructive font-bold text-xl">{results.length}</strong> record(s) matching this data.
                    </p>
                    <div className="mt-4 w-full bg-slate-900/50 rounded-xl p-4 border border-white/5 text-left text-sm text-slate-400">
                      <p className="mb-2 text-white"><strong>Claimed by:</strong></p>
                      <ul className="list-disc pl-5 space-y-1">
                        {results.map((match, i) => (
                          <li key={i} className="text-primary font-medium">{match.name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 text-center py-6">
                    <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
                      <Heart className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">All Clear!</h2>
                    <p className="text-slate-300">
                      We didn't find anyone else claiming this person in our system. You are safe (for now).
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>

    </div>
  );
}
