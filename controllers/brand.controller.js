import {Brand} from "../models/brand.js";


//create brand 
export const createBrand = async (req, res) => {
  try {
    let { brandName, description, frequency } = req.body;

    if (!brandName) {
      return res.status(400).json({ success: false, message: "Brand name is required" });
    }

    // convert empty string to undefined so default applies
    if (!frequency) frequency = undefined;

    const existing = await Brand.findOne({ brandName });
    if (existing) {
      return res.status(400).json({ success: false, message: "Brand name already exists" });
    }

    const brand = await Brand.create({ brandName, description, frequency });
    res.json({ success: true, brand });
  } catch (err) {
    console.error("Create Brand Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};



//update brand config 
export const updateBrandConfig = async (req, res) => {
  try {
    const { brandName, keywords = [], platforms = [] } = req.body;

    if (!brandName) {
      return res.status(400).json({ success: false, message: "Brand name is required" });
    }

    const brand = await Brand.findOne({ brandName });
    if (!brand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }

    // merge unique keywords and platforms
    brand.keywords = [...new Set([...brand.keywords, ...keywords])];
    brand.platforms = [...new Set([...brand.platforms, ...platforms])];
    await brand.save();

    res.json({ success: true, brand });
  } catch (err) {
    console.error("Update Brand Config Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


//get brands
export const getBrands = async (req , res) =>{
    try{
        const data = await Brand.find({});
        res.json({
            success: true,
            count: data.length,
            brands: data
        });
    }catch(err){
        console.error("Error fetching brands:", err);
        res
          .status(500)
          .json({ success: false, message: "Server error", error: err.message });
    }
}