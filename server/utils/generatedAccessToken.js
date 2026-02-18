import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const generatedAccessToken = (userId) => {
    if (!process.env.SECRET_KEY_ACCESS_TOKEN) {
        throw new Error("SECRET_KEY_ACCESS_TOKEN is not defined in .env");
    }

    const token = jwt.sign(
        { id: userId },
        process.env.SECRET_KEY_ACCESS_TOKEN,
        { expiresIn: '5h' }
    );

    return token;
};

export default generatedAccessToken;
