import "dotenv/config";
import cors from "cors";
import debug from "debug";
import express from "express";
import multer from "multer";

import { loadModel, predict, readImageEncoded, readImageFile } from "./ml.js";
import { PORT } from "./utils/env.js";

const logger = debug("myapp");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors({ origin: false }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
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

app.post("/upload_base64", async (req, res, next) => {
  const { model, classes } = await loadModel();
  const imageEncoded = req.body.imageEncoded ?? "";
  const imageBitmap = await readImageEncoded(imageEncoded);
  const predictions = await predict(imageBitmap, model, classes);
  logger(predictions);
  res.json({ predictions });
});

// * Running app
app.listen(PORT, async () => {
  logger(`Listening on port ${PORT}: http://localhost:${PORT}`);
});
