import UserModel from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const generatedRefreshToken = async (userId) => {
    if (!process.env.SECRET_KEY_REFRESH_TOKEN) {
        throw new Error("SECRET_KEY_REFRESH_TOKEN is not defined in .env");
    }

    // Generate JWT token
    const token = jwt.sign(
        { id: userId },
        process.env.SECRET_KEY_REFRESH_TOKEN,
        { expiresIn: '7d' }
    );

    // Update refresh token in user document
    await UserModel.updateOne(
        { _id: userId },
        { refresh_token: token }
    );

    return token;
};

export default generatedRefreshToken;
