import {
    GPU,
    IConstantsThis,
    IGPUKernelSettings,
    IKernelFunctionThis,
    IKernelMapRunShortcut,
    IKernelRunShortcut,
    Input,
    ISubKernelObject,
    KernelFunction,
    KernelOutput,
    OutputDimensions,
    Texture,
    ThreadFunction,
    ThreadKernelVariable,
  } from 'gpu.js';

export let gpuInstance: GPU | null = null;


export function makeKernel<
  ArgTypes extends ThreadKernelVariable[] = ThreadKernelVariable[],
  ConstantsTypes extends IConstantsThis = IConstantsThis
>(
  fn: KernelFunction<ArgTypes, ConstantsTypes>,
  settings: IGPUKernelSettings
): IKernelRunShortcut {
  let _gpuInstance: GPU = gpuInstance as GPU;
  
  if (_gpuInstance === null) {
    _gpuInstance = new GPU({ mode: 'gpu' });
     gpuInstance = _gpuInstance;
  }

  return _gpuInstance
    .createKernel<ArgTypes, ConstantsTypes>(fn, settings)
}

