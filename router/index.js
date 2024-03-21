import { Router } from "express";
import userController from "../controllers/UserController.js";
import { body } from "express-validator";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import dalleService from "../services/DalleService.js";
import postServiceContainer from "../services/PostsService.js";
import * as BlogController from "../controllers/BlogController.js";
import multer from 'multer';
import { postCreateValidation } from "../lib/validations.js";
import { default as handleValidationErrors } from "../lib/handleValidationErrors.js";
import fs from 'fs';

export const router = new Router();

const postService = postServiceContainer.resolve("postService")

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
      if (!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads');
      }
      cb(null, 'uploads');
    },
    filename: (_, file, cb) => {
      cb(null, file.originalname);
    },
  });
  

export const upload = multer({ storage });


//user routes
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
router.post("/change-email-request", authMiddleware, userController.changeEmail)

//blog routes
router.post('/upload', authMiddleware, upload.single('image'), (req, res) => {
    res.json({
      url: `/uploads/${req.file.originalname}`,
    });
  });
  
  router.get('/tags', BlogController.getLastTags);
  
  router.get('/posts', BlogController.getAll);
  router.get('/posts/tags', BlogController.getLastTags);
  router.get('/posts/:id', BlogController.getOne);
  router.post('/posts', authMiddleware, postCreateValidation, handleValidationErrors, BlogController.create);
  router.delete('/posts/:id', authMiddleware, BlogController.remove);
  router.patch(
    '/posts/:id',
    authMiddleware,
    postCreateValidation,
    handleValidationErrors,
    BlogController.update,
  );


router.post("/isuser" , userController.getUser)