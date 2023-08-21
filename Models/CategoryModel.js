const mongoose = require("mongoose")
var uniqueValidator = require('mongoose-unique-validator');


const categorySchema = mongoose.Schema({
    name:{
        type:String,
        require,
        unique: true
    },

   
})

categorySchema.plugin(uniqueValidator);


const CategoryModel = mongoose.model("Categories", categorySchema)

module.exports = CategoryModel;