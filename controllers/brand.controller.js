import { Brand } from "../models/brand.js";

/** ───────────── CREATE BRAND ───────────── **/
export const createBrand = async (req, res) => {
  try {
    const {
      brandName,
      description,
      keywordGroups = [],
      assignedUsers = [],
      frequency = "30m",
    } = req.body;

    if (!brandName)
      return res
        .status(400)
        .json({ success: false, message: "Brand name is required" });

    // prevent duplicate brands
    const existing = await Brand.findOne({ brandName });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Brand name already exists" });

    // ✅ Create brand document
    const brand = await Brand.create({
      brandName,
      description,
      keywordGroups,
      assignedUsers,
      frequency,
    });

    res.json({
      success: true,
      message: "Brand created successfully",
      brand,
    });
  } catch (err) {
    console.error("Create Brand Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/** ───────────── GET ALL BRANDS ───────────── **/
export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({});
    res.json({ success: true, count: brands.length, brands });
  } catch (err) {
    console.error("Error fetching brands:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};


/** ───────────── ADD KEYWORD GROUP ───────────── **/
export const addKeywordGroup = async (req, res) => {
  try {
    const {
      brandName,
      groupName,
      keywords = [],
      includeKeywords = [],
      excludeKeywords = [],
      platforms = [],
      language = "en",
      country = "IN",
      frequency = "30m",
      assignedUsers = [],
    } = req.body;

    if (!brandName || !groupName || !keywords.length)
      return res
        .status(400)
        .json({ success: false, message: "brandName, groupName, and keywords are required" });

    const brand = await Brand.findOne({ brandName });
    if (!brand)
      return res.status(404).json({ success: false, message: "Brand not found" });

    // check if group exists
    const existingGroup = brand.keywordGroups.find(
      (g) => g.groupName.toLowerCase() === groupName.toLowerCase()
    );

    if (existingGroup) {
      return res.status(400).json({
        success: false,
        message: `Keyword group '${groupName}' already exists for this brand`,
      });
    }

    brand.keywordGroups.push({
      groupName,
      keywords,
      includeKeywords,
      excludeKeywords,
      platforms,
      language,
      country,
      frequency,
      assignedUsers,
    });

    await brand.save();
    res.json({ success: true, message: "Keyword group added", brand });
  } catch (err) {
    console.error("Add Keyword Group Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/** ───────────── UPDATE KEYWORD GROUP ───────────── **/
export const updateKeywordGroup = async (req, res) => {
  try {
    const { brandName, groupName, update = {} } = req.body;

    if (!brandName || !groupName)
      return res
        .status(400)
        .json({ success: false, message: "brandName and groupName are required" });

    const brand = await Brand.findOne({ brandName });
    if (!brand)
      return res.status(404).json({ success: false, message: "Brand not found" });

    const group = brand.keywordGroups.find(
      (g) => g.groupName.toLowerCase() === groupName.toLowerCase()
    );
    if (!group)
      return res
        .status(404)
        .json({ success: false, message: "Keyword group not found" });

    // Merge updates dynamically
    Object.keys(update).forEach((key) => {
      if (Array.isArray(group[key])) {
        group[key] = [...new Set([...group[key], ...update[key]])]; // merge unique
      } else {
        group[key] = update[key];
      }
    });

    await brand.save();
    res.json({ success: true, message: "Keyword group updated", brand });
  } catch (err) {
    console.error("Update Keyword Group Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/** ───────────── DELETE KEYWORD GROUP ───────────── **/
export const deleteKeywordGroup = async (req, res) => {
  try {
    const { brandName, groupName } = req.body;

    if (!brandName || !groupName)
      return res
        .status(400)
        .json({ success: false, message: "brandName and groupName are required" });

    const brand = await Brand.findOne({ brandName });
    if (!brand)
      return res.status(404).json({ success: false, message: "Brand not found" });

    const beforeCount = brand.keywordGroups.length;
    brand.keywordGroups = brand.keywordGroups.filter(
      (g) => g.groupName.toLowerCase() !== groupName.toLowerCase()
    );

    if (brand.keywordGroups.length === beforeCount)
      return res
        .status(404)
        .json({ success: false, message: "Keyword group not found" });

    await brand.save();
    res.json({ success: true, message: "Keyword group deleted", brand });
  } catch (err) {
    console.error("Delete Keyword Group Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/** ───────────── ASSIGN USERS TO BRAND ───────────── **/
export const assignUsersToBrand = async (req, res) => {
  try {
    const { brandName, users = [] } = req.body;
    if (!brandName || !users.length)
      return res
        .status(400)
        .json({ success: false, message: "brandName and users are required" });

    const brand = await Brand.findOne({ brandName });
    if (!brand)
      return res.status(404).json({ success: false, message: "Brand not found" });

    brand.assignedUsers = Array.from(
      new Set([...brand.assignedUsers, ...users])
    );

    await brand.save();
    res.json({ success: true, message: "Users assigned to brand", brand });
  } catch (err) {
    console.error("Assign Users Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getKeywordGroupsByBrand = async (req, res) => {
  try {
    const { brandName } = req.params;

    if (!brandName)
      return res.status(400).json({ success: false, message: "brandName is required" });

    const brand = await Brand.findOne({ brandName }).select("brandName keywordGroups");

    if (!brand)
      return res.status(404).json({ success: false, message: "Brand not found" });

    res.json({
      success: true,
      brand: brand.brandName,
      count: brand.keywordGroups.length,
      keywordGroups: brand.keywordGroups.map((g) => ({
        groupName: g.groupName,
        keywords: g.keywords,
        platforms: g.platforms,
      })),
    });
  } catch (err) {
    console.error("Error fetching keyword groups:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllKeywordsFromBrand = async (req, res) => {
  try {
    const { brandName } = req.params;

    if (!brandName)
      return res.status(400).json({ success: false, message: "brandName is required" });

    const brand = await Brand.findOne({ brandName }).select("keywordGroups");

    if (!brand)
      return res.status(404).json({ success: false, message: "Brand not found" });

    const allKeywords = [
      ...new Set(brand.keywordGroups.flatMap((g) => g.keywords)),
    ];

    res.json({
      success: true,
      brand: brandName,
      count: allKeywords.length,
      keywords: allKeywords,
    });
  } catch (err) {
    console.error("Error fetching keywords:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBrandsByUser = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email)
      return res.status(400).json({ success: false, message: "User email is required" });

    // find brands where this email is in either assignedUsers or within any keyword group
    const brands = await Brand.find({
      $or: [
        { assignedUsers: email },
        { "keywordGroups.assignedUsers": email }
      ]
    }).select("brandName description frequency");

    res.json({
      success: true,
      user: email,
      count: brands.length,
      brands,
    });
  } catch (err) {
    console.error("Error fetching brands by user:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


