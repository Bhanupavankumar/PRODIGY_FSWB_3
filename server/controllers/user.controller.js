// controllers/user.controller.js

import sendEmail from '../config/sendEmails.js';
import UserModel from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js';
import generatedAccessToken from '../utils/generatedAccessToken.js';
import genertedRefreshToken from '../utils/generatedRefreshToken.js';
import uploadImageClodinary from '../utils/uploadImageClodinary.js';
import generatedOtp from '../utils/generatedOtp.js';
import forgotPasswordTemplate from '../utils/forgotPasswordTemplate.js';
import jwt from 'jsonwebtoken';

// ==============================
// REGISTER USER
// ==============================
export async function registerUserController(request, response) {
    try {
        const { name, email, password } = request.body;

        // 1. Validate inputs
        if (!name || !email || !password) {
            return response.status(400).json({
                message: "Provide name, email, and password",
                error: true,
                success: false
            });
        }

        const emailTrim = email.trim().toLowerCase();
        const nameTrim = name.trim();

        // 2. Check if user already exists
        const existingUser = await UserModel.findOne({ email: emailTrim });
        if (existingUser) {
            return response.status(400).json({
                message: "Email already registered",
                error: true,
                success: false
            });
        }

        // 3. Hash the password
        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(password, salt);

        // 4. Create new user
        const newUser = new UserModel({
            name: nameTrim,
            email: emailTrim,
            password: hashPassword,
            status: "Active",        // optional default values
            role: "USER",
            verify_email: false
        });

        const savedUser = await newUser.save();

        // 5. Generate email verification URL
        const VerifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${savedUser._id}`;

        // 6. Send verification email
        try {
            await sendEmail({
                sendTo: emailTrim,
                subject: "Verify Your Email - Shopping",
                html: verifyEmailTemplate({
                    name: nameTrim,
                    url: VerifyEmailUrl
                })
            });
        } catch (err) {
            console.error("Email sending failed:", err);
        }

        // 7. Remove password before returning response
        const { password: _, ...userData } = savedUser._doc;

        return response.status(201).json({
            message: "User registered successfully",
            error: false,
            success: true,
            data: userData
        });

    } catch (error) {
        console.error("Register error:", error);
        return response.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
}

// ==============================
// VERIFY EMAIL
// ==============================
export async function verifyEmailController(request, response) {
    try {
        const { code } = request.body;

        const user = await UserModel.findById(code);
        if (!user) {
            return response.status(400).json({
                message: "Invalid verification code",
                error: true,
                success: false
            });
        }

        await UserModel.findByIdAndUpdate(code, { verify_email: true });

        return response.json({
            message: "Email verified successfully",
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// ==============================
// LOGIN USER
// ==============================
export async function loginController(request, response) {
    try {
        const { email, password } = request.body;

        // Check required fields
        if (!email || !password) {
            return response.status(400).json({
                message: "Provide email and password",
                error: true,
                success: false
            });
        }

        // Find user in database
        const user = await UserModel.findOne({ email });
        if (!user) {
            return response.status(400).json({
                message: "User not registered",
                error: true,
                success: false
            });
        }

        // Check if user status is Active
        if (user.status !== "Active") {
            return response.status(400).json({
                message: "Contact Admin",
                error: true,
                success: false
            });
        }

        // Compare password
        const checkPassword = await bcryptjs.compare(password, user.password);
        
        // Debugging: log hashed password and comparison
        console.log("Entered password:", password);
        console.log("Stored hashed password:", user.password);
        console.log("Password match:", checkPassword);

        if (!checkPassword) {
            return response.status(400).json({
                message: "Incorrect password",
                error: true,
                success: false
            });
        }

        // Generate access and refresh tokens
        const accessToken = await generatedAccessToken(user._id);
        const refreshToken = await genertedRefreshToken(user._id);

        // Update last login date
        await UserModel.findByIdAndUpdate(user._id, { last_login_date: new Date() });

        // Set cookies
        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        };
        response.cookie('accessToken', accessToken, cookiesOption);
        response.cookie('refreshToken', refreshToken, cookiesOption);

        // Send response
        return response.json({
            message: "Login successful",
            error: false,
            success: true,
            data: { accessToken, refreshToken }
        });

    } catch (error) {
        console.error("Login error:", error);
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// ==============================
// LOGOUT USER
// ==============================
export async function logoutController(request, response) {
    try {
        const userId = request.userId;

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        };

        response.clearCookie('accessToken', cookiesOption);
        response.clearCookie('refreshToken', cookiesOption);

        await UserModel.findByIdAndUpdate(userId, { refresh_token: "" });

        return response.json({
            message: "Logout successful",
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// ==============================
// UPLOAD USER AVATAR
// ==============================
export async function uploadAvatar(request, response) {
    try {
        const userId = request.userId;
        const image = request.file;

        const upload = await uploadImageClodinary(image);

        await UserModel.findByIdAndUpdate(userId, { avatar: upload.url });

        return response.json({
            message: "Avatar uploaded successfully",
            error: false,
            success: true,
            data: { _id: userId, avatar: upload.url }
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// ==============================
// UPDATE USER DETAILS
// ==============================
export async function updateUserDetails(request, response) {
    try {
        const userId = request.userId;
        const { name, email, mobile, password } = request.body;

        let hashPassword = "";
        if (password) {
            const salt = await bcryptjs.genSalt(10);
            hashPassword = await bcryptjs.hash(password, salt);
        }

        const updateUser = await UserModel.updateOne({ _id: userId }, {
            ...(name && { name }),
            ...(email && { email }),
            ...(mobile && { mobile }),
            ...(password && { password: hashPassword })
        });

        return response.json({
            message: "Updated successfully",
            error: false,
            success: true,
            data: updateUser
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// ==============================
// FORGOT PASSWORD
// ==============================
export async function forgotPasswordController(request, response) {
    try {
        const { email } = request.body;
        if (!email) {
            return response.status(400).json({
                message: "Email is required",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return response.status(400).json({
                message: "Email not registered",
                error: true,
                success: false
            });
        }

        const otp = generatedOtp();
        const expireTime = Date.now() + 60 * 60 * 1000; // 1 hour

        await UserModel.findByIdAndUpdate(user._id, {
            forgot_password_otp: otp,
            forgot_password_expiry: new Date(expireTime).toISOString()
        });

        await sendEmail({
            sendTo: email,
            subject: "Forgot Password - Shopping",
            html: forgotPasswordTemplate({ name: user.name, otp })
        });

        return response.json({
            message: "Check your email for OTP",
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// ==============================
// VERIFY FORGOT PASSWORD OTP
// ==============================
export async function verifyForgotPasswordOtp(request, response) {
    try {
        const { email, otp } = request.body;

        if (!email || !otp) {
            return response.status(400).json({
                message: "Email and OTP are required",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return response.status(400).json({
                message: "Email not registered",
                error: true,
                success: false
            });
        }

        const currentTime = new Date().toISOString();
        if (!user.forgot_password_expiry || user.forgot_password_expiry < currentTime) {
            return response.status(400).json({
                message: "OTP expired",
                error: true,
                success: false
            });
        }

        if (otp !== user.forgot_password_otp) {
            return response.status(400).json({
                message: "Invalid OTP",
                error: true,
                success: false
            });
        }

        await UserModel.findByIdAndUpdate(user._id, {
            forgot_password_otp: "",
            forgot_password_expiry: ""
        });

        return response.json({
            message: "OTP verified successfully",
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// ==============================
// RESET PASSWORD
// ==============================
export async function resetpassword(request, response) {
    try {
        const { email, newPassword, confirmPassword } = request.body;

        if (!email || !newPassword || !confirmPassword) {
            return response.status(400).json({
                message: "Provide email, newPassword, confirmPassword",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return response.status(400).json({
                message: "Email not registered",
                error: true,
                success: false
            });
        }

        if (newPassword !== confirmPassword) {
            return response.status(400).json({
                message: "newPassword and confirmPassword must match",
                error: true,
                success: false
            });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashPassword = await bcryptjs.hash(newPassword, salt);

        await UserModel.findByIdAndUpdate(user._id, {
            password: hashPassword,
            forgot_password_otp: "",
            forgot_password_expiry: ""
        }, { new: true });

        return response.json({
            message: "Password updated successfully",
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}


// ==============================
// REFRESH TOKEN
// ==============================
export async function refreshToken(request, response) {
    try {
        const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(" ")[1];
        if (!refreshToken) {
            return response.status(401).json({
                message: "Invalid token",
                error: true,
                success: false
            });
        }

        const verifyToken = jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN);
        if (!verifyToken) {
            return response.status(401).json({
                message: "Token expired",
                error: true,
                success: false
            });
        }

        const newAccessToken = await generatedAccessToken(verifyToken._id);

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        };
        response.cookie('accessToken', newAccessToken, cookiesOption);

        return response.json({
            message: "New access token generated",
            error: false,
            success: true,
            data: { accessToken: newAccessToken }
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}

// ==============================
// GET LOGGED-IN USER DETAILS
// ==============================
export async function userDetails(request, response) {
    try {
        const userId = request.userId;

        const user = await UserModel.findById(userId).select('-password -refresh_token');

        return response.json({
            message: "User details fetched",
            error: false,
            success: true,
            data: user
        });

    } catch (error) {
        return response.status(500).json({
            message: "Something went wrong",
            error: true,
            success: false
        });
    }
}
