import Product from "../model/productModel.js";

export async function getOrder(req, res) {
  try {
    const { sellerId } = req.query;

    const products = await Product.find({ shop: sellerId });
    const productsOrder = [];

    products.forEach((value) => {
      if (value.order.length >= 1) {
        productsOrder.push(value);
      }
    });

    return res.status(200).json({ productsOrder });
  } catch (error) {
    return res.status(500).json({ error: "serverError" });
  }
}
