
import * as comlink from "comlink";
import { IWeightConfig } from "./layers";
import { IModelTopology, ITrain, Model } from "./index";

const trainOnWorker = (
    params: ITrain, 
    onTrainingStep: ITrain["onTrainingStep"],
    modelTopology: IModelTopology, 
    {weightData, weightConfig}: {weightData: string, weightConfig: IWeightConfig[]} 
) => {
    const nn = new Model();
    nn.loadModelTopology(modelTopology);
    nn.loadWeightData({weightData, weightConfig});

    nn.train({...params, onTrainingStep});
    return nn.getWeightDataAndConfig();
}

const exports = {
    trainOnWorker
}

export type exportsType = typeof exports;

comlink.expose(exports);
