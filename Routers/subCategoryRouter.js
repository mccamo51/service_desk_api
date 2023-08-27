const subCategoryRouter = require("express").Router();
const Category = require("../Models/CategoryModel");
const SubCategory = require("../Models/SubCategoryModel");

subCategoryRouter.post("/addSubCategory", async (req, res) => {
  const { title, catId } = req.body;
  try {
    if (!title || !catId)
      return res.status(400).json({ errorMessage: "All fields are required" });

    const category = await Category.findById(catId);
    const ifSubCategoryExist = await SubCategory.findOne({ name: title });
    if (!category)
      return res.status(400).json({ errorMessage: "Category does not exist" });

    if (ifSubCategoryExist)
      return res
        .status(400)
        .json({ errorMessage: "Subcategory already exist" });
    await SubCategory({ category, name: title }).save({
      runValidators: true,
      context: "query",
    });

    res.status(200).json({ message: "Sub Category added successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessages = {};

      // Iterate through the validation errors and store custom error messages
      for (let key in error.errors) {
        errorMessages[key] = error.errors[key].message;
      }

      res.status(400).json({ errors: errorMessages });
    } else {
      res.status(500).json({ message: "An error occurred" });
    }
  }
});

subCategoryRouter.put("/updateSubCategory", async (req, res) => {
  const { title, subCatId } = req.body;
  try {
    if (!title || !subCatId)
      return res.status(400).json({ errorMessage: "All fields are required" });

    const subcategory = await SubCategory.findById(subCatId);

    if (!subcategory)
      return res
        .status(400)
        .json({ errorMessage: "Subcategory does not exist" });

    subcategory.name = title;

    await subcategory.save({ runValidators: true, context: "query" });
    res.status(200).json({ message: "Sub Category update successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessages = {};

      // Iterate through the validation errors and store custom error messages
      for (let key in error.errors) {
        errorMessages[key] = error.errors[key].message;
      }

      res.status(400).json({ errors: errorMessages });
    } else {
      res.status(500).json({ message: "An error occurred" });
    }
  }
});

subCategoryRouter.delete("/deleteSubCategory/:id", async (req, res) => {
  const category = req.params.id;
  try {
    if (!category)
      return res
        .status(400)
        .json({ errorMessage: "No post selected to be deleted" });

    const response = await SubCategory.findOneAndDelete({ _id: category });
    if (!response)
      return res.status(400).json({ error: "Category does not exist" });

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errorMessages = {};

      // Iterate through the validation errors and store custom error messages
      for (let key in error.errors) {
        errorMessages[key] = error.errors[key].message;
      }

      res.status(400).json({ errors: errorMessages });
    } else {
      res.status(500).json({ message: "An error occurred" });
    }
  }
});

subCategoryRouter.get("/getSubCatById", async (req, res) => {
  const { subCatId } = req.query;
  let subCategoryData;
  try {
    if (subCatId === undefined) {
      subCategoryData = await SubCategory.find().populate();
    } else {
      subCategoryData = await SubCategory.find({ name: subCatId }).populate();
    }
    res.status(200).json(subCategoryData);

    // console.log(subCategoryData, subCatId);
  } catch (error) {}
});

subCategoryRouter.get("/getAllSubCate", async (req, res) => {
  // const {subCatId} = req.query;
  let subCategoryData;
  try {
    // if(subCatId === undefined){

    subCategoryData = await SubCategory.find().populate();
    // }else{
    //      subCategoryData =await SubCategory.find({name:subCatId}).populate()

    // }
    console.log(subCategoryData, subCatId);
    res.status(200).json(subCategoryData);

  } catch (error) {}
});
module.exports = subCategoryRouter;
