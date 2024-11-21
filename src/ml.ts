import tf from "@tensorflow/tfjs";

import { SERVER_URL } from "./utils/env";

async function loadModel() {
  try {
    // const modelURL = `${modelUrl}model.json`;
    // const response = await fetch(`${modelUrl}metadata.json`);
    // const body = await response.text();

    const modelURL = `${SERVER_URL}/static/model/model.json`;
    const body = "/static/model/metadata.json";
    const model = await tf.loadLayersModel(modelURL);
    // this.model.classes = JSON.parse(body).labels;
    // console.log('@@@', this.model)
  } catch (e) {
    console.error("[@sashido/teachablemachine-node] -", e);
  }
}

loadModel();
