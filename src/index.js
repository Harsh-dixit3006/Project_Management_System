import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config();

import app from "./app.js";

const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Hi we are listening at http://localhost:${port}`);
    });
  })

  .catch((err) => {
    console.error("MongoDb error :", err);
  });

/*isme sabse pahle  db , app, aur dotenv ko import kar lenge phir app.port se port bna lenge
phir ConnectDb ko call karke "then, Catch function ka use kareneg jisme then ke andar app.listen
ka use karke check karenge MongoDb connect hua ya nhi */ 