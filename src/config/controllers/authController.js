import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../mail.js";
import dotenv from "dotenv";
import crypto from "crypto";
dotenv.config();
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,

      // ✅ ROLE ADDED (SAFE DEFAULT)
      role: role || "user"
    });

    res.status(201).json({
      message: "Register successful",
      user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role   // ✅ ROLE ADDED INSIDE TOKEN
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: user.email, 
      subject: "Login Successful",
      html: `
        <h2>Hello ${user.name}</h2>
        <p>You successfully logged into ERP System.</p>
      `
    });

    res.status(200).json({
      message: "Login successful",
      token,

      // ✅ SEND ROLE TO FRONTEND
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
// export const login = async (req, res) => {
//   console.log("Login request received:", req.body);
//   try {

//     const { email, password } = req.body;
//     console.log("Email received:", email);

//     const user = await User.findOne({ email });


//     if (!user) {

//       return res.status(400).json({
//         message:"Invalid email"
//       });

//     }



//     const isMatch = await bcrypt.compare(
//       password,
//       user.password
//     );


//     if (!isMatch) {

//       return res.status(400).json({
//         message:"Invalid password"
//       });

//     }



//     const token = jwt.sign(

//       {
//         id:user._id,
//         role:user.role
//       },

//       process.env.JWT_SECRET,

//       {
//         expiresIn:"1d"
//       }

//     );



//     // Email should not stop login

//     try {

//       await transporter.sendMail({

//         from:process.env.MAIL_USER,

//         to:user.email,

//         subject:"Login Successful",

//         html:`
//         <h2>Hello ${user.name}</h2>
//         <p>You successfully logged into ERP System.</p>
//         `

//       });


//     } catch(emailError){

//       console.log(
//         "Mail error:",
//         emailError.message
//       );

//     }



//     res.status(200).json({

//       message:"Login successful",

//       token,


//       user:{

//         _id:user._id,

//         name:user.name,

//         email:user.email,

//         role:user.role

//       }

//     });



//   } catch(error){


//     res.status(500).json({

//       message:error.message

//     });


//   }

// };
export const forgotPassword = async (
  req,
  res
) => {

  try {

    const { email } = req.body;

    const user = await User.findOne({
      email
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Generate Token
    const resetToken =
      crypto.randomBytes(32).toString("hex");

    user.resetToken = resetToken;

    user.resetTokenExpire =
      Date.now() + 10 * 60 * 1000;

    await user.save();

    // Reset Link
    const resetLink =
      `http://localhost:5173/reset-password/${resetToken}`;

    // Send Mail
    await transporter.sendMail({
      from: process.env.MAIL_USER,

      to: user.email,

      subject: "Password Reset",

      html: `
        <h2>Password Reset</h2>

        <p>Click below link to reset password:</p>

        <a href="${resetLink}">
          Reset Password
        </a>
      `
    });

    res.status(200).json({
      message:
        "Password reset link sent to email"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};
export const resetPassword = async (
  req,
  res
) => {

  try {

    const { token } = req.params;

    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,

      resetTokenExpire: {
        $gt: Date.now()
      }
    });

    if (!user) {
      return res.status(400).json({
        message:
          "Invalid or expired token"
      });
    }

    // Hash New Password
    const hashedPassword =
      await bcrypt.hash(password, 10);

    user.password = hashedPassword;

    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.status(200).json({
      message:
        "Password reset successful"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};