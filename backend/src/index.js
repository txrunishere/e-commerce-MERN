import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import { connectDB } from "./db/index.db.js";
const PORT = process.env.PORT || 8080;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`App is listening on PORT: ${PORT}`);
    });
  })
  .catch((e) => {
    console.log("DB Error", e);
  });
