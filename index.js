import express from "express";
import dotenv from "dotenv";
import ApiRouter from "./routes/Api.js";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use('/api', ApiRouter);
app.use('/', ApiRouter); // добавлено для редиректа по короткой ссылке

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


