import Cart from "../model/cartModel.js";

export function insertCart(req, res) {
  const { userId, products } = req.body;

  const a = new Cart({
    userId,
    products,
  });

  a.save((e, u) => {
    console.log(e, u);
  });
}