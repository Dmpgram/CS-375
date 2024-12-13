import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import getStarfield from "./getStarfield.js";
import { getFresnelMat } from "./getFresnelMat.js";

// Declare global variables for meshes, lightning, and moon
let earthMesh, lightsMesh, cloudsMesh, glowMesh, lightning, moonMesh;

// Set up scene, camera, and renderer
const w = window.innerWidth;
const h = window.innerHeight;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

// Add OrbitControls for interaction
new OrbitControls(camera, renderer.domElement);

// Earth group setup
const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180; // Tilt the Earth's axis
scene.add(earthGroup);

// Add textures using TextureLoader
const loader = new THREE.TextureLoader();
const detail = 12;
const earthGeometry = new THREE.IcosahedronGeometry(1, detail);

// Surface material with textures
const earthMaterial = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/00_earthmap1k.jpg", () => {
    console.log("Earth surface texture loaded");
  }),
  bumpMap: loader.load("./textures/01_earthbump1k.jpg", () => {
    console.log("Earth bump texture loaded");
  }),
  bumpScale: 0.04,
});

// Create the Earth mesh and add to group
earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
earthGroup.add(earthMesh);

// Lights material for nighttime view
const lightsMat = new THREE.MeshBasicMaterial({
  map: loader.load("./textures/03_earthlights1k.jpg", () => {
    console.log("Nighttime lights texture loaded");
  }),
  blending: THREE.AdditiveBlending,
});
lightsMesh = new THREE.Mesh(earthGeometry, lightsMat);
earthGroup.add(lightsMesh);

// Clouds material
const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/04_earthcloudmap.jpg", () => {
    console.log("Clouds texture loaded");
  }),
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  alphaMap: loader.load("./textures/05_earthcloudmaptrans.jpg", () => {
    console.log("Cloud transparency texture loaded");
  }),
});
cloudsMesh = new THREE.Mesh(earthGeometry, cloudsMat);
cloudsMesh.scale.setScalar(1.003); // Slightly larger than Earth
earthGroup.add(cloudsMesh);

// Fresnel effect for atmospheric glow
const fresnelMat = getFresnelMat();
glowMesh = new THREE.Mesh(earthGeometry, fresnelMat);
glowMesh.scale.setScalar(1.01); // Slightly larger than clouds
earthGroup.add(glowMesh);

// Add a starfield
const stars = getStarfield({ numStars: 2000 });
scene.add(stars);

// Add directional light to simulate the Sun
const sunLight = new THREE.DirectionalLight(0xffffff);
sunLight.position.set(-10, 10, 10);
scene.add(sunLight);

// Add Lightning
const lightningColor = 0xffffaa; // Light yellow for lightning
lightning = new THREE.PointLight(lightningColor, 0, 10); // Initial intensity is 0 (off)
scene.add(lightning);

lightning.position.set(2, 5, -5); // Position above Earth

// Add a Moon
const moonGroup = new THREE.Group(); // Group for moon and orbit
scene.add(moonGroup);

const moonGeometry = new THREE.SphereGeometry(0.27, 32, 32); // Moon is ~1/4 size of Earth
const moonMaterial = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/02_earthspec1k.jpg"), // Reuse a texture for simplicity
});
moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
moonMesh.position.set(3, 0, 0); // Initial position of the Moon
moonGroup.add(moonMesh);

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Rotate the Earth, lights, and clouds
  earthMesh.rotation.y += 0.002;
  lightsMesh.rotation.y += 0.002;
  cloudsMesh.rotation.y += 0.0023;
  glowMesh.rotation.y += 0.002;

  // Simulate Moon's orbit
  moonGroup.rotation.y += 0.001; // Slow orbit around the Earth

  // Simulate lightning effect
  if (Math.random() < 0.02) { // Random chance for lightning strike
    lightning.intensity = Math.random() * 2 + 2; // Random brightness
    setTimeout(() => {
      lightning.intensity = 0; // Turn off lightning after a short flash
    }, 100); // Lightning duration in milliseconds
  }

  renderer.render(scene, camera);
}
animate();

// Handle window resizing
function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", handleWindowResize, false);
