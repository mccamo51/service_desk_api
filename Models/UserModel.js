const mongoose = require("mongoose")


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
        require
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
        
    },
})

const UserModel = mongoose.model("users",userSchema)

module.exports = UserModel;