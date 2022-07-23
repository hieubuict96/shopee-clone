import Cart from "../model/cartModel.js";
import Product from "../model/productModel.js";

export async function addToCart(req, res) {
  const { userId, quantityBuy, productId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (cart) {
      const element = cart.products.find((e) => e.productId == productId);
      if (element) {
        const index = cart.products.findIndex((e) => e == element);
        cart.products[index].quantity += quantityBuy;
        await cart.save();
        return res.status(200).json({ success: "addToCartSuccess" });
      }

      cart.products = [
        ...cart.products,
        {
          productId,
          quantity: quantityBuy,
        },
      ];

      await cart.save();
      return res.status(200).json({ success: "addToCartSuccess" });
    }

    const newCart = new Cart({
      userId,
      products: [
        {
          productId,
          quantity: quantityBuy,
        },
      ],
    });

    await newCart.save();
    return res.status(200).json({ success: "addToCartSuccess" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "serverError" });
  }
}

export async function getCart(req, res) {
  const { userId } = req.query;
  try {
    const doc = await Cart.findOne({ userId }).populate("products.productId");

    return res.status(200).json({ doc });
  } catch (error) {
    return res.status(500).json({ error: "serverError" });
  }
}

export async function reduceQtt(req, res) {
  const { userId, productId } = req.body;
  try {
    const doc = await Cart.findOne({ userId });

    if (doc) {
      doc.products.forEach((value, key) => {
        if (value.productId == productId) {
          doc.products[key].quantity -= 1;
        }
      });

      await doc.save();
      return res.status(200).json({ success: "reduceSuccess" });
    }
  } catch (error) {
    res.status(500).json({ error: "serverError" });
  }
}

export async function increaseQtt(req, res) {
  const { userId, productId } = req.body;
  try {
    const doc = await Cart.findOne({ userId });

    if (doc) {
      doc.products.forEach((value, key) => {
        if (value.productId == productId) {
          doc.products[key].quantity += 1;
        }
      });

      await doc.save();
      return res.status(200).json({ success: "increaseSuccess" });
    }
  } catch (error) {
    res.status(500).json({ error: "serverError" });
  }
}

export async function deleteProduct(req, res) {
  const { userId, productId } = req.query;

  try {
    const doc = await Cart.findOne({ userId });
    if (doc) {
      if (doc.products.length <= 1) {
        await doc.delete();
      } else {
        doc.products.forEach(async (value, key) => {
          if (value.productId == productId) {
            doc.products.splice(key, 1);
            await doc.save();
          }
        });
      }

      return res.status(200).json({ success: "deleteProductSuccess" });
    }
  } catch (error) {
    return res.status(500).json({ error: "serverError" });
  }
}

export async function addToOrder(req, res) {
  const { userId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });

    // const newOrder = new Order({
    //   userId,
    //   products: cart.products
    // })

    // await newOrder.save();

    cart.products.forEach(async (value, key) => {
      const product = await Product.findById(value.productId);
      product.order.push({
        user: userId,
        quantity: value.quantity,
      });

      await product.save();
    });
    await cart.delete();
    return res.status(200).json({ success: "orderSuccess" });
  } catch (error) {
    return res.status(500).json({ error: "serverError" });
  }
}
