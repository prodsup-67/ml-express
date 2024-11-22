import cors from "cors";
import Debug from "debug";
import "dotenv/config";
import express from "express";
import fs from "fs";
import multer from "multer";
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

app.post("/upload", upload.single("test"), async function (req, res, next) {
  console.log("uploaded");
  readFile(req.file?.path ?? "").then((err, data) => {
    // get image file extension name
    // const extensionName = path.extname(imgPath);

    // convert image file to base64-encoded string
    const base64Image = Buffer.from(data, "binary").toString("base64");

    // combine all strings
    const base64ImageStr = `data:image/${extensionName.split(".").pop()};base64,${base64Image}`;
  });
});

// * Running app
app.listen(PORT, async () => {
  debug(`Listening on port ${PORT}: http://localhost:${PORT}`);
  console.log(`Listening on port ${PORT}: http://localhost:${PORT}`);
});
