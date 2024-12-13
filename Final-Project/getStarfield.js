import * as THREE from "three";

export default function getStarfield({ numStars = 500 } = {}) {
  // Function to generate random points on a sphere
  function randomSpherePoint() {
    const radius = Math.random() * 25 + 25; // Randomize starfield radius
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    return {
      pos: new THREE.Vector3(x, y, z),
      hue: 0.6, // Default hue for stars
      minDist: radius,
    };
  }

  // Create vertex and color arrays for the starfield
  const verts = [];
  const colors = [];
  const positions = [];
  let col;

  for (let i = 0; i < numStars; i += 1) {
    let p = randomSpherePoint();
    const { pos, hue } = p;
    positions.push(p);

    // Assign random colors to stars
    col = new THREE.Color().setHSL(hue, 0.2, Math.random());
    verts.push(pos.x, pos.y, pos.z);
    colors.push(col.r, col.g, col.b);
  }

  // Create the BufferGeometry and set attributes
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  // Load star texture for points material
  const mat = new THREE.PointsMaterial({
    size: 0.2,
    vertexColors: true,
    map: new THREE.TextureLoader().load(
      "./textures/stars/circle.png",
      () => {
        console.log("Star texture loaded successfully!");
      },
      undefined,
      (err) => {
        console.error("Error loading star texture:", err);
      }
    ),
  });

  // Create and return the Points object
  const points = new THREE.Points(geo, mat);
  return points;
}
