import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query || query.trim() === "") {
            return NextResponse.json({ error: "Missing search query" }, { status: 400 });
        }

        const searchRegex = new RegExp(query.trim(), "i");

        // We are looking for Users whose *partner* matches the search query.
        // The query could be matching partner's phone, email, or name.
        const matches = await User.find({
            $or: [
                { "partner.name": searchRegex },
                { "partner.phone": searchRegex },
                { "partner.email": searchRegex },
            ],
        }).select("partner createdAt name -_id"); // We return the submitter's name as requested.

        // If matches are found, we return the disguised count and the partner objects + submitter name.
        return NextResponse.json({
            success: true,
            count: matches.length,
            matches: matches, // These only contain the partner subdocument
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}
