// routes/search.route.js
import express from "express";
import { searchRecent } from "../controllers/search.recent.controller.js";
import { searchHistorical } from "../controllers/search.historical.controller.js";
import { getAllKeywordsByBrand, getPostsByBrand } from "../controllers/dashboard.controllers.js";
import { runSearch, runSearchForBrand } from "../controllers/search.brand.controller.js";

const router = express.Router();    

router.post("/recent", searchRecent);
router.post("/run", runSearchForBrand);
router.post("/brandsearch" , runSearch)
router.post("/historical", searchHistorical);

router.get("/data", getPostsByBrand)

router.get("/keywords" , getAllKeywordsByBrand);
export default router;
