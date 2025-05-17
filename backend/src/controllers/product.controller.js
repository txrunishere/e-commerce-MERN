import asyncHandler from "express-async-handler";
import { Product } from "../models/product.model.js";
import { z } from "zod";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.utility.js";
import fs from "fs";

const handleUploadProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, brand } = req.body;

  const validate = z.object({
    name: z.string().min(1, "Name is required"),
    description: z
      .string()
      .min(1, "Description is required")
      .max(200, "Description not more than 200 characters"),
    price: z.number().min(1, "Price must be at least 1"),
    stock: z.enum([true, false]).default(false),
    brand: z.string().min(1, "Brand is required"),
  });

  const { success, error } = validate.safeParse({
    name,
    description,
    price,
    stock,
    brand,
  });

  if (!success) {
    fs.unlinkSync(req.file?.productImage);
    return res.status(200).json({
      errors: error.errors.map((err) => err.message),
    });
  }

  const productImagePath = req.file?.productImage;
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
