const categoryRouter = require("express").Router()
const jwt = require("jsonwebtoken");
const Category = require("../Models/CategoryModel")

categoryRouter.post("/addCategory", async (req, res)=> {
    // const {access_token}= req.cookies
    const {title} = req.body;
    try {
    // const user = jwt.decode(access_token, )

    // console.log(user)
    const ifUserExist = await Category.findOne({ name: title });

    if(ifUserExist) return res.status(400).json({error:"Category already added"})
    const newCategory =  Category({name:title})
    await newCategory.save()
    res.json({ message: "Category added successfully" });

    } catch (error) {
        res.status(500).json({ message: "An error occurred" });
    }

})

categoryRouter.get("/allCategory", async (req, res)=>{
    try {
        const allCat =await Category.find().populate()
        res.json(allCat)
    } catch (error) {
        res.status(500).json({ message: "An error occurred" });
        
    }

})

categoryRouter.put("/updateCategory", async (req, res)=>{
    const {title, id} = req.body;

    try {
    const ifCategoryExist = await Category.findById(id);
    if(!title)  return res.status(400).json({error:"Title is required"})
    if(!id)  return res.status(400).json({error:"Category id is required"})

    if(!ifCategoryExist)  return res.status(400).json({error:"Category does not exist"})

   
    ifCategoryExist.name = title
    await ifCategoryExist.save(
        { runValidators: true, context: 'query' },
    )

    res.status(200).json({status:"success"})
    } catch (error) {
        console.log(error)
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
})


categoryRouter.delete("/deleteCatedory/:id", async (req, res)=>{
    try {
    const category = (req.params.id)
    
    if(!category) return res.status(400).json({errorMessage:"No post selected to be deleted"})
    
    const response = await Category.findOneAndDelete({_id: category})
    if(!response) return res.status(400).json({error:"Category does not exist"})
        
    res.status(200).json({message:"Category deleted successfully"})
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
})

module.exports = categoryRouter