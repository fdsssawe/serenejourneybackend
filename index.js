import express from 'express'
import cors from 'cors'
import  mongo, { version } from 'mongoose';
import * as OfferControllers from './controllers/OfferController.js'
import dotenv from "dotenv"
import cookieParser from 'cookie-parser';
import { router } from './router/index.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js'
import bodyParser from 'body-parser';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerui from "swagger-ui-express"


dotenv.config()


const options = {
    withCredentials: true, // enable cookies
    definition : {
        openapi : '3.0.0',
        info : {
            title : "SereneJourney",
            version : "1.0.0",
        },
        components: {
            securitySchemas: {
              bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
              },
            },
          },
        servers : [
            {
                url : "http://localhost:5000/api/"
            }
        ]
    },
    apis: ["./router/index.js"],
    requestInterceptor: (req) => {
        console.log("fdfd")
        const cookies = document.cookie
        req.headers = {
          ...req.headers,
          'Cookie': cookies
        };
        return req;
    },
}

const swaggerSpec = swaggerJSDoc(options)

mongo.connect(process.env.MONGO_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology : true,
    }).then(()=>{
    console.log("db ok");
}).catch((err)=>console.log(err))

mongo.set('strictQuery', true);

const app = express();
app.use('/uploads', express.static('uploads'));

app.use(cors({
    credentials : true,
    origin : "http://localhost:3000"
}))

app.use(cookieParser())
app.use(errorMiddleware);
app.use(express.json({ limit: '50mb' }));
app.use('/api',router)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use('/api-docs', swaggerui.serve , swaggerui.setup(swaggerSpec))


app.listen(process.env.PORT, (err) => {
    if (err){
        return console.log(err);
    }

    console.log("Server ok");
})