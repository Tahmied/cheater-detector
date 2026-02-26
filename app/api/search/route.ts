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
        }).select("createdAt name -_id"); // We ONLY return the submitter's name and createdAt. We STRICTLY exclude the partner data!

        // If matches are found, we return the disguised count and the safe submitter names.
        return NextResponse.json({
            success: true,
            count: matches.length,
            matches: matches, // These now ONLY contain the submitter name and createdAt, no partner details!
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}
