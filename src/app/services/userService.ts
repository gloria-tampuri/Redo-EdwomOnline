import  User  from '../../models/User';
import { hashPassword } from '../utils/hash';

export const createUser = async (email: string, password: string, name: string) => {
    const passwordHash = await hashPassword(password);
    const newUser = new User({
        email,
        passwordHash,
        name,
        role: 'user', // Default role
        isEmailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    await newUser.save();
    return newUser;
};

export const findUserByEmail = async (email: string) => {
    return await User.findOne({ email });
};

export const verifyEmail = async (userId: string) => {
    return await User.findByIdAndUpdate(userId, { isEmailVerified: true }, { new: true });
};