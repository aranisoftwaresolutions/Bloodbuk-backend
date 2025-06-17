import express from "express";
import { confirmRazorpayPayment, getAllPayments } from "../Controllers/PaymentController.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// ✅ Create PayPal Payment


router.post("/razorpay-confirm", isAuthenticatedUser, confirmRazorpayPayment);
// ✅ Get All Payments (Admin)
router.get("/all-payments", isAuthenticatedUser, authorizeRoles("admin"), getAllPayments);

export default router;
