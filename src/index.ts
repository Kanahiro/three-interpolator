import type { WebGLRenderer, Texture } from 'three';
import { MixedTexture } from './mixedTexture';

type Options = {
    width?: number;
    height?: number;
};

/**
 * convert 0-1 to normalized-weighgt between textures
 * ex) 4-tex, splitted 0-1 to 3-part => (0-0.33, 0.33-0.66, 0.66-1)
 * weight=0.2 -> part1, normalized-weight is 0.6 (normalize to 0-1 between part1)
 * @param length
 * @param weight
 * @returns
 */
const calcWeight = (length: number, weight: number) => {
    // calc length between 2-textures
    // ex)2-textures -> length is 1.0
    // ex)3-textures -> length is 0.5
    // ex)4-textures -> length is 0.33...
    const partLength = 1 / (length - 1);
    const currentPart = Math.floor(weight / partLength);

    // normalized 0-1 value across all textures to between a certain 2-textures value
    // ex)3-textures, parts=[0.0-0.5, 0.5-1]: 0.3 -> 0.6 in part1
    const scale = 1 / partLength;
    const normalizedValue = weight - currentPart * partLength;
    const normalizedWeight = normalizedValue * scale;

    return { currentPart, normalizedWeight };
};

export class Interpolator {
    private mixedTexture: MixedTexture;
    private textures: Texture[];

    constructor(
        renderer: WebGLRenderer,
        textures: Texture[],
        weight: number = 0,
        options: Options = {},
    ) {
        this.textures = textures;

        const width = options.width ?? 1024;
        const height = options.height ?? 1024;

        if (textures.length < 2) {
            throw Error();
        }

        this.mixedTexture = new MixedTexture(
            renderer,
            textures[0],
            textures[1],
            0,
            { width, height },
        );

        this.setWeight(weight);
    }

    getTexture() {
        return this.mixedTexture.getRenderedTexture();
    }

    setWeight(weight: number) {
        const { currentPart, normalizedWeight } = calcWeight(
            this.textures.length,
            weight,
        );

        this.mixedTexture.setTextures(
            this.textures[currentPart],
            this.textures[currentPart + 1],
        );

        this.mixedTexture.setWeight(normalizedWeight);
    }

    render() {
        this.mixedTexture.render();
    }
}
