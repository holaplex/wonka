import express from "express";
import cors from "cors";
import morgan from "morgan";

import { creatorRouter } from "./handlers/creator";
import { candyMachineRouter } from "./handlers/candy-machine";

const PORT = parseInt(process.env.PORT!, 10);

const app = express();

// Middleware
app.use(express.json());
app.use(morgan("combined"));
app.use(cors());

// Routes
app.use(creatorRouter);
app.use(candyMachineRouter);
app.use((_, res, next) => {
  res.status(404).json({
    message: "Not found",
  });
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
