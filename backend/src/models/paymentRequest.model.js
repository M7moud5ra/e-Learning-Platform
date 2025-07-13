import mongoose, { Schema } from "mongoose";

const paymentRequestSchema = new Schema(
  {
    studentID: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    courseID: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studentEmail: {
      type: String,
      required: true,
    },
    studentPhone: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    whatsappContactSent: {
      type: Boolean,
      default: false,
    },
    adminNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export const PaymentRequest = mongoose.model("PaymentRequest", paymentRequestSchema);