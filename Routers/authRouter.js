const authRouter = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../Models/UserModel");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const emailService = require('../Config/emailConfig');


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

    console.log(email);
    console.log(phoneNumber);

    //Validating email using regEx
    // var valid = emailRegex.test(email);

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
      res.cookie("access_token", token, {
        httpOnly: true,
      });

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
          phoneNumber: savedUser.phoneNumber,
        },
      });

      // if(!profileImage) return res.status(400).json({errorMessage:"Profile Pic is required"})
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
  } catch (error) {
    console.log(error);
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

authRouter.put("/updateUser", async (req, res) => {
  try {
    const { phoneNumber, firstName, lastName, email } = req.body;
    const { access_token } = req.cookies;
    const userID = jwt.decode(access_token);

    var valid = emailRegex.test(email);
    const phone = phoneno.test(phoneNumber);

    if (!phoneNumber || !firstName || !email || !lastName)
      return res.status(400).json({ errorMessage: "All fields are required" });

    if (!valid)
      return res
        .status(400)
        .json({ errorMessage: "Enter a valid email address" });

    if (!phone)
      return res
        .status(400)
        .json({ errorMessage: "Enter a valid email address" });

    const ifUserExist = await User.findById(userID.user);

    if (!ifUserExist) {
      return res.status(400).json({ errorMessage: "User does not exist" });
    } else {
      if (userID.user === ifUserExist.id) {
        const updatedUser = await ifUserExist.updateOne({
          firstName,
          lastName,
          email,
          phoneNumber,
        });
        res.json({ message: "User details updated successfully" });
      } else {
        console.log("updatedUser");

        return res.status(401).json({ errorMessage: "User not authenticated" });
      }
    }
  } catch (error) {}
});

authRouter.put("/changePassword", async (req, res) => {
  try {
    const { access_token } = req.cookies;
    const userID = jwt.decode(access_token);
    const { password, newPassword, confirmPassword } = req.body;

    const ifUserExist = await User.findById(userID.user);
    const passwordCorrect = await bcrypt.compare(
      password,
      ifUserExist.harshedPassword
    );

    if (!newPassword || !password || !newPassword)
      return res.status(400).json({ errorMessage: "All fields are required" });

    if (passwordCorrect) {
      if (newPassword !== confirmPassword)
        return res
          .status(400)
          .json({ errorMessage: "Password does not match" });
      //Harsh new Password

      const salt = await bcrypt.genSalt();
      const harshedPassword = await bcrypt.hash(newPassword, salt);

      ifUserExist.harshedPassword = harshedPassword;
      await ifUserExist.save();

      res.json({ message: "Password changed successfully" });
      //Returning User Data
    } else {
      return res.status(400).json({ errorMessage: "Password incorrect" });
    }
  } catch (error) {
    console.log(error);
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

authRouter.put(
  "/updateProfileImage",
  upload.single("profileImage"),
  async (req, res) => {
    const profileImage = req.file;
    const { access_token } = req.cookies;

    try {
      const userID = jwt.decode(access_token);
      if (!profileImage)
        return res.status(400).json({ errorMessage: "Image is required" });

      const ifUserExist = await User.findById(userID.user);

      ifUserExist.profilePic = profileImage.path;

      await ifUserExist.save();

      res.json({ message: "Profile picture changed successfully" });
    } catch (error) {
      console.log(error);
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
  }
);

authRouter.post("/verifyEmail", async (req, res)=>{
const {email}= req.body
    try {
        
        console.log(email)
        const verificationToken = generateVerificationToken();


        await emailService.sendVerificationEmail(email, verificationToken);


  
    } catch (error) {
        
    }

})

module.exports = authRouter;
