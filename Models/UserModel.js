const mongoose = require("mongoose")

var phoneno = /^\d{10}$/;
var emailRegex =
  /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
const userSchema = mongoose.Schema({
    firstName:{
        type:String,
        require
    },
    lastName:{
        type:String,
        require
    },
    phoneNumber:{
        type:String,
        require,
        match:[phoneno, "Enter a valid phone number"]
    },
    profilePic:{
        type:String,
    },
    harshedPassword:{
        type:String,
        require
    },
    email:{
        type:String,
        match:[
            emailRegex,
            "Enter a valid email" 
        ]
        
    },
})

const UserModel = mongoose.model("users",userSchema)

module.exports = UserModel;