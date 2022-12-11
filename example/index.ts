import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { Interpolator } from '../src/index';

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 500;

const threeObject = {
    scene: new THREE.Scene(),
    renderer: new THREE.WebGLRenderer({ alpha: true, antialias: true }),
    camera: new THREE.OrthographicCamera(
        -VIEW_WIDTH * 0.5,
        VIEW_WIDTH * 0.5,
        VIEW_HEIGHT * 0.5,
        -VIEW_HEIGHT * 0.5,
        -1000,
        1000,
    ),
};
threeObject.camera.position.z = 1;

//const controls = new OrbitControls(threeObject.camera, document.body);

document.querySelector('#three')!.appendChild(threeObject.renderer.domElement);
threeObject.renderer.setSize(VIEW_WIDTH, VIEW_HEIGHT);

const velocityTexture = new THREE.TextureLoader().load('./wind.png');
velocityTexture.magFilter = THREE.NearestFilter;
velocityTexture.minFilter = THREE.NearestFilter;
const velocityTexture2 = new THREE.TextureLoader().load('./wind2.png');
velocityTexture2.magFilter = THREE.NearestFilter;
velocityTexture2.minFilter = THREE.NearestFilter;

const interpolator = new Interpolator(threeObject.renderer, [
    velocityTexture,
    velocityTexture2,
]);

const viewMaterial = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    uniforms: {
        backgroundTexture: {
            value: interpolator.getTexture(),
        },
    },
    vertexShader: `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position =  projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    fragmentShader: `
        uniform sampler2D backgroundTexture;
        varying vec2 vUv;
        void main() {
            vec4 backgroundColor = texture2D(backgroundTexture, vUv);
            gl_FragColor = backgroundColor;
        }
    `,
});
const view = new THREE.Mesh(
    new THREE.PlaneGeometry(VIEW_WIDTH, VIEW_HEIGHT),
    viewMaterial,
);
threeObject.scene.add(view);

document.getElementById('transition')!.onclick = () => {
    if (
        document.getElementById('transition')!.innerText === 'stop transition'
    ) {
        document.getElementById('transition')!.innerText = 'start transition';
    } else {
        document.getElementById('transition')!.innerText = 'stop transition';
    }
};

let counter = 0;
const animate = () => {
    if (
        document.getElementById('transition')!.innerText === 'stop transition'
    ) {
        interpolator.setWeight((1 + Math.sin(counter * 0.05)) * 0.5);
        counter++;
    }
    interpolator.render();

    threeObject.renderer.render(threeObject.scene, threeObject.camera);
    requestAnimationFrame(animate);
};
animate();
