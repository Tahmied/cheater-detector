import { ShieldAlert } from "lucide-react";

export function Footer() {
    return (
        <footer className=" w-full border-t border-white/10 bg-slate-900/50 py-8 backdrop-blur-xl mt-auto">
            <div className="container mx-auto px-4 flex flex-col items-center gap-4 text-center">
                <div className="flex items-center justify-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-full ring-1 ring-primary/20">
                    <ShieldAlert className="h-4 w-4" />
                    <span className="text-sm font-medium">100% Private & Secure</span>
                </div>
                <p className="text-sm text-slate-400 max-w-xl">
                    Disclaimer: This is a <strong>purely for fun</strong> project!
                    Keep it light, keep it fun!
                </p>
                <p className="text-xs text-slate-500 mt-4">
                    © {new Date().getFullYear()} Cheater Detector. Built for fun by Tahmied.
                </p>
            </div>
        </footer>
    );
}
