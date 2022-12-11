import {
    WebGLRenderer,
    Scene,
    OrthographicCamera,
    ShaderMaterial,
    LinearFilter,
    WebGLRenderTarget,
    PlaneGeometry,
    RGBAFormat,
    Mesh,
    Texture,
} from 'three';

type Options = {
    width?: number;
    height?: number;
};

export class MixedTexture {
    renderer: WebGLRenderer;

    renderTarget: WebGLRenderTarget;

    interpolateMesh: Mesh<PlaneGeometry, ShaderMaterial>;

    camera: OrthographicCamera;
    scene: Scene;

    constructor(
        renderer: WebGLRenderer,
        texture1: Texture,
        texture2: Texture,
        weight: number = 0,
        options: Options = {},
    ) {
        this.renderer = renderer;

        const width = options.width ?? 1024;
        const height = options.height ?? 1024;

        this.renderTarget = new WebGLRenderTarget(width, height, {
            magFilter: LinearFilter,
            minFilter: LinearFilter,
            format: RGBAFormat,
        });

        this.scene = new Scene();
        this.camera = new OrthographicCamera(
            width / -2,
            width / 2,
            height / 2,
            height / -2,
            0,
        );

        this.interpolateMesh = new Mesh(
            new PlaneGeometry(width, height),
            new ShaderMaterial({
                uniforms: {
                    texture1: {
                        value: texture1,
                    },
                    texture2: {
                        value: texture2,
                    },
                    weight: {
                        value: weight,
                    },
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                    }
                `,
                fragmentShader: `
                    uniform sampler2D texture1;
                    uniform sampler2D texture2;
                    uniform float weight;
                    varying vec2 vUv;
    
                    void main() {
                        vec4 tex1 = texture2D( texture1, vUv );
                        vec4 tex2 = texture2D( texture2, vUv );
                        gl_FragColor = mix(tex1, tex2, weight);
                    }
                `,
            }),
        );

        this.scene = new Scene();
        this.scene.add(this.interpolateMesh);
    }

    getRenderedTexture() {
        return this.renderTarget.texture;
    }

    setTextures(texture1: Texture, texture2: Texture) {
        this.interpolateMesh.material.uniforms.texture1.value = texture1;
        this.interpolateMesh.material.uniforms.texture2.value = texture2;
    }

    setWeight(weight: number) {
        this.interpolateMesh.material.uniforms.weight.value = weight;
    }

    render() {
        // render current vertices
        this.renderer.setRenderTarget(this.renderTarget);
        this.renderer.render(this.scene, this.camera);
        this.renderer.setRenderTarget(null);
    }
}
