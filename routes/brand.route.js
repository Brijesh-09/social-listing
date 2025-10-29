// routes/brand.route.js
import express from "express";
import { createBrand, updateBrandConfig , getBrands } from "../controllers/brand.controller.js";

const router = express.Router();

router.post("/create", createBrand);
router.post("/configure", updateBrandConfig);

router.get("/getbrands", getBrands);

export default router;
