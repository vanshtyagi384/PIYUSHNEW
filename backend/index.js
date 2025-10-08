import express from "express";
import "dotenv";
import dotenv from "dotenv";
import multer from "multer";

const app = express();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
   return  cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
     return cb(null, `${Date.now()}-${file.originalname}`)
  }
});

const upload = multer({ storage: storage })
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({extended: flase}));

app.get('/', (req,res)=>{
        res.status(200).json({
            message:'Piyush Tyagi'
        })
})

app.post("/upload", upload.single("ProfileImage"), (req,res)=>{
    console.log(req.body);
    console.log(res.file);
});

app.listen(process.env.Port,()=>{
    console.log(`App is running on ${process.env.Port}`);
})
