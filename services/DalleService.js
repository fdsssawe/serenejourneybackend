import axios from "axios"
import * as dotenv from "dotenv"
import { Configuration, OpenAIApi } from "openai"
import fs from "fs"

dotenv.config()

class DalleService{

    constructor(){

    }

    async getGeneratedImage(req,res){
        try{

            const {prompt} = req.body
            const correctPrompt = prompt.replace(" ","%20")
            await axios.get(`https://image.pollinations.ai/prompt/${correctPrompt}%20tattoo?width=1024&height=1024`, { responseType: 'arraybuffer' })
            .then(response => {
                const imageBuffer = Buffer.from(response.data, 'binary');
                const base64Image = imageBuffer.toString('base64');
                res.status(200).json({photo : base64Image});
              })
        }
        catch(e){
            console.log(e)
            res.status(500).send("Author runed out of DALL-E credits")
        }
    }
}

const dalleService = new DalleService()

export default dalleService