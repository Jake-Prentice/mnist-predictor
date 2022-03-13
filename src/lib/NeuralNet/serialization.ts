

export type SerializableConstructor<T extends Serializable> = {
    new (...args: any[]): T; 
    fromConfig: FromConfigMethod<T>;
};

  export declare type FromConfigMethod<T extends Serializable> =
    (cls: SerializableConstructor<T>, config: object) => T;


export abstract class Serializable {
    abstract readonly className: string;

    getConfig(): object | undefined {
        return undefined;
    };

    static fromConfig<T extends Serializable>(
        cls: SerializableConstructor<T>, config: object): T {
        return new cls(config);
    }
}


export const arrayBufferToBase64String = (buffer: ArrayBuffer): string => {
    const buf = new Uint8Array(buffer);
    let s = '';
    for (let i = 0, l = buf.length; i < l; i++) {
      s += String.fromCharCode(buf[i]);
    }
    return btoa(s);
  }

export const base64StringToArrayBuffer = (str: string): ArrayBuffer => {
    const s = atob(str);
    const buffer = new Uint8Array(s.length);
    for (let i = 0; i < s.length; ++i) {
        buffer.set([s.charCodeAt(i)], i);
    }
    return buffer.buffer;
}

export const wrapSerializable = (serializable: Serializable): WrappedSerializable => {
    return  {
        className: serializable.className,
        config: serializable.getConfig()
    }
}

export interface ClassNameToClassDict<T extends Serializable> {
    [key: string]: SerializableConstructor<T>
}

export interface WrappedSerializable {
    className: string;
    config: object | undefined;
}
    
export const deserialize = <T extends Serializable>(
    wrappedSerializable: WrappedSerializable, 
    classDict: ClassNameToClassDict<T>,
    classDictName: string="classDict"
) => {
    let {config, className} = wrappedSerializable;

    className = className.toLowerCase();
    if (!(className in classDict)) {
        throw new Error(`cannot find className: ${className} in classDict: ${classDictName}`);
    }

    const cls = classDict[className];
    return cls.fromConfig(cls, config || {})

}

 