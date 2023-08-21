const mongoose = require("mongoose")
var uniqueValidator = require('mongoose-unique-validator');

const subCatogorySchema = mongoose.Schema({

    category: {type:mongoose.Schema.Types.ObjectId, ref:'Categories', require,},
    name:{
        type:String,
        require,
        unique: true
    },
  
})


subCatogorySchema.plugin(uniqueValidator);

const SubCategoryModel = mongoose.model("subcategories", subCatogorySchema)

module.exports = SubCategoryModel;