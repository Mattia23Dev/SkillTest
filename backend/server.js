const express = require("express")
const app = express()
const cors = require("cors");
const path = require("path");
const multer = require("multer")
require("dotenv").config()

const db = require("./config/dbConfig")
const userRoute = require("./routes/userRoutes")
const examRoute = require("./routes/examRoutes")
const teamRoute = require("./routes/teamRoutes")
const reportRoute = require("./routes/reportRoutes")
const appRoute = require("./routes/appointmentRoute")
const candidateRoute = require("./routes/candidateRoutes")

const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use("/api/users",userRoute)
app.use("/api/exams",examRoute)
app.use("/api/reports",reportRoute)
app.use("/api/team",teamRoute)
app.use("/api/app",appRoute)
app.use("/api/candidate",candidateRoute)

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'images/')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
  });
  const upload = multer({ storage: storage });
app.post('/api/upload-image', upload.single('image'), (req, res) => {
    try {

      const imageUrl = `https://quizjobs-production.up.railway.app/${req.file.path}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error('Errore durante il caricamento dell\'immagine:', error);
      res.status(500).json({ error: 'Errore durante il caricamento dell\'immagine' });
    }
});

//app.use(express.urlencoded({ extended: true }))
const _dirname = path.resolve();
app.use(express.static(path.join(_dirname, "/frontend/build")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("*",(req,res)=>{
res.sendFile(path.join(_dirname, "/frontend/build/index.html"))
});

app.use((err, req, res, next)=>{
res.status(500).send({ message: err.message});
})



app.listen(port,()=>{
console.log(`Server is running on PORT: ${port}`)
})