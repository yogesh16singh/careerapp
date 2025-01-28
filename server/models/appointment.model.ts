import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAppointment extends Document {
    studentId: mongoose.Schema.Types.ObjectId;
    counselorId: mongoose.Schema.Types.ObjectId;
    appointmentDate: Date;
    appointmentTime: string;
    status: "pending" | "confirmed" | "canceled";
    createdAt: Date;
    updatedAt: Date;
}

const appointmentSchema: Schema<IAppointment> = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        counselorId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        appointmentDate: {
            type: Date,
            required: true,
        },
        appointmentTime: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "canceled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

const appointmentModel: Model<IAppointment> = mongoose.model<IAppointment>("Appointment", appointmentSchema);
export default appointmentModel;
