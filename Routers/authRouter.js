const authRouter = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../Models/UserModel");
const jwt = require("jsonwebtoken");
const multer = require("multer");

var emailRegex =
  /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
var phoneno = /^\d{10}$/;
const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
});

authRouter.post(
  "/register",
  upload.single("profileImage"),
  async (req, res) => {
    const {
      phoneNumber,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    } = req.body;
    const profileImage = req.file;

    //Validating email using regEx
    var valid = emailRegex.test(email);

    try {
      if (!phoneNumber)
        return res
          .status(400)
          .json({ errorMessage: "Phone number is required" });
      if (phoneNumber.length < 10 || phoneNumber.length > 11)
        return res
          .status(400)
          .json({ errorMessage: "Enter a valid phone number" });
      if (!valid)
        return res
          .status(400)
          .json({ errorMessage: "Enter a valid email address" });

      if (!firstName || !lastName)
        return res
          .status(400)
          .json({ errorMessage: "Firstname or Lastname is required" });

      if (!confirmPassword || !password)
        return res
          .status(400)
          .json({ errorMessage: "Password and Confirm password is required" });
      if (confirmPassword !== password)
        return res.status(400).json({ errorMessage: "Password mismatch" });

      //Checking if user exist
      const ifUserExist = await User.findOne({ phoneNumber: phoneNumber });
      const ifEmailExist = await User.findOne({ email: email });
      //Harshing Password using Salt Algorithm
      if (ifUserExist || ifEmailExist)
        return res.status(400).json({ errorMessage: "User already exist" });
      const salt = await bcrypt.genSalt();
      const harshedPassword = await bcrypt.hash(password, salt);
      const saveUser = User({
        phoneNumber,
        firstName,
        lastName,
        email,
        harshedPassword,
        profilePic: profileImage.path,
      });
      const savedUser = await saveUser.save();
      //Generating Cookies
      const token = jwt.sign(
        {
          user: saveUser.id,
        },
        process.env.TOKEN_SECRETE
      );

      //Setting Cookeis
      res
        .cookie("access_token", token, {
          httpOnly: true,
        })

      //Returning User Details
        res.json({
          status: true,
          token: {
            access_token: token,
          },
          data: {
            email: savedUser.email,
            firstName: savedUser.firstName,
            lastName: savedUser.lastName,
            profilePic: savedUser.profilePic,
            phoneNumber:savedUser.phoneNumber
          },
        });

      // if(!profileImage) return res.status(400).json({errorMessage:"Profile Pic is required"})
    } catch (error) {
      console.error(error);

      res.status(500).send();
    }
  }
);

authRouter.post("/login", async (req, res) => {
  try {
    const { phoneNumber, email, password } = req.body;

    var valid = emailRegex.test(email);
    const phone = phoneno.test(phoneNumber);
    if (email === undefined) {
      if (!phoneNumber || !password)
        return res
          .status(400)
          .json({ errorMessage: "All fields are required" });
      if (!phone)
        return res
          .status(400)
          .json({ errorMessage: "Enter a valid phone number" });

      const ifUserExist = await User.findOne({ phoneNumber: phoneNumber });
      const ifEmailExist = await User.findOne({ email: email });
      //Harshing Password using Salt Algorithm
      if (!ifUserExist)
        return res
          .status(400)
          .json({ errorMessage: "Phone number or password incorrect" });

      const passwordCorrect = await bcrypt.compare(
        password,
        ifUserExist.harshedPassword
      );

      if (passwordCorrect) {
        const token = jwt.sign(
          {
            user: ifUserExist.id,
          },
          process.env.TOKEN_SECRETE
        );
        //Setting Cookies
        res.cookie("access_token", token, {
          httpOnly: true,
        });
        //Returning User Data
        res.json({
          status: 200,
          userDetails: {
            phone: ifUserExist.phoneNumber,
          },
        });
      } else {
        return res
          .status(400)
          .json({ errorMessage: "Email or password incorrect" });
      }
    } else {
      if (!valid)
        return res
          .status(400)
          .json({ errorMessage: "Enter a valid email address" });

      const ifEmailExist = await User.findOne({ email: email });
      //Harshing Password using Salt Algorithm

      //Harshing Password using Salt Algorithm
      if (!ifEmailExist)
        return res
          .status(400)
          .json({ errorMessage: "Email or password incorrect" });

      const passwordCorrect = await bcrypt.compare(
        password,
        ifEmailExist.harshedPassword
      );

      if (passwordCorrect) {
        const token = jwt.sign(
          {
            user: ifEmailExist.id,
          },
          process.env.TOKEN_SECRETE
        );
        //Setting Cookies
        res.cookie("access_token", token, {
          httpOnly: true,
        });
        //Returning User Data
        res.json({
          status: 200,
          userDetails: {
            phone: ifEmailExist.phoneNumber,
          },
        });
      } else {
        return res
          .status(400)
          .json({ errorMessage: "Phone number or password incorrect" });
      }
    }
  } catch (error) {}
});


authRouter.put("/updateUser", (req, res)=>{
    try {
        const {
            phoneNumber,
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
          } = req.body;

          
    } catch (error) {
        
    }
})

module.exports = authRouter;
