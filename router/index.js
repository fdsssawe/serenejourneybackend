import { Router } from "express";
import userController from "../controllers/UserController.js";
import { body } from "express-validator";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import dalleService from "../services/DalleService.js";
import postServiceContainer from "../services/PostsService.js";
import postController from "../controllers/PostController.js";
export const router = new Router();

const postService = postServiceContainer.resolve("postService")

router.post("/registration", body('email').isEmail(), body('password').isLength({ min: 4, max: 30 }), userController.registration)
router.post("/adduser", body('email').isEmail(), body('password').isLength({ min: 4, max: 30 }), userController.addUser)
router.post("/login", userController.login)
router.post("/logout", userController.logout)
router.get("/activate/:link", userController.activate)
router.get("/refresh", userController.refresh)
router.get("/users", authMiddleware, userController.getUsers)
router.post("/deleteuser", userController.deleteUser)
router.post("/forgot-password", userController.forgotPassword)
router.get("/reset-password/:id/:token", userController.resetPassword)
router.post("/reset-password-change/:id/:token", userController.resetPasswordPost)
router.post("/changePassword", authMiddleware, userController.changePassword)
router.post("/update-profile", authMiddleware, userController.updateProfile)


router.post("/isuser" , userController.getUser)