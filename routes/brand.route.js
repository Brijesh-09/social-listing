// routes/brand.route.js
import express from "express";
import {
    createBrand,
    getBrands,
    addKeywordGroup,
    updateKeywordGroup,
    deleteKeywordGroup,
    assignUsersToBrand,
    getKeywordGroupsByBrand,
    getAllKeywordsFromBrand,
    getBrandsByUser
  } from "../controllers/brand.controller.js";
const router = express.Router();

router.post("/create", createBrand);
router.get("/all", getBrands);

// keyword group management
router.post("/add-keyword-group", addKeywordGroup);
router.post("/update-keyword-group", updateKeywordGroup);
router.post("/delete-keyword-group", deleteKeywordGroup);
router.get("/:brandName/keyword-groups", getKeywordGroupsByBrand);
router.get("/:brandName/keywords", getAllKeywordsFromBrand);
router.get("/user/:email", getBrandsByUser);




// assign users to brand
router.post("/assign-users", assignUsersToBrand);

export default router;
