import express from "express"
import multer from "multer"
import dotenv from "dotenv"
import cors from "cors" 
import path from "path"
import mime from "mime-types"
const app = express()

dotenv.config()

app.use(cors());
const storage = multer.diskStorage({
        destination: (req, file, cb) => {
                cb(null, "uploads/")
              },
        filename: (req, file, cb) => {
               let original = file.originalname || "file"
    const ext = path.extname(original)
    if (!ext) {
      const guessed = mime.extension(file.mimetype)
      original = guessed ? `${original}.${guessed}` : original
    }
    cb(null, `${Date.now()+'--'}${original}`)
  },
})
    
 const uploadStorage = multer({ storage: storage })

app.post("/upload", uploadStorage.single("file"), (req, res) => {
console.log(req.file)
return res.send("Single file")
})

app.post("/upload/multiple", uploadStorage.array("file", 10), (req, res) => {
console.log(req.files)
return res.send("Multiple files")
})



app.listen(process.env.PORT || 3000,()=>{
    console.log(`App is running on ${process.env.PORT || 3000}`);
})
