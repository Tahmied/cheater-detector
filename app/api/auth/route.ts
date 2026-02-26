import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";

// Parse MongoDB duplicate key errors into friendly messages
function parseDuplicateKeyError(message: string): string {
    if (message.includes("phone")) return "This phone number is already registered.";
    if (message.includes("email")) return "This email address is already registered.";
    return "An account with these details already exists.";
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { action } = body;

        // Trim all inputs
        const phone = body.phone?.trim();
        const password = body.password?.trim();
        const name = body.name?.trim();
        const email = body.email?.trim();

        if (action === "login") {
            if (!phone || !password) {
                return NextResponse.json({ error: "Phone/email and password are required." }, { status: 400 });
            }

            // Support login by either phone or email
            const isEmail = phone.includes("@");
            const user = await User.findOne(isEmail ? { email: phone } : { phone });
            if (!user) {
                return NextResponse.json(
                    { error: isEmail ? "No account found with this email." : "No account found with this phone number." },
                    { status: 401 }
                );
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return NextResponse.json({ error: "Incorrect password. Please try again." }, { status: 401 });
            }

            const sessionToken = crypto.randomBytes(32).toString("hex");
            user.sessionToken = sessionToken;
            await user.save();

            const safeUser = user.toObject();
            delete safeUser.password;
            // Bug fix #2: strip sessionToken from the user object — it's returned separately
            delete safeUser.sessionToken;

            return NextResponse.json({ success: true, user: safeUser, sessionToken });
        }

        if (action === "register") {
            if (!name || !phone || !email || !password) {
                return NextResponse.json({ error: "All fields are required." }, { status: 400 });
            }

            // Bug fix #1: explicitly check BOTH phone AND email for duplicates
            // so we can return a friendly, specific message instead of a raw MongoDB error
            const phoneExists = await User.findOne({ phone });
            if (phoneExists) {
                return NextResponse.json({ error: "This phone number is already registered." }, { status: 400 });
            }

            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return NextResponse.json({ error: "This email address is already registered." }, { status: 400 });
            }

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
            // Bug fix #2: strip sessionToken from user object — returned separately
            delete safeUser.sessionToken;

            return NextResponse.json({ success: true, user: safeUser, sessionToken });
        }

        return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    } catch (error: any) {
        // Bug fix #1 fallback: if the explicit checks above somehow race and MongoDB
        // still throws a duplicate key error (E11000), parse it into a friendly message
        if (error.code === 11000) {
            return NextResponse.json(
                { error: parseDuplicateKeyError(error.message) },
                { status: 400 }
            );
        }
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}
