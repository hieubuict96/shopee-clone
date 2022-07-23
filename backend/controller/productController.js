import Product from "../model/productModel.js";
import path from "path";

const __dirWork = path.resolve();

export async function getFlashSale(req, res) {
  try {
    const isVerifyFail = req.headers.is_verify_fail ? true : false;
    const products = await Product.find();

    const productsSale = products.filter((d) => d.price - d.priceSale > 0);

    return res.status(200).json({ productsSale, isVerifyFail });
  } catch (error) {
    return res.status(500).json({ error: "serverError" });
  }
}

export async function getAllProductsSeller(req, res) {
  try {
    const { userId } = req.query;
    const productsListSeller = await Product.find({ shop: userId });
    return res.status(200).json({ productsListSeller });
  } catch (error) {
    res.status(500).send({ error: "serverError" });
  }
}

export async function addProduct(req, res) {
  const {
    shopId,
    productName,
    categoryIdSelected,
    price,
    quantity,
    priceSale,
    quantitySale,
    desc,
    imgProducts,
  } = req.body;

  const intPrice = parseInt(price);
  const intQuantity = parseInt(quantity);
  const intPriceSale = parseInt(priceSale);
  const intQuantitySale = parseInt(quantitySale);

  const linksImgProducts = imgProducts.map((value) => {
    return `/public/image/img-product/${value}`;
  });

  const slug = productName.replaceAll(/ +/g, "-");

  try {
    const newProduct = new Product({
      name: productName,
      slug,
      ...(intPrice && { price: intPrice }),
      ...(intQuantity && { quantity: intQuantity }),
      ...(intPriceSale && { priceSale: intPriceSale }),
      ...(intQuantitySale && { quantitySale: intQuantitySale }),
      ...(desc && { description: desc }),
      shop: shopId,
      category: categoryIdSelected,
      productImages: linksImgProducts,
    });

    const product = await newProduct.save();
    return res.status(200).json({ product });
  } catch (error) {
    req.body.imgProducts.forEach((value) => {
      fs.unlinkSync(
        path.join(__dirWork, "public", "image", "img-product", value)
      );
    });

    return res.status(500).json({ error: "serverError" });
  }
}

export async function getProduct(req, res) {
  const { id } = req.params;
  Product.findById(id)
    .populate("shop")
    .populate("reviews.userId", "firstName lastName")
    .exec((error, product) => {
      if (error) return res.status(500).json({ error: "productNotFound" });
      if (product) {
        return res.status(200).json({ product });
      }
    });
}

export async function getAllProductsCustomer(req, res) {
  try {
    const products = await Product.find({});
    return res.status(200).json({ products })
  } catch (error) {
    return res.status(500).json({ error: "serverError" })
  }
}
