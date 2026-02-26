import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { action } = body;

        // Bug fix #10: trim all inputs before using them
        const phone = body.phone?.trim();
        const password = body.password?.trim();
        const name = body.name?.trim();
        const email = body.email?.trim();

        if (action === "login") {
            if (!phone || !password) {
                return NextResponse.json({ error: "Phone and password are required" }, { status: 400 });
            }

            const user = await User.findOne({ phone });
            if (!user) {
                return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
            }

            // Bug fix #1: compare against the bcrypt hash
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
            }

            // Bug fix #2 & #3: generate a session token and persist it
            const sessionToken = crypto.randomBytes(32).toString("hex");
            user.sessionToken = sessionToken;
            await user.save();

            const safeUser = user.toObject();
            delete safeUser.password;
            // Return sessionToken separately — client stores it alongside userId
            return NextResponse.json({ success: true, user: safeUser, sessionToken });
        }

        if (action === "register") {
            if (!name || !phone || !email || !password) {
                return NextResponse.json({ error: "All fields are required" }, { status: 400 });
            }

            const exists = await User.findOne({ phone });
            if (exists) {
                return NextResponse.json({ error: "User with this phone already exists" }, { status: 400 });
            }

            // Bug fix #1: hash the password before storing
            const hashedPassword = await bcrypt.hash(password, 12);
            const sessionToken = crypto.randomBytes(32).toString("hex");

            const newUser = await User.create({
                name,
                phone,
                email,
                password: hashedPassword,
                sessionToken,
            });

            const safeUser = newUser.toObject();
            delete safeUser.password;
            return NextResponse.json({ success: true, user: safeUser, sessionToken });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}
