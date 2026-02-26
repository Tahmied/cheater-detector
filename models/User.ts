import mongoose from "mongoose";

const PartnerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
});

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Simple mock auth password
    partner: { type: PartnerSchema, required: false }, // Optional partner details
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
