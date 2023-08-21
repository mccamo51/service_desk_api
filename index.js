const express = require("express")
const dotEnv = require("dotenv")
const mongoose = require("mongoose")
const cookieParser = require("cookie-parser")
const multer = require('multer');



//==============================================//
const app = express();
dotEnv.config()
const PORT = process.env.PORT || 3002;

//================================================//
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cookieParser())

app.use('/public/uploads', express.static(`${process.cwd()}/public/uploads`));


mongoose.connect(process.env.MDB_CONNECT)











app.use("/category", require("./Routers/categoryRouter"))

app.use("/auth", require("./Routers/authRouter"))



app.listen(PORT,()=> console.log(`App started on port ${PORT}`))