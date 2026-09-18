import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import { connectDB } from './config/db.js';
import {router} from './routes/todo.routes.js'
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "https://todolist-rho-ivory.vercel.app/",
  credentials: true
}))
app.use(express.json())

app.use('/api/v1/todos',router)

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};
 
startServer()