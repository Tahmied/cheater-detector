import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { userId, sessionToken, partnerName, partnerPhone, partnerEmail } = body;

        // Bug fix #2: require both userId AND sessionToken
        if (!userId || !sessionToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Bug fix #3: validate ObjectId format before hitting the DB
        // (invalid format causes a Mongoose CastError → 500 without this check)
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Bug fix #7: validate partner fields before touching the DB
        const trimmedName = partnerName?.trim();
        const trimmedPhone = partnerPhone?.trim();
        const trimmedEmail = partnerEmail?.trim();

        if (!trimmedName || !trimmedPhone || !trimmedEmail) {
            return NextResponse.json({ error: "All partner fields are required" }, { status: 400 });
        }

        // Bug fix #2: verify sessionToken matches what we have in DB
        const user = await User.findById(userId).select("sessionToken");
        if (!user || user.sessionToken !== sessionToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                partner: {
                    name: trimmedName,
                    phone: trimmedPhone,
                    email: trimmedEmail,
                },
            },
            { new: true }
        ).select("-password -__v -sessionToken");

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}
