import cors from "cors";
import Debug from "debug";
import "dotenv/config";
import express from "express";

import { loadModel } from "./ml.js";
import { NODE_ENV, PORT } from "./utils/env.js";

const debug = Debug("myapp");
const app = express();
app.use(cors({ origin: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/static", express.static("public"));

app.get("/", (req, res) => {
  res.json({ hello: "world" });
});

app.get("/load", async (req, res) => {
  const model = await loadModel();
  res.json({ model });
});

// * Running app
app.listen(PORT, async () => {
  debug(`Listening on port ${PORT}: http://localhost:${PORT}`);
  console.log(`Listening on port ${PORT}: http://localhost:${PORT}`);
});
