import express from "express"
import { addToCart, clearOrderedItems, deleteCartItem, fetchCartItems, updateCartItemQty } from "../Controllers/CartController.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";



const router = express.Router();

router.post("/add", addToCart);
// router.post("/clear-ordered/:userId", isAuthenticatedUser, clearOrderedItems);
router.get("/get/:userId", fetchCartItems);
router.put("/update", updateCartItemQty);
router.delete("/delete/:userId/:productId", isAuthenticatedUser, deleteCartItem);
router.post("/clear-ordered/:userId", isAuthenticatedUser, clearOrderedItems);

export default router;