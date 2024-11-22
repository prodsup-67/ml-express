import cors from "cors";
import Debug from "debug";
import "dotenv/config";
import express from "express";
import fs from "fs";
import multer from "multer";
import * as PImage from "pureimage";
import { Readable } from "stream";
import promisify from "util.promisify";

import { loadModel } from "./ml.js";
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

const bufferToStream = (binary: Buffer) => {
  const readableInstanceStream = new Readable({
    read() {
      this.push(binary);
      this.push(null);
    },
  });

  return readableInstanceStream;
};

app.post("/upload", upload.single("test"), async function (req, res, next) {
  console.log("uploaded");
  const contentType = req.file?.mimetype ?? "";
  const filePath = req.file?.path ?? "";
  readFile(filePath).then(async (buffer) => {
    // get image file extension name
    // const extensionName = path.extname(imgPath);

    // convert image file to base64-encoded string
    // const base64Image = Buffer.from(data, "binary").toString("base64");

    const stream = bufferToStream(buffer);
    let imageBitmap;

    if (/png/.test(contentType)) {
      imageBitmap = await PImage.decodePNGFromStream(stream);
    }

    if (/jpe?g/.test(contentType)) {
      imageBitmap = await PImage.decodeJPEGFromStream(stream);
    }
    console.log(imageBitmap);
    // combine all strings
    // const base64ImageStr = `data:image/${extensionName.split(".").pop()};base64,${base64Image}`;
  });
});

// * Running app
app.listen(PORT, async () => {
  debug(`Listening on port ${PORT}: http://localhost:${PORT}`);
  console.log(`Listening on port ${PORT}: http://localhost:${PORT}`);
});
