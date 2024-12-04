import "dotenv/config";
import cors from "cors";
import debug from "debug";
import express, { ErrorRequestHandler } from "express";
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

app.get("/load", async (req, res, next) => {
  try {
    const model = await loadModel();
    res.json({ model });
  } catch (err) {
    next(err);
  }
});

app.post("/upload", upload.single("img"), async (req, res, next) => {
  try {
    const { model, classes } = await loadModel();
    const contentType = req.file?.mimetype ?? "";
    const filePath = req.file?.path ?? "";
    const imageBitmap = await readImageFile(filePath, contentType);
    const predictions = await predict(imageBitmap, model, classes);
    res.json({ predictions });
  } catch (err) {
    next(err);
  }
});

app.post("/upload_base64", async (req, res, next) => {
  try {
    const { model, classes } = await loadModel();
    const imageEncoded = req.body.imageEncoded ?? "";
    const imageBitmap = await readImageEncoded(imageEncoded);
    const predictions = await predict(imageBitmap, model, classes);
    logger(predictions);
    res.json({ predictions });
  } catch (err) {
    next(err);
  }
});

// JSON Error Middleware
const jsonErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let serializedError = JSON.stringify(err, Object.getOwnPropertyNames(err));
  serializedError = serializedError.replace(/\/+/g, "/");
  serializedError = serializedError.replace(/\\+/g, "/");
  res.status(500).send({
    error: serializedError,
    predictions: [
      {
        class: "ERROR",
        score: 1,
      },
    ],
  });
};
app.use(jsonErrorHandler);

// Running app
app.listen(PORT, async () => {
  logger(`Listening on port ${PORT}: http://localhost:${PORT}`);
});
