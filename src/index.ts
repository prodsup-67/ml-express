import cors from "cors";
import Debug from "debug";
import "dotenv/config";
import express from "express";
import fs from "fs";
import multer from "multer";
import promisify from "util.promisify";

import { loadModel, predict, readImageFile } from "./ml.js";
import { NODE_ENV, PORT } from "./utils/env.js";

const debug = Debug("myapp");

const app = express();
const upload = multer({ dest: "uploads/" });
const readFile = promisify(fs.readFile);

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

app.post("/upload", upload.single("test"), async (req, res, next) => {
  const { model, classes } = await loadModel();
  const contentType = req.file?.mimetype ?? "";
  const filePath = req.file?.path ?? "";
  const imageBitmap = await readImageFile(filePath, contentType);
  const predictions = await predict(imageBitmap, model, classes);
  res.json({ predictions });
});

// * Running app
app.listen(PORT, async () => {
  debug(`Listening on port ${PORT}: http://localhost:${PORT}`);
  console.log(`Listening on port ${PORT}: http://localhost:${PORT}`);
});
