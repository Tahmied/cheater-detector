import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { action, phone, password, name, email } = body;

        if (action === "login") {
            const user = await User.findOne({ phone, password });
            if (!user) {
                return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
            }
            return NextResponse.json({ success: true, user });
        }

        if (action === "register") {
            const exists = await User.findOne({ phone });
            if (exists) {
                return NextResponse.json({ error: "User with this phone already exists" }, { status: 400 });
            }
            const newUser = await User.create({ name, phone, email, password });
            return NextResponse.json({ success: true, user: newUser });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}
