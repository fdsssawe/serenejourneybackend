import dotenv from "dotenv"
import { v2 as cloudinary } from "cloudinary"
import User from "../model/User.js"
import Post from "../model/Post.js"
import { createContainer , asValue } from "awilix"
import axios from "axios"

dotenv.config()

class PostService {

    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        })
    }

    async fetchPosts(setLoading, setAllPosts, setSortedPosts, isAuth, user){
        setLoading(true);
        try {
          if (isAuth && user) {
            if (user.postsSaved && user.postsSaved.length > 0) {
              const lastSavedPost = await axios.get(`https://inkfinder2.azurewebsites.net/api/post/${user.postsSaved[user.postsSaved.length-1]}`);
              const preference = lastSavedPost.data.prompt.split(',')[lastSavedPost.data.prompt.split(',').length - 1]?.trim();
              const response = await axios.post('https://inkfinder2.azurewebsites.net/api/posts', {preference}, {
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              if (response) {
                const result = await response.data;
                setSortedPosts(result.data);
                // console.log(setSortedPosts.mock.calls[0][0]);
              }
            }
            else{
              const response = await axios.post('https://inkfinder2.azurewebsites.net/api/posts', { preference: '' }, {
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              if (response) {
                const result = await response.data;
                setSortedPosts(result.data.reverse());
              }
            }
          } else {
            const response = await axios.post('/posts', { preference: '' }, {
              headers: {
                'Content-Type': 'application/json'
              }
            });
            if (response) {
              const result = await response.data;
              setAllPosts(result.data.reverse());
            }
          }
        } catch (err) {
          console.log(err);
        } finally {
          setLoading(false);
        }
    };

    async createPost(req, res) {
        try {
            const { name, prompt, photo, author } = req.body;
            const photoUrl = await cloudinary.uploader.upload(photo);

            const newPost = await Post.create({
                name,
                author,
                prompt,
                photo: photoUrl.url,
            })

            res.status(201).json({ success: true, data: newPost })
        }
        catch (error) {
            console.log(error)
            res.status(500).json({ success: false, message: error })
        }

    }

    async getPosts(preferences) {
        try {
            const posts = await Post.find({})
            const sortedPosts = posts.sort((a, b) => {
                if (a.prompt.includes(preferences) && !b.prompt.includes(preferences)) {
                  return -1; 
                } else if (!a.prompt.includes(preferences) && b.prompt.includes(preferences)) {
                  return 1; 
                } else if (posts.length % 2 === 1 && !a.prompt.includes(preferences) && !b.prompt.includes(preferences)) {
                  return -1; 
                } else {
                  return 0; 
                }
              })
            if (preferences || preferences!="None"){
                return { success: true, data: sortedPosts }
            } 
            return { success: true, data: posts }
        }
        catch (error) {
            console.log(error)
            return { success: false, message: error }
        }
    }

    async getPostById(id) {
        try {
            const post = await Post.findById(id)
            return post
        }
        catch (error) {
            console.log(error)
        }
    }

    async savePost(postId , userId){
        try{
            const post = await Post.findById(postId)
            const user = await User.findById(userId)
            if (user?.postsSaved.includes(post._id)) {
                const index = user?.postsSaved.indexOf(post._id);
                if (index > -1) {
                    user?.postsSaved.splice(index, 1);
                    user.save()
                }
                return { ans: "Post already saved" }
            }
            user.postsSaved.push(post)
            user.save()
            return user.postsSaved
        }
        catch (error) {
            console.log(error)
        }
    }

    async getSavedPosts(user) {
        try {
          const posts = await Promise.all(user.postsSaved.map(async (id) => {
            try {
              const post = await Post.findById(id);
              if (post) {
                return post;
              } else {
                const index = user.postsSaved.indexOf(id);
                if (index !== -1) {
                  user.postsSaved.splice(index, 1);
                }
                await user.save()
                console.log(`Post with ID ${id} does not exist.`);
                return null;
              }
            } catch (error) {
              console.error(`Error finding post with ID ${id}:`, error);
              return null;
            }
          }));
          console.log(posts)
          const validPosts = posts.filter((post) => post !== null);;
          return validPosts
        } catch (error) {
            console.log(error);
        }
    }

    getLog(){
      console.log("Fetch finished")
    }

}

const postServiceContainer = createContainer()

const postService = new PostService()

postServiceContainer.register({postService: asValue(postService)});



export default postServiceContainer