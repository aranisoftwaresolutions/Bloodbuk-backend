import ErrorHandler from "../middlewares/errorHandling.js";
import Order from "../Models/OrderModel.js";
import Product from "../Models/ProductModel.js";
import { reducerStock } from "../utils/features.js";
import Razorpay from "razorpay";


// RAZORPAY INIT
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const newOrder = async (req, res, next) => {
  try {
    const {
      user, cartItems, shippingDetails, subtotal, tax, total,
      discount, discountAmount, paymentMethod
    } = req.body;

    if (!cartItems || cartItems.length === 0) return res.status(400).json({ message: "Cart is empty!" });

    const { fullName, address, city, state, zipCode, phoneNumber, email } = shippingDetails;
    if (!fullName || !address || !city || !state || !zipCode || !phoneNumber || !email)
      return res.status(400).json({ message: "Incomplete shipping details." });

    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) return next(new ErrorHandler(`Product not found: ${item.productId}`, 404));
      if (product.stock < item.quantity)
        return next(new ErrorHandler(`Not enough stock for ${product.name}`, 400));
    }

    const order = await Order.create({
      user, cartItems, shippingDetails, subtotal, tax,
      total, discount, discountAmount, paymentMethod,
      status: paymentMethod === "CashOnDelivery" ? "Processing" : "Pending"
    });

    await reducerStock(cartItems);

    if (paymentMethod === "Razorpay") {
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(total * 100),
        currency: "INR",
        receipt: order._id.toString(),
      });
      return res.status(201).json({ success: true, order, razorpayOrder });
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const myOrder = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.query.id });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const allOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email phone").sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSingleOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email phone");
    if (!order) return next(new ErrorHandler("Order Not Found", 404));
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const processOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new ErrorHandler("Order Not Found", 404));
    const statusMap = { Pending: "Processing", Processing: "Shipped", Shipped: "Delivered" };
    order.status = statusMap[order.status] || "Delivered";
    await order.save();
    res.status(200).json({ success: true, message: `Order marked as ${order.status}`, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(new ErrorHandler("Order Not Found", 404));
    for (const item of order.cartItems) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }
    await order.deleteOne();
    res.status(200).json({ success: true, message: "Order Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





// ✅ Get All Orders (Admin)
export const allLatestOrders = async (req, res, next) => {
    try {
        const orders = await Order.find()
            .populate({
                path: "user",
                select: "name email phone", // ✅ Fetch user details
            })
            .populate({
                path: "cartItems.productId", // ✅ Fix incorrect accessor
                select: "name photos price",
            }) // ✅ Populate product details
            .sort({ createdAt: -1 }); // ✅ Apply sorting before executing query

        return res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        next(error); // ✅ Pass to global error handler
    }
};