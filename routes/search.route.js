import express from "express";
import { searchKeyword } from "../controllers/search.controller.js";


const router = express.Router();

// POST /api/search
router.post("/", searchKeyword);

export default router;
