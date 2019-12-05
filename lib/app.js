import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import router from "./app/router";

const app = express();

app.use(cors()); // CORS middleware
app.use(bodyParser.json()); // Enable json body
app.use(bodyParser.urlencoded({ extended: true })); // Enable html form data body

app.use(`/api/${process.env.VERSION || 'v1'}`, router);

app.all('*', (req, res) => {
    res.status(404).json({ status: false, code: 404 });
});

app.listen(process.env.PORT, ()=>{
    console.log(`Service is running on port ${process.env.PORT}`);
});