// ✅ PaymentController.js
import Order from "../Models/OrderModel.js";
import Payment from "../Models/PaymentModel.js";

export const confirmRazorpayPayment = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = "Processing";
    await order.save();

    const payment = await Payment.create({
      orderId, razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "Completed", amount: order.total, currency: "INR"
    });

    res.status(200).json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Payments (Admin)
export const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find().populate("orderId", "user cartItems total");

        res.status(200).json({
            success: true,
            payments,
        });
    } catch (error) {
        console.error("Error fetching payments:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
