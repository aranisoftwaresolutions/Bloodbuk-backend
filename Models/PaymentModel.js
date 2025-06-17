import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        razorpayPaymentId: String,
        razorpayOrderId: String,
        razorpaySignature: String,
        status: {
            type: String,
            enum: ["Pending", "Completed", "Failed"],
            default: "Pending",
        },
        amount: Number,
        currency: {
            type: String,
            default: "INR",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
