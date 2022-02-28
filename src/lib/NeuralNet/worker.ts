
import * as comlink from "comlink";
import { IModelTopology, IModelWeightData, ITrain, Model } from "./index";

const trainOnWorker = (
    params: ITrain, 
    onTrainingStep: ITrain["onTrainingStep"],
    modelTopology: IModelTopology, 
    weights: IModelWeightData 
) => {
    const nn = new Model();
    nn.loadModelTopology(modelTopology);
    nn.loadEncodedWeights(weights);

    nn.train({...params, onTrainingStep});
    return nn.getEncodedWeightsAndConfig();
}

const exports = {
    trainOnWorker
}

export type exportsType = typeof exports;

comlink.expose(exports);
