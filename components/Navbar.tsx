"use client";

import { Search, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center flex-wrap justify-between px-4">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-primary/20 p-2 rounded-xl group-hover:bg-primary/40 transition-colors">
                        <Search className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        Cheater Detector
                    </span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link href="/profile">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <UserIcon className="h-4 w-4" />
                            <span className="hidden sm:inline">My Profile</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
