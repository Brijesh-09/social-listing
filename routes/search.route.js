// routes/search.route.js
import express from "express";
import { searchRecent } from "../controllers/search.recent.controller.js";
import { searchHistorical } from "../controllers/search.historical.controller.js";
import { getAllKeywords, getDataByKeyword } from "../controllers/dashboard.controllers.js";

const router = express.Router();

router.post("/recent", searchRecent);
router.post("/historical", searchHistorical);

router.get("/data", getDataByKeyword)

router.get("/keywords" , getAllKeywords);
export default router;
