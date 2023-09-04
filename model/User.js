import  mongoose from 'mongoose';
import Post from "./Post.js"

const UserSchema = new mongoose.Schema({
    email:{
        type : String,
        required: true,
        unique : true,
    },
    name:{
        type : String,
        required: true,
    },
    surname:{
        type : String,
        required: true,
    },
    password:{
        type : String,
        required: true,
        min : 4,
        max : 20,
    },
    isActivated: {
        type: Boolean,
        default : false,
    },
    activationLink: {
        type: String,
    },
} , {
    timestamps: true,
})

export default mongoose.model("User",UserSchema);