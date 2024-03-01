import userService from "../services/UserService.js"
import * as dotenv from "dotenv"
import { validationResult } from "express-validator"
import { ApiError } from "../exceptions/apiError.js"
import User from "../model/User.js"
import userServiceContainer from "../services/UserService.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

dotenv.config()

class UserController {
  async registration(req,res,next){
    try{
      const errors = validationResult(req)
      if(!errors.isEmpty()){
        return next(ApiError.BadRequests('Validation error , make sure your email is correct', errors.array())) 
      }
      const {email, name, surname, password} = req.body
      const userData = await userServiceContainer.resolve("userService").registration(email, name, surname, password)
      res.cookie('refreshToken',userData.refreshToken, {maxAge: 30*24*60*1000 , httpOnly : true})
      return res.json(userData)
    }catch(e){
      next(e);
    }
  }

  async addUser(req,res,next){
    try{
      const errors = validationResult(req)
      if(!errors.isEmpty()){
        return next(ApiError.BadRequests('Validation error , make sure your email is correct', errors.array())) 
      }
      const {email, name, surname, password} = req.body
      const userData = await userServiceContainer.resolve("userService").addUser(email, name, surname, password)
      return res.json(userData)
    }catch(e){
      next(e);
    }
  }

  async login(req,res,next){
        try {
            const {email, password} = req.body;
            const userData = await userServiceContainer.resolve("userService").login(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            next(e);
        }
  }

  async logout(req,res,next){
    try{
      const {refreshToken} = req.cookies
      const token = await userServiceContainer.resolve("userService").logout(refreshToken)
      res.clearCookie('refreshToken')
      return res.json(token)
    }catch(e){
      next(e);
    }
  }

  async activate(req,res,next){
    try{
      const activationLink = req.params.link
      await userServiceContainer.resolve("userService").activate(activationLink)
      return res.redirect(process.env.CLIENT_URL)
    }catch(e){
      next(e);
    }
  }

  async refresh(req,res,next){
    try{
      const {refreshToken} = req.cookies
      const userData = await userServiceContainer.resolve("userService").refresh(refreshToken);
      res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
      return res.json(userData);
    }catch(e){
      next(e);
    }
  }

  async getUsers(req, res, next) {
    try {
        const users = await userServiceContainer.resolve("userService").getAllUsers();
        return res.json(users);
    } catch (e) {
        next(e);
    }
}

async getUser(req, res, next) {
  try {
      const {email} = req.body
      const isUser = await userServiceContainer.resolve("userService").isUser(email);
      return res.json(isUser);
  } catch (e) {
      next(e);
  }
}

async deleteUser(req, res, next) {
  try {
      const {id} = req.body
      const user = await userServiceContainer.resolve("userService").deleteUser(id);
      return res.json(user.email + " deleted");
  } catch (e) {
      next(e);
  }
}

async forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const result = await userServiceContainer.resolve("userService").forgotPassword(email);
    return res.json(result);
  } catch (e) {
    next(e);
  }
}



async resetPassword(req,res,next) {
  try {

    const { id, token } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.json("User not found");
    }
    
    const secret = process.env.JWT_SECRET + user.password;

    try {
        const payload = jwt.verify(token, secret);
        return res.json(true)
    }
    catch (e) {
      return res.json("Token is not valid or expired");
    }

  } catch (e) {
    next(e);
  }

}

async resetPasswordPost(req, res, next) {
  try {
    const {password, cpassword} = req.body
    const { id, token } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.json("User not found");
    }
    
    const secret = process.env.JWT_SECRET + user.password;

    try {
        const payload = jwt.verify(token, secret);
        if(password === cpassword){
          user.password = await bcrypt.hash(password,3)
          user.save()
          return res.json("Password changed")
        }
        else{
          return res.json("Passwords do not match")
        }
        
    }
    catch (e) {
      return res.json("Token is not valid or expired");
    }

  } catch (e) {
    next(e);
  }

}

}

const userController = new UserController()

export default userController

