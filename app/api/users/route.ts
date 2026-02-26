import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { userId, partnerName, partnerPhone, partnerEmail } = body;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                partner: {
                    name: partnerName,
                    phone: partnerPhone,
                    email: partnerEmail,
                },
            },
            { new: true }
        ).select("-password -__v");

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}
