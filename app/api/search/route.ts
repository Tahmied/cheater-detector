import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

// Bug fix #4: escape special regex characters so user input can't break the regex or leak all records
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query || query.trim() === "") {
            return NextResponse.json({ error: "Missing search query" }, { status: 400 });
        }

        // Bug fix #4: use the escaped version
        const searchRegex = new RegExp(escapeRegex(query.trim()), "i");

        // Bug fix #5: only search users who actually have partner data set
        const matches = await User.find({
            "partner": { $exists: true, $ne: null },
            $or: [
                { "partner.name": searchRegex },
                { "partner.phone": searchRegex },
                { "partner.email": searchRegex },
            ],
        }).select("createdAt name -_id"); // ONLY return submitter name + date. Partner data is strictly excluded.

        return NextResponse.json({
            success: true,
            count: matches.length,
            matches: matches,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}
