import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/Addons.js';
import { Easing, Tween, update as updateTween } from 'tween';

const images = [
  'guernica.jpg',
  'starry-night.jpg',
  'hollywood.jpg',
  'impression.jpg',
  'venus.jpg',
  'silence-fear.png'
];

const titles = [
  'Guernica (1937)',
  'Starry Night (1889)',
  'Hollywood Africans (1983)',
  'Impression, Soleil Levant (1872)',
  'The Birth of Venus (1486)',
  'Silence = Fear (1989)'
];

const artists = [
  'Pablo Picasso',
  'Vincent Van Gogh',
  'Jean-Michel Basquiat',
  'Claude Monet',
  'Sandro Botticelli',
  'Keith Haring'
];

const textureLoader = new THREE.TextureLoader();

// Configuração do renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); // Suporte para telas de alta densidade
document.body.appendChild(renderer.domElement);

// Cena e câmera
const scene = new THREE.Scene();
scene.background = new THREE.Color('black'); // Fundo escuro para contraste

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 2; // Posicionar a câmera de forma que o objeto fique visível

const rootNode = new THREE.Object3D();
scene.add(rootNode);

const leftArrowTexture = textureLoader.load('left.png');
const rightArrowTexture = textureLoader.load('right.png');

const count = images.length;

for (let i = 0; i < count; i++) { 
  const baseNode = new THREE.Object3D();
  baseNode.rotation.y = i * (2 * Math.PI) / count;
  rootNode.add(baseNode);

  // Moldura da obra de arte
  const border = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 2.2, 0.09),
    new THREE.MeshStandardMaterial({ color: 0x303030 }) // Cor da moldura
  );
  border.name = `Border_${i}`;
  border.position.z = -4; // Alinha a moldura com a obra de arte
  baseNode.add(border);

  // Textura carregada dentro do loop
  const texture = textureLoader.load(images[i]);
  texture.colorSpace = THREE.SRGBColorSpace;

  // Objeto da obra de arte com textura
  const artwork = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2, 0.1),
    new THREE.MeshStandardMaterial({ map: texture })
  );
  artwork.name = `Art_${i}`;
  artwork.position.z = -4; // Mantido exatamente como estava
  baseNode.add(artwork);

  // Left Arrow
  const leftArrow = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 0.01),
    new THREE.MeshStandardMaterial({ 
      map: leftArrowTexture,
      transparent: true,
    })
  );
  leftArrow.name = `LeftArrow`;
  leftArrow.userData = (i + 1) % count;
  leftArrow.position.set(-1.8, 0, -4);
  baseNode.add(leftArrow);

  // Right Arrow
  const rightArrow = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 0.01),
    new THREE.MeshStandardMaterial({ 
      map: rightArrowTexture,
      transparent: true,
    })
  );
  rightArrow.name = `RightArrow`;
  rightArrow.userData = (i - 1 + count) % count;
  rightArrow.position.set(1.8, 0, -4);
  baseNode.add(rightArrow);
}

// Configuração da luz SpotLight
const spotlight = new THREE.SpotLight(0xffffff, 100, 10, 0.65, 1);
spotlight.position.set(0, 5, 0);
spotlight.target.position.set(0, 1, -5);
scene.add(spotlight);
scene.add(spotlight.target);

// Configuração do espelho
const mirror = new Reflector(
  new THREE.CircleGeometry(10), {
    color: 0x202020,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
  }
);
mirror.position.y = -1.1;
mirror.rotateX(-Math.PI / 2);
scene.add(mirror);

function rotateGallery(direction, newIndex) {
  const deltaY = direction * (2 * Math.PI / count);

  new Tween(rootNode.rotation)
    .to({ y: rootNode.rotation.y + deltaY })
    .easing(Easing.Quadratic.InOut)
    .start()
    .onStart(() => {
      document.getElementById('title').style.opacity = 0;
      document.getElementById('artist').style.opacity = 0;
    })
    .onComplete(() => {
      document.getElementById('title').innerText = titles[newIndex];
      document.getElementById('artist').innerText = artists[newIndex];
      document.getElementById('title').style.opacity = 1;
      document.getElementById('artist').style.opacity = 1;
    });
}

// Função de animação
function animate() {
  updateTween();
  renderer.render(scene, camera);
}

// Loop de animação
renderer.setAnimationLoop(animate);

// Ajuste da tela em caso de redimensionamento
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Eventos de interação (click e touchstart)
window.addEventListener('click', handleInteraction);
window.addEventListener('touchstart', handleInteraction);

function handleInteraction(event) {
  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2();

  if (event.type === 'click') {
    mouseNDC.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouseNDC.y = -(event.clientY / window.innerHeight) * 2 + 1;
  } else if (event.type === 'touchstart' && event.touches.length === 1) {
    mouseNDC.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouseNDC.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
  }

  raycaster.setFromCamera(mouseNDC, camera);

  const intersections = raycaster.intersectObject(rootNode, true);
  if (intersections.length > 0) {
    const obj = intersections[0].object;
    const newIndex = obj.userData;
    if (obj.name === 'LeftArrow') {
      rotateGallery(-1, newIndex);
    }
    if (obj.name === 'RightArrow') {
      rotateGallery(1, newIndex);
    }
  }
}

document.getElementById('title').innerText = titles[0];
document.getElementById('artist').innerText = artists[0];
