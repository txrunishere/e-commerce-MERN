import asyncHandler from "express-async-handler";
import { Product } from "../models/product.model.js";
import { z } from "zod";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.utility.js";
import fs from "fs";
import { isSeller } from "../helpers/permission.js";

const handleUploadProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, brand } = req.body;

  const checkSeller = await isSeller(req.user._id);

  if (!checkSeller) {
    return res.status(400).json({
      error: "Only Sellers can add their products",
    });
  }
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) {
    return res.status(400).json({
      error: "Price must be a valid number",
    });
  }

  const validate = z.object({
    name: z.string().min(1, "Name is required"),
    description: z
      .string()
      .min(1, "Description is required")
      .max(200, "Description not more than 200 characters"),
    price: z
      .number()
      .min(9, "Product's price must be minimum 9 bucks")
      .max(1000000, "Product's price must be maximun a million"),
    stock: z.enum(["true", "false"]).default("false"),
    brand: z.string().min(1, "Brand is required"),
  });

  const { success, error } = validate.safeParse({
    name,
    description,
    price: numericPrice,
    stock,
    brand,
  });
  // console.log(req.file);
  if (!success) {
    fs.unlinkSync(req.file?.path);
    return res.status(404).json({
      errors: error.errors.map((err) => err.message),
    });
  }

  const productImagePath = req.file?.path;
  if (!productImagePath) {
    return res.status(400).json({
      error: "Product Image is required!",
    });
  }

  let image;

  try {
    image = await uploadOnCloudinary(
      productImagePath,
      process.env.PRODUCT_IMAGE_FOLDER
    );
    console.log("Product Image", image);
  } catch (error) {
    return res.status(500).json({
      error: "Error while uploading image on cloudinary",
    });
  }

  try {
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      brand,
      productImage: image.url,
    });

    // console.log(typeof product.price);

    if (product) {
      return res.status(201).json({
        message: `Product ${product.name} is added successfully`,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: `${product.stock ? "In stock" : "Out of Stock"}`,
        brand: product.brand,
        productImage: product.productImage,
      });
    }
  } catch (error) {
    console.log("Error while register Product", error);

    if (image) {
      await deleteFromCloudinary(image.public_id);
    }

    return res.status(500).json({
      error: error.message || "Something went wrong while Register Product",
    });
  }
});

export { handleUploadProduct };
