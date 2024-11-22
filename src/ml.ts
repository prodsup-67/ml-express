import tf from "@tensorflow/tfjs";
import "dotenv/config";
import fs from "fs";
// @ts-ignore
import * as PImage from "pureimage";
import sharp from "sharp";
import { Readable } from "stream";
import promisify from "util.promisify";

import { SERVER_URL } from "./utils/env";

const readFile = promisify(fs.readFile);

export async function loadModel() {
  const modelURL = `${SERVER_URL}/static/model/model.json`;
  const metaDataURL = `${SERVER_URL}/static/model/metadata.json`;
  const model = await tf.loadLayersModel(modelURL);
  const jsonData = (await fetch(metaDataURL).then((res) => res.json())) as any;
  const classes = jsonData.labels as string[];
  return { model, classes };
}

export const bufferToStream = (binary: Buffer) => {
  const readableInstanceStream = new Readable({
    read() {
      this.push(binary);
      this.push(null);
    },
  });

  return readableInstanceStream;
};

export async function readImageFile(filePath: string, contentType: string) {
  let buffer = await readFile(filePath);
  let bufferPNG = await sharp(buffer).toFormat("png").toBuffer();
  const stream = bufferToStream(bufferPNG);
  const imageBitmap = await PImage.decodePNGFromStream(stream);
  return imageBitmap;
}

export const predict = async (
  imageBitmap: any,
  model: any,
  classes: string[]
) => {
  const logits = tf.tidy(() => {
    // tf.browser.fromPixels() returns a Tensor from an image element.
    let img = tf.browser.fromPixels(imageBitmap).toFloat();
    img = tf.image.resizeNearestNeighbor(img, [
      model.inputs[0].shape[1],
      model.inputs[0].shape[2],
    ]);

    const offset = tf.scalar(127.5);
    // Normalize the image from [0, 255] to [-1, 1].
    const normalized = img.sub(offset).div(offset);

    // Reshape to a single-element batch so we can pass it to predict.
    const batched = normalized.reshape([
      1,
      model.inputs[0].shape[1],
      model.inputs[0].shape[2],
      model.inputs[0].shape[3],
    ]);

    return model.predict(batched);
  });

  const predictions = await getTopKClasses(logits, classes);

  return predictions;
};

const getTopKClasses = async (logits: any, classes: string[]) => {
  const values = await logits.data();
  const topK = Math.min(classes.length, values.length);

  const valuesAndIndices = [];
  for (let i = 0; i < values.length; i++) {
    valuesAndIndices.push({ value: values[i], index: i });
  }

  valuesAndIndices.sort((a, b) => {
    return b.value - a.value;
  });

  const topkValues = new Float32Array(topK);
  const topkIndices = new Int32Array(topK);
  for (let i = 0; i < topK; i++) {
    topkValues[i] = valuesAndIndices[i].value;
    topkIndices[i] = valuesAndIndices[i].index;
  }

  const topClassesAndProbs = [];
  for (let i = 0; i < topkIndices.length; i++) {
    topClassesAndProbs.push({
      class: classes[topkIndices[i]],
      score: topkValues[i],
    });
  }
  return topClassesAndProbs;
};
