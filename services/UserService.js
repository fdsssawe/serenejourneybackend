import User from "../model/User.js"
import bcrypt from "bcrypt"
import { v4 } from "uuid"
import tokenServiceContainer from "./TokenService.js"
import UserDto from "../dtos/userDTO.js"
import * as dotenv from "dotenv"
import { ApiError } from "../exceptions/apiError.js"
import Post from "../model/Post.js"
import mongoose from "mongoose"
import mailServiceContainer from "./MailService.js"
import { createContainer , asValue } from "awilix"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"

dotenv.config()



class UserService{
    async registration (email, name, surname, password){
        const candidate = await User.findOne({email})
        if (candidate){
            throw ApiError.BadRequests(`There is account with such email : ${email}`)
        }
        const hashPassword = await bcrypt.hash(password,3);
        const activationLink = v4()
        const user = await User.create({email, name, surname, password : hashPassword , activationLink})
        // await mailServiceContainer.resolve("mailService").createMail("activation",email,`${process.env.API_URL}/api/activate/${activationLink}`)
        const userDTO = new UserDto(user)
        const tokens = tokenServiceContainer.resolve("tokenService").generateTokens({...userDTO})
        await tokenServiceContainer.resolve("tokenService").saveToken(userDTO.id, tokens.refreshToken)

        return{...tokens, user : userDTO}
    }

    async addUser (email, name, surname, password){
        const candidate = await User.findOne({email})
        if (candidate){
            throw ApiError.BadRequests(`There is account with such email : ${email}`)
        }
        const hashPassword = await bcrypt.hash(password,3);
        const activationLink = v4()
        const user = await User.create({email, name, surname, password : hashPassword , activationLink})
        const userDTO = new UserDto(user)

        return{user : userDTO}
    }

    async activate(activationLink){
        const user = await User.findOne({activationLink})
        if(!user){
            throw ApiError.BadRequests("Incorrect activation link")
        }
        user.isActivated = true
        await user.save()
    }

    async login(email , password){ 
        const user = await User.findOne({email})
        if(!user){
            throw ApiError.BadRequests('User not found')
        }
        const isPassEquels = await bcrypt.compare(password , user.password)
        if (!isPassEquels){
            throw ApiError.BadRequests('Wrong password or email')
        }
        const userDTO = new UserDto(user);
        const tokens = tokenServiceContainer.resolve("tokenService").generateTokens({...userDTO})
        await tokenServiceContainer.resolve("tokenService").saveToken(userDTO.id, tokens.refreshToken)

        return{...tokens, user : userDTO}
    }

    async logout(refreshToken){
        const token = await tokenServiceContainer.resolve("tokenService").removeToken(refreshToken)
        return token
    }

    async refresh(refreshToken){
        if (!refreshToken){
            throw ApiError.UnathorizedError()
        }
        const userData = tokenServiceContainer.resolve("tokenService").validateRefreshToken(refreshToken)
        const tokeFromDb = await tokenServiceContainer.resolve("tokenService").findToken(refreshToken)
        if (!userData || !tokeFromDb){
            throw ApiError.UnathorizedError()
        }

        const user = await User.findById(userData.id)
        const userDTO = new UserDto(user);
        const tokens = tokenServiceContainer.resolve("tokenService").generateTokens({...userDTO})
        await tokenServiceContainer.resolve("tokenService").saveToken(userDTO.id, tokens.refreshToken)

        return{...tokens, user : userDTO}
    }


    async getAllUsers() {
        const users = await User.find();
        return users;
    }

    async isUser(email) {
        const user = await User.find({email : email});
        if(user.length>0){
            return true
        }
        else{
            return false
        }
    }

    async deleteUser(id) {
        const user = await User.findById(id);
        await User.findByIdAndDelete(id);
        return user
    }

    async changePassword(id, password) {
        const user = await User.findById(id);
        const hashPassword = await bcrypt.hash(password, 3);
        user.password = hashPassword
        user.save()
        
        return user
    }

    async updateProfile(id, name, surname) {
        const user = await User.findById(id);
        user.name = name
        user.surname = surname
        user.save()
        
        return user
    }

    async forgotPassword(email) {
        const user = await User.findOne({ email });
        if (!user) {
            throw ApiError.BadRequest('User not found');
        }
        
        const secret = process.env.JWT_SECRET + user.password;
        const payload = {
            email: user.email,
            id: user._id
        };

        const token = jwt.sign(payload, secret, { expiresIn: '15m' });

        const link = `http://localhost:3000/login/reset-password/${user._id}/${token}`;

        await mailServiceContainer.resolve("mailService").sendResetPasswordMail(email, link);
    }

    async changeEmail(email) {
        const user = await User.findOne({ email });
        if (!user) {
            throw ApiError.BadRequest('User not found');
        }
        
        const secret = process.env.JWT_SECRET + user.password;
        const payload = {
            email: user.email,
            id: user._id
        };

        const token = jwt.sign(payload, secret, { expiresIn: '15m' });

        const link = `http://localhost:3000/login/change-email/${user._id}/${token}`;

        await mailServiceContainer.resolve("mailService").sendChangeEmailMail(email, link);
    }

    async changeEmailConfirm(id, email) {
        const user = await User.findById(id);
        user.email = email
        user.save()
        
        return user
    }
    
}

class UserServiceWithLogging extends UserService {
    async changePassword(id, password) {
        console.log(`Changing password for user with id ${id}`);
        const result = await super.changePassword(id, password);
        console.log(`Password changed for user with id ${id}`);
        return result;
    }

    async updateProfile(id, name, surname) {
        console.log(`Updating profile for user with id ${id}`);
        const result = await super.updateProfile(id, name, surname);
        console.log(`Profile updated for user with id ${id}`);
        return result;
    }
}

const userService = new UserService()


const userServiceContainer = createContainer()

userServiceContainer.register({userService: asValue(userService)});

export default userServiceContainer