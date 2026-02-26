"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Lock, Search, ShieldAlert } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setIsSearching(true);
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by phone number, email..."
              className="pl-12 pr-32 h-14 text-lg rounded-2xl bg-white/5 border-white/20 hover:border-white/40 focus:border-primary focus:bg-white/10"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Button
                type="submit"
                disabled={isSearching || !query}
                className="rounded-xl px-6 h-10 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-accent border-0"
              >
                {isSearching ? "..." : "Search"}
              </Button>
            </div>
          </form>

          <div className="text-xs text-slate-400 flex items-center justify-center gap-1.5 mt-4">
            <Lock className="w-3.5 h-3.5" />
            Nobody will know who searched for this data. 100% anonymous.
          </div>
        </div>
      </motion.div>

      {/* Results Section */}
      <AnimatePresence>
        {results !== null && (
          <motion.div
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
        )}
      </AnimatePresence>

    </div>
  );
}
