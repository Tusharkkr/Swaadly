import userModel from "../models/userModel.js"

// add to user cart  
const addToCart = async (req, res) => {
   try {
      const userData = await userModel.findById(req.userId);
      if (!userData) return res.status(404).json({ success: false, message: "User not found" });
      const { itemId } = req.body;
      if (!itemId) return res.status(400).json({ success: false, message: "Item id is required" });
      const cartData = { ...(userData.cartData || {}) };
      if (!cartData[itemId]) {
         cartData[itemId] = 1;
      }
      else {
         cartData[itemId] += 1;
      }
      await userModel.findByIdAndUpdate(req.userId, { cartData });
      res.json({ success: true, message: "Added To Cart" });
   } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error" })
   }
}

// remove food from user cart
const removeFromCart = async (req, res) => {
   try {
      const userData = await userModel.findById(req.userId);
      if (!userData) return res.status(404).json({ success: false, message: "User not found" });
      const { itemId } = req.body;
      if (!itemId) return res.status(400).json({ success: false, message: "Item id is required" });
      const cartData = { ...(userData.cartData || {}) };
      if (cartData[itemId] > 0) {
         cartData[itemId] -= 1;
         if (cartData[itemId] === 0) delete cartData[itemId];
      }
      await userModel.findByIdAndUpdate(req.userId, { cartData });
      res.json({ success: true, message: "Removed From Cart" });
   } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error" })
   }

}

// get user cart
const getCart = async (req, res) => {
   try {
      const userData = await userModel.findById(req.userId);
      if (!userData) return res.status(404).json({ success: false, message: "User not found" });
      res.json({ success: true, cartData: userData.cartData || {} });
   } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error" })
   }
}


export { addToCart, removeFromCart, getCart }
