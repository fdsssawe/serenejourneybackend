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
router.post("/login", userController.login)
router.post("/logout", userController.logout)
router.get("/activate/:link", userController.activate)
router.get("/refresh", userController.refresh)
router.get("/users", authMiddleware, userController.getUsers)
router.post("/dalle", authMiddleware, dalleService.getGeneratedImage)

/**
 * @swagger
 * /posts:
 *  post:
 *      summary: This api is used to get all posts
 *      description : This api is used to get all posts
 *      responses:
 *          200: 
 *             description: You will get posts
 */
router.post("/posts", postController.getPosts)
router.post("/newposts" , authMiddleware ,postService.createPost)

/**
 * @swagger
 * /user/{id}:
 *  get:
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *          minimum: 1
 *        description: The user ID
 *    responses:
 *        200: 
 *           description: You will get user info
 */

router.get("/user/:id"  , userController.getUsersPosts)

/**
 * @swagger
 * /post/{id}:
 *  get:
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *          minimum: 1
 *        description: The post ID
 *    responses:
 *        200: 
 *           description: You will get post info
 */

router.get("/post/:id"  , postController.getPostById)
router.post("/post/:id/save"  , postController.savePost)

/**
 * @swagger
 * /user/{id}/saved:
 *  get:
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *          minimum: 1
 *        description: The user ID
 *    responses:
 *        200: 
 *           description: You will get user`s saved posts
 */

router.get("/user/:id/saved"  , postController.getSavedPosts)
router.post("/isuser"  , userController.getUser)