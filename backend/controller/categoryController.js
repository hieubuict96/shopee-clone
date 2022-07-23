import Category from "../model/categoryModel.js";

export async function createCategory(req, res) {
  try {
    const { name, imgCategory } = req.body;
    const slug = name.replaceAll(/ +/g, "-");
    const categoryImage = `/public/image/img-category/${imgCategory}`;
    const newCategory = new Category({
      name,
      slug,
      categoryImage,
    });

    const doc = await newCategory.save();
    res.status(200).json({ success: "success" })
  } catch (error) {
    return res.status(500).json({ error });
  }
}

export async function getCategory(req, res) {
  try {
    const isVerifyFail =  req.headers.is_verify_fail ? true : false;
    const categories = await Category.find();
    res.status(200).json({ categories, isVerifyFail });
  } catch (error) {
    res.status(500).json({ error: "serverError" });
  }
}
