const authRouter = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../Models/UserModel");
const jwt = require("jsonwebtoken");
const multer = require("multer");

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
    // console.log(req.body)
    const {
      phoneNumber,
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    } = req.body;
    const profileImage = req.file;
    try {
      if (!phoneNumber)
        return res
          .status(400)
          .json({ errorMessage: "Phone number is required" });
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
      const token = jwt.sign(
        {
          user: saveUser.id,
        },
        process.env.TOKEN_SECRETE
      );
      //Setting Cookeis
      res.cookie("access_token", token, {
        httpOnly: true,
      }).send();

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
        console.error(error)

        res.status(500).send();
    }
  }
);

authRouter.post("/login", (req, res) => {
  try {
  } catch (error) {}
});

module.exports = authRouter;
