import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';

// Global variables for Hero Cake
let heroScene, heroCamera, heroRenderer, heroControls;
let heroCakeGroup;
let heroFlameMeshes = [];
let heroCandleLights = [];
let heroMouseX = 0, heroMouseY = 0;
let heroTargetRotationX = 0;

// Global variables for Cutting Cake
let cutScene, cutCamera, cutRenderer, cutControls;
let cutCakeGroup;
let leftHalfGroup, rightHalfGroup;
let cutFlameMeshes = [];
let cutCandleLights = [];
let knifeMesh;
let knifeMaterial;
let smokeParticles = [];
let smokeGeometry, smokeMaterial, smokePoints;

// 3D Crumb Physics Particles
const crumbParticles = [];
const CRUMB_COUNT = 45;

let isCakeCut = false;
let isCuttingActive = false;
let cutCallback = null;

// Initialize 3D Hero Cake
function initHeroCake() {
  const container = document.querySelector('.cake-container-3d');
  const canvas = document.getElementById('cake-canvas');
  if (!container || !canvas) return;

  heroScene = new THREE.Scene();
  heroScene.background = null;

  const width = container.clientWidth;
  const height = container.clientHeight;
  heroCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  heroCamera.position.set(0, 5, 12);

  heroRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  heroRenderer.setSize(width, height);
  heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  heroRenderer.shadowMap.enabled = true;
  heroRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

  heroControls = new OrbitControls(heroCamera, heroRenderer.domElement);
  heroControls.enableDamping = true;
  heroControls.dampingFactor = 0.05;
  heroControls.enableZoom = false;
  heroControls.minPolarAngle = Math.PI / 6;
  heroControls.maxPolarAngle = Math.PI / 2.1;

  buildHeroCake();
  setupHeroLighting();

  window.addEventListener('resize', onHeroResize);
  document.addEventListener('mousemove', onHeroMouseMove);
  window.addEventListener('scroll', onHeroScroll);

  animateHero();
}

// Initialize 3D Cutting Cake
function initCuttingCake() {
  const container = document.querySelector('.cutting-cake-container-3d');
  const canvas = document.getElementById('cutting-cake-canvas');
  if (!container || !canvas) return;

  cutScene = new THREE.Scene();
  cutScene.background = null;

  const width = container.clientWidth;
  const height = container.clientHeight;
  cutCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  cutCamera.position.set(0, 4.5, 10);

  cutRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  cutRenderer.setSize(width, height);
  cutRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  cutRenderer.shadowMap.enabled = true;
  cutRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  // Enable local clipping
  cutRenderer.localClippingEnabled = true;

  cutControls = new OrbitControls(cutCamera, cutRenderer.domElement);
  cutControls.enableDamping = true;
  cutControls.dampingFactor = 0.05;
  cutControls.enableZoom = false;
  cutControls.minPolarAngle = Math.PI / 6;
  cutControls.maxPolarAngle = Math.PI / 2.1;

  buildCuttingCake();
  setupCuttingLighting();
  setupSmokeSystem();
  setupCrumbsPool();

  window.addEventListener('resize', onCuttingResize);

  animateCutting();
}

// Build standard cake for Hero
function buildHeroCake() {
  heroCakeGroup = new THREE.Group();
  heroScene.add(heroCakeGroup);

  const pinkCreamMat = new THREE.MeshPhysicalMaterial({ color: 0xFFC0CB, roughness: 0.15, metalness: 0.05, clearcoat: 1.0 });
  const goldCreamMat = new THREE.MeshPhysicalMaterial({ color: 0xD4AF37, roughness: 0.1, metalness: 0.85, clearcoat: 1.0 });
  const whiteCreamMat = new THREE.MeshPhysicalMaterial({ color: 0xFFFDFC, roughness: 0.2, metalness: 0.02, clearcoat: 0.8 });
  const strawMat = new THREE.MeshPhysicalMaterial({ color: 0xE03C58, roughness: 0.3, clearcoat: 1.0 });

  // Cake Stand
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.8, 0.2, 64), goldCreamMat);
  stand.position.y = -2.0;
  stand.castShadow = true;
  stand.receiveShadow = true;
  heroCakeGroup.add(stand);

  // Tier 1 (Pink)
  const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 1.4, 64), pinkCreamMat);
  tier1.position.y = -1.2;
  tier1.castShadow = true;
  tier1.receiveShadow = true;
  heroCakeGroup.add(tier1);

  const ribbon1 = new THREE.Mesh(new THREE.TorusGeometry(2.82, 0.12, 16, 64), goldCreamMat);
  ribbon1.rotation.x = Math.PI / 2;
  ribbon1.position.y = -1.8;
  heroCakeGroup.add(ribbon1);

  // Tier 2 (White)
  const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 1.2, 64), whiteCreamMat);
  tier2.position.y = 0.1;
  tier2.castShadow = true;
  tier2.receiveShadow = true;
  heroCakeGroup.add(tier2);

  // Tier 2 Beads
  for (let i = 0; i < 36; i++) {
    const angle = (i / 36) * Math.PI * 2;
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), goldCreamMat);
    bead.position.set(Math.cos(angle) * 2.0, -0.45, Math.sin(angle) * 2.0);
    heroCakeGroup.add(bead);
  }

  // Tier 3 (Pink)
  const tier3 = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 1.0, 64), pinkCreamMat);
  tier3.position.y = 1.2;
  tier3.castShadow = true;
  tier3.receiveShadow = true;
  heroCakeGroup.add(tier3);

  // Strawberries
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const straw = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.32, 16), strawMat);
    straw.position.set(Math.cos(angle) * 1.6, 0.8, Math.sin(angle) * 1.6);
    straw.rotation.x = 0.2;
    straw.rotation.z = -angle;
    heroCakeGroup.add(straw);
  }

  // Candles (3 candles)
  const candleY = 1.7;
  const candlePositions = [
    new THREE.Vector3(0, candleY, 0.6),
    new THREE.Vector3(-0.5, candleY, -0.3),
    new THREE.Vector3(0.5, candleY, -0.3)
  ];

  const wickMat = new THREE.MeshBasicMaterial({ color: 0x4D3319 });
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xFFB84D, transparent: true, opacity: 0.95 });

  candlePositions.forEach((pos, idx) => {
    const candleGroup = new THREE.Group();
    candleGroup.position.copy(pos);

    const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 16), whiteCreamMat);
    wax.position.y = 0.4;
    wax.castShadow = true;
    candleGroup.add(wax);

    const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8), wickMat);
    wick.position.y = 0.85;
    candleGroup.add(wick);

    const flameGeom = new THREE.SphereGeometry(0.12, 16, 16);
    flameGeom.scale(1.0, 1.8, 1.0);
    const flame = new THREE.Mesh(flameGeom, flameMat);
    flame.position.y = 1.05;
    candleGroup.add(flame);
    heroFlameMeshes.push(flame);

    const light = new THREE.PointLight(0xFFB84D, 3.5, 4, 1.8);
    light.position.y = 1.2;
    light.castShadow = true;
    candleGroup.add(light);
    heroCandleLights.push(light);

    heroCakeGroup.add(candleGroup);
  });
}

// Generate textured sponge cake cut face
function createCakeCapTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Base background
  ctx.fillStyle = '#FFEBEF';
  ctx.fillRect(0, 0, 256, 512);

  // Sponge cake layers (Alternating strawberry sponge pink & white cream)
  const layerCount = 14;
  const layerHeight = 512 / layerCount;
  for (let i = 0; i < layerCount; i++) {
    ctx.fillStyle = (i % 2 === 0) ? '#F8AFCB' : '#FFFDFC';
    ctx.fillRect(0, i * layerHeight, 256, layerHeight * 0.85);

    // Fine cream filling border
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, i * layerHeight + layerHeight * 0.85, 256, layerHeight * 0.15);
  }

  // Draw gold cake stand column slice at the bottom (bottom 10%)
  ctx.fillStyle = '#D4AF37';
  ctx.fillRect(0, 512 - 50, 256, 50);

  return new THREE.CanvasTexture(canvas);
}

// Build Cake for Cutting (Uses Clipping Planes & Capped Seams)
function buildCuttingCake() {
  cutCakeGroup = new THREE.Group();
  cutScene.add(cutCakeGroup);

  leftHalfGroup = new THREE.Group();
  rightHalfGroup = new THREE.Group();
  
  cutCakeGroup.add(leftHalfGroup);
  cutCakeGroup.add(rightHalfGroup);

  // Left group clipped to show x <= 0 (Clipped mesh keeps left, deletes right)
  const leftClip = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.0);
  // Right group clipped to show x >= 0 (Clipped mesh keeps right, deletes left)
  const rightClip = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0.0);

  const createPhysicalMat = (color, roughness, metalness, clearcoat, planes) => {
    return new THREE.MeshPhysicalMaterial({
      color: color,
      roughness: roughness,
      metalness: metalness,
      clearcoat: clearcoat,
      clippingPlanes: planes,
      clipShadows: true
    });
  };

  const addCakeHalf = (group, planes) => {
    const pinkCream = createPhysicalMat(0xFFC0CB, 0.15, 0.05, 1.0, planes);
    const goldCream = createPhysicalMat(0xD4AF37, 0.1, 0.85, 1.0, planes);
    const whiteCream = createPhysicalMat(0xFFFDFC, 0.2, 0.02, 0.8, planes);
    const strawMat = createPhysicalMat(0xE03C58, 0.3, 0.05, 1.0, planes);

    // Stand
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.8, 0.2, 64), goldCream);
    stand.position.y = -2.0;
    stand.castShadow = true;
    stand.receiveShadow = true;
    group.add(stand);

    // Stand column
    const standColumn = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.0, 0.4, 64), goldCream);
    standColumn.position.y = -2.3;
    group.add(standColumn);

    // Tier 1 (Pink)
    const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 1.4, 64), pinkCream);
    tier1.position.y = -1.2;
    tier1.castShadow = true;
    tier1.receiveShadow = true;
    group.add(tier1);

    const ribbon1 = new THREE.Mesh(new THREE.TorusGeometry(2.82, 0.12, 16, 64), goldCream);
    ribbon1.rotation.x = Math.PI / 2;
    ribbon1.position.y = -1.8;
    group.add(ribbon1);

    // Tier 2 (White)
    const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 1.2, 64), whiteCream);
    tier2.position.y = 0.1;
    tier2.castShadow = true;
    tier2.receiveShadow = true;
    group.add(tier2);

    // Beads
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), goldCream);
      bead.position.set(Math.cos(angle) * 2.0, -0.45, Math.sin(angle) * 2.0);
      group.add(bead);
    }

    // Tier 3 (Pink)
    const tier3 = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 1.0, 64), pinkCream);
    tier3.position.y = 1.2;
    tier3.castShadow = true;
    tier3.receiveShadow = true;
    group.add(tier3);

    // Strawberries
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const straw = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.32, 16), strawMat);
      straw.position.set(Math.cos(angle) * 1.6, 0.8, Math.sin(angle) * 1.6);
      straw.rotation.x = 0.2;
      straw.rotation.z = -angle;
      group.add(straw);
    }
  };

  // Add Left & Right Clipped meshes
  addCakeHalf(leftHalfGroup, [leftClip]);
  addCakeHalf(rightHalfGroup, [rightClip]);

  // ADD INNER CAPPING PLANES (renders solid layered interior on sliced face)
  const capTexture = createCakeCapTexture();
  const capMaterialLeft = new THREE.MeshPhysicalMaterial({
    map: capTexture,
    roughness: 0.5,
    metalness: 0.05,
    clearcoat: 0.1,
    clippingPlanes: [leftClip], // Cut bounds correctly
    side: THREE.DoubleSide
  });
  
  const capMaterialRight = capMaterialLeft.clone();
  capMaterialRight.clippingPlanes = [rightClip];

  // Left solid face plane (faces +x direction)
  const capGeometry = new THREE.PlaneGeometry(5.6, 4.4); // Covers base to tier 3 width
  const capMeshLeft = new THREE.Mesh(capGeometry, capMaterialLeft);
  capMeshLeft.rotation.y = Math.PI / 2;
  capMeshLeft.position.set(0, -0.3, 0); // Aligns center
  leftHalfGroup.add(capMeshLeft);

  // Right solid face plane (faces -x direction)
  const capMeshRight = new THREE.Mesh(capGeometry, capMaterialRight);
  capMeshRight.rotation.y = -Math.PI / 2;
  capMeshRight.position.set(0, -0.3, 0);
  rightHalfGroup.add(capMeshRight);

  // Add Offset Candles to each group
  const wickMat = new THREE.MeshBasicMaterial({ color: 0x4D3319 });
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xFFB84D, transparent: true, opacity: 0.95 });
  const whiteCreamMat = new THREE.MeshPhysicalMaterial({ color: 0xFFFDFC, roughness: 0.2, clearcoat: 0.8 });

  // Candle 1: Left group (offset x = -0.6)
  createCandleMesh(new THREE.Vector3(-0.6, 1.7, 0.2), whiteCreamMat, wickMat, flameMat, leftHalfGroup);
  // Candle 2: Right group (offset x = 0.6)
  createCandleMesh(new THREE.Vector3(0.6, 1.7, 0.2), whiteCreamMat, wickMat, flameMat, rightHalfGroup);
  // Candle 3: Back-Left group
  createCandleMesh(new THREE.Vector3(-0.2, 1.7, -0.6), whiteCreamMat, wickMat, flameMat, leftHalfGroup);

  // Build the 3D Knife Mesh (Gold Metallic Blade)
  const knifeGeometry = new THREE.BoxGeometry(0.04, 3.0, 0.45);
  knifeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xD4AF37,
    roughness: 0.1,
    metalness: 0.9,
    clearcoat: 1.0
  });
  knifeMesh = new THREE.Mesh(knifeGeometry, knifeMaterial);
  knifeMesh.position.set(0, 5.0, 0); // Position high above cake
  knifeMesh.castShadow = true;
  knifeMesh.visible = false; // Hide 3D knife mesh, hand overlay handles knife visuals
  cutScene.add(knifeMesh);
}

function createCandleMesh(pos, bodyMat, wickMat, flameMat, parentGroup) {
  const candleGroup = new THREE.Group();
  candleGroup.position.copy(pos);

  const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 16), bodyMat);
  wax.position.y = 0.4;
  wax.castShadow = true;
  candleGroup.add(wax);

  const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8), wickMat);
  wick.position.y = 0.85;
  candleGroup.add(wick);

  const flameGeom = new THREE.SphereGeometry(0.12, 16, 16);
  flameGeom.scale(1.0, 1.8, 1.0);
  const flame = new THREE.Mesh(flameGeom, flameMat);
  flame.position.y = 1.05;
  candleGroup.add(flame);
  cutFlameMeshes.push(flame);

  const light = new THREE.PointLight(0xFFB84D, 3.5, 4, 1.8);
  light.position.y = 1.2;
  light.castShadow = true;
  candleGroup.add(light);
  cutCandleLights.push(light);

  parentGroup.add(candleGroup);
  return candleGroup;
}

// Particle system for extinguished smoke chimes
function setupSmokeSystem() {
  const particleCount = 60;
  smokeGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = 9999; 
  }
  
  smokeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  grad.addColorStop(0, 'rgba(210, 200, 205, 0.35)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 16, 16);
  
  const texture = new THREE.CanvasTexture(canvas);
  
  smokeMaterial = new THREE.PointsMaterial({
    size: 0.22,
    map: texture,
    transparent: true,
    depthWrite: false
  });
  
  smokePoints = new THREE.Points(smokeGeometry, smokeMaterial);
  cutScene.add(smokePoints);
}

// 3D Physical Crumbs Pool setup
function setupCrumbsPool() {
  const pinkMat = new THREE.MeshBasicMaterial({ color: 0xF8AFCB });
  const goldMat = new THREE.MeshBasicMaterial({ color: 0xD4AF37 });
  const whiteMat = new THREE.MeshBasicMaterial({ color: 0xFFFDFC });
  const geom = new THREE.DodecahedronGeometry(0.045);

  for (let i = 0; i < CRUMB_COUNT; i++) {
    const mat = i % 3 === 0 ? pinkMat : (i % 3 === 1 ? goldMat : whiteMat);
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(9999, 9999, 9999);
    mesh.visible = false;
    
    cutScene.add(mesh);
    
    // Add physics descriptors
    crumbParticles.push({
      mesh: mesh,
      active: false,
      vx: 0,
      vy: 0,
      vz: 0,
      gravity: -0.002,
      bounce: 0.35
    });
  }
}

// Emitters: Spawns 3D physical crumbs shooting out of the sliced plane
function emitCrumbs(yPos) {
  let count = 0;
  for (let i = 0; i < crumbParticles.length; i++) {
    const p = crumbParticles[i];
    if (!p.active) {
      p.active = true;
      p.mesh.visible = true;
      p.mesh.position.set(
        (Math.random() - 0.5) * 0.05, // Sliced plane X = 0 center
        yPos,
        (Math.random() - 0.5) * 1.5   // Distributed along depth Z
      );
      
      // Shoot outwards left/right
      p.vx = (Math.random() > 0.5 ? 1 : -1) * (0.02 + Math.random() * 0.035);
      p.vy = 0.01 + Math.random() * 0.025;
      p.vz = (Math.random() - 0.5) * 0.04;
      
      count++;
      if (count >= 3) break; // Spawn small packets dynamically
    }
  }
}

function updateCrumbParticles() {
  crumbParticles.forEach((p) => {
    if (p.active) {
      p.vy += p.gravity;
      
      p.mesh.position.x += p.vx;
      p.mesh.position.y += p.vy;
      p.mesh.position.z += p.vz;
      
      // Rotate crumb
      p.mesh.rotation.x += 0.05;
      p.mesh.rotation.y += 0.03;

      // Bounce off gold base plate stand (y = -2.0)
      if (p.mesh.position.y <= -2.0 && p.vy < 0) {
        p.vy = -p.vy * p.bounce;
        p.vx *= 0.7; // friction
        p.vz *= 0.7;
        
        // Push slightly above base
        p.mesh.position.y = -2.0;
        
        // Die if speed is extremely low
        if (Math.abs(p.vy) < 0.001) {
          p.active = false;
          p.mesh.visible = false;
        }
      }
      
      // Die if fall below screen stand column
      if (p.mesh.position.y < -3.2) {
        p.active = false;
        p.mesh.visible = false;
      }
    }
  });
}

// Trigger Cutting Ceremony (Capping display + Knife slide + Bouncy separating halves)
export function cutBirthdayCake(callback) {
  if (isCuttingActive || isCakeCut) return;
  isCuttingActive = true;
  cutCallback = callback;

  const stage = document.getElementById('cake-cutting-stage');

  // GSAP TIMELINE: Real Weight, Acceleration & Impact Vibration
  const tl = gsap.timeline();

  // 1. Blade slides down rapidly (Power4.easeIn simulates gravity impact)
  tl.to(knifeMesh.position, {
    y: -2.0, // Ends at stand surface
    duration: 1.6,
    ease: "power4.in",
    onUpdate: () => {
      // Once blade reaches upper cake boundary, start emitting crumbs and shrinking flames
      const y = knifeMesh.position.y;
      if (y < 2.0) {
        emitCrumbs(y + 0.3); // Emit crumbs near knife tip
        
        // Shrink candle flame scales
        cutFlameMeshes.forEach((flame) => {
          flame.scale.x = Math.max(0, flame.scale.x - 0.08);
          flame.scale.y = Math.max(0, flame.scale.y - 0.08);
          flame.scale.z = Math.max(0, flame.scale.z - 0.08);
        });

        // Fade lights
        cutCandleLights.forEach((light) => {
          light.intensity = Math.max(0, light.intensity - 0.25);
        });

        // Emit smoke
        spawnSmokePuffs();
      }
    },
    onComplete: () => {
      // Impact! Trigger CSS screen shake vibration class
      if (stage) {
        stage.classList.add('shake');
        setTimeout(() => stage.classList.remove('shake'), 450);
      }
    }
  });

  // 2. Separate cake groups sideways with a bouncy spring animation (Elastic.easeOut)
  tl.to([leftHalfGroup.position, rightHalfGroup.position], {
    x: (idx) => (idx === 0 ? -0.85 : 0.85), // Left goes left, Right goes right
    duration: 2.0,
    ease: "elastic.out(1, 0.75)",
    delay: 0.15,
    onStart: () => {
      // Fire celebration chimes callback as separation begins
      if (cutCallback) {
        cutCallback();
        cutCallback = null;
      }
    }
  });

  // 3. Float the knife back up and fade it out
  tl.to(knifeMesh.position, {
    y: 3.5,
    duration: 1.4,
    ease: "power2.out"
  }, "-=1.5"); // Overlaps with separation

  tl.to(knifeMaterial, {
    opacity: 0,
    duration: 1.0,
    ease: "power2.out",
    onComplete: () => {
      knifeMesh.visible = false;
      isCuttingActive = false;
      isCakeCut = true;
    }
  }, "-=1.4");
}

// Live drag updates (Progress: 0 to 1)
export function updateSlicingProgress(p) {
  if (isCakeCut || isCuttingActive) return;

  // Translate 3D knife position: high (y = 5.0) down to base (y = -2.0)
  const targetY = 5.0 - p * 7.0;
  knifeMesh.position.y = targetY;

  // Slicing thresholds (contacts top tier when p > 0.4)
  if (p > 0.4) {
    const f = Math.max(0, 1 - (p - 0.4) * 1.82); // Shrink flames to 0 by p = 0.95
    cutFlameMeshes.forEach((flame) => {
      flame.scale.set(f, f * 1.8, f);
    });
    cutCandleLights.forEach((light) => {
      light.intensity = 3.5 * f;
    });

    // Puffs wicking smoke
    spawnSmokePuffs();

    // Spray crumbs
    emitCrumbs(targetY + 0.3);
  }
}

// Reset slicing progress (Spring back animation)
export function resetSlicingProgress() {
  if (isCakeCut || isCuttingActive) return;

  gsap.to(knifeMesh.position, { y: 5.0, duration: 0.5, ease: "power2.out" });

  cutFlameMeshes.forEach((flame) => {
    gsap.to(flame.scale, { x: 1.0, y: 1.8, z: 1.0, duration: 0.5 });
  });

  cutCandleLights.forEach((light) => {
    gsap.to(light, { intensity: 3.5, duration: 0.5 });
  });
}

// Separate the cake halves on completion of drag cut
export function splitCakeHalves(callback) {
  if (isCakeCut || isCuttingActive) return;
  isCakeCut = true;
  cutCallback = callback;

  // Bouncy recoil sideways separation
  gsap.to([leftHalfGroup.position, rightHalfGroup.position], {
    x: (idx) => (idx === 0 ? -0.85 : 0.85),
    duration: 1.8,
    ease: "elastic.out(1, 0.75)",
    onStart: () => {
      if (cutCallback) {
        cutCallback();
        cutCallback = null;
      }
    }
  });

  // Retract and fade knife mesh
  gsap.to(knifeMesh.position, {
    y: 3.5,
    duration: 1.2,
    ease: "power2.out"
  });

  gsap.to(knifeMaterial, {
    opacity: 0,
    duration: 1.0,
    ease: "power2.out",
    onComplete: () => {
      knifeMesh.visible = false;
    }
  });
}

// Spawn rising smoke particles
function spawnSmokePuffs() {
  const positions = smokeGeometry.attributes.position.array;
  
  // Locations of wicks
  const candleWicks = [
    new THREE.Vector3(-0.6, 2.55, 0.2), 
    new THREE.Vector3(0.6, 2.55, 0.2),
    new THREE.Vector3(-0.2, 2.55, -0.6)
  ];
  
  for (let i = 0; i < smokeParticles.length; i++) {
    const p = smokeParticles[i];
    if (!p.active) {
      const origin = candleWicks[Math.floor(Math.random() * candleWicks.length)];
      p.active = true;
      p.x = origin.x + (Math.random() - 0.5) * 0.05;
      p.y = origin.y;
      p.z = origin.z + (Math.random() - 0.5) * 0.05;
      p.vx = (Math.random() - 0.5) * 0.008;
      p.vy = 0.008 + Math.random() * 0.008;
      p.vz = (Math.random() - 0.5) * 0.008;
      p.life = 1.0;
      break;
    }
  }
}

function updateSmokeParticles() {
  if (smokeParticles.length < 60) {
    smokeParticles.push({ active: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0 });
  }

  const positions = smokeGeometry.attributes.position.array;

  smokeParticles.forEach((p, idx) => {
    if (p.active) {
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      p.life -= 0.02; // Fade speed

      if (p.life <= 0) {
        p.active = false;
        positions[idx * 3] = 9999;
        positions[idx * 3 + 1] = 9999;
        positions[idx * 3 + 2] = 9999;
      } else {
        positions[idx * 3] = p.x;
        positions[idx * 3 + 1] = p.y;
        positions[idx * 3 + 2] = p.z;
      }
    }
  });

  smokeGeometry.attributes.position.needsUpdate = true;
}

// Lighting setup helper for Hero
function setupHeroLighting() {
  const ambient = new THREE.AmbientLight(0xFFF0F5, 1.8);
  heroScene.add(ambient);

  const dir = new THREE.DirectionalLight(0xFFFAF0, 2.5);
  dir.position.set(5, 8, 5);
  dir.castShadow = true;
  heroScene.add(dir);

  const back = new THREE.DirectionalLight(0xE9D5FF, 1.5);
  back.position.set(-5, 4, -5);
  heroScene.add(back);
}

// Lighting setup helper for Cutting
function setupCuttingLighting() {
  const ambient = new THREE.AmbientLight(0xFFF0F5, 2.0);
  cutScene.add(ambient);

  const dir = new THREE.DirectionalLight(0xFFFAF0, 2.8);
  dir.position.set(5, 8, 5);
  dir.castShadow = true;
  cutScene.add(dir);

  const back = new THREE.DirectionalLight(0xE9D5FF, 1.8);
  back.position.set(-5, 4, -5);
  cutScene.add(back);
}

// Resize handlers
function onHeroResize() {
  const container = document.querySelector('.cake-container-3d');
  if (!container || !heroRenderer) return;
  const width = container.clientWidth;
  const height = container.clientHeight;
  heroCamera.aspect = width / height;
  heroCamera.updateProjectionMatrix();
  heroRenderer.setSize(width, height);
}

function onCuttingResize() {
  const container = document.querySelector('.cutting-cake-container-3d');
  if (!container || !cutRenderer) return;
  const width = container.clientWidth;
  const height = container.clientHeight;
  cutCamera.aspect = width / height;
  cutCamera.updateProjectionMatrix();
  cutRenderer.setSize(width, height);
}

// Mouse movement
function onHeroMouseMove(e) {
  heroMouseX = (e.clientX / window.innerWidth) * 2 - 1;
  heroMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
}

// Page scroll parallax mapping
function onHeroScroll() {
  heroTargetRotationX = Math.min(window.scrollY * 0.0015, Math.PI / 4);
}

// Animation Loops
const heroClock = new THREE.Clock();
function animateHero() {
  requestAnimationFrame(animateHero);
  const time = heroClock.getElapsedTime();

  if (heroCakeGroup) {
    heroCakeGroup.rotation.y = time * 0.15 + (heroMouseX * 0.2);
    heroCakeGroup.rotation.x = heroTargetRotationX + (heroMouseY * 0.15);
  }

  heroFlameMeshes.forEach((flame, index) => {
    const wobbleY = 1.0 + Math.sin(time * 12 + index * 5) * 0.12 + Math.random() * 0.06;
    const wobbleXZ = 1.0 + Math.cos(time * 10 + index * 7) * 0.08 + Math.random() * 0.04;
    flame.scale.set(wobbleXZ, wobbleY * 1.8, wobbleXZ);
    flame.position.x = Math.sin(time * 18 + index * 4) * 0.01;
    flame.position.z = Math.cos(time * 15 + index * 8) * 0.01;
  });

  heroCandleLights.forEach((light, index) => {
    light.intensity = 3.5 + Math.sin(time * 15 + index * 6) * 0.5 + Math.random() * 0.2;
  });

  if (heroControls) heroControls.update();
  if (heroRenderer) heroRenderer.render(heroScene, heroCamera);
}

const cutClock = new THREE.Clock();
function animateCutting() {
  requestAnimationFrame(animateCutting);
  const time = cutClock.getElapsedTime();

  // Slow rotation (stops once sliced to look straight)
  if (cutCakeGroup && !isCakeCut && !isCuttingActive) {
    cutCakeGroup.rotation.y = time * 0.12;
  }

  // Flame wobbling (only if not cut yet)
  if (!isCakeCut && !isCuttingActive) {
    cutFlameMeshes.forEach((flame, index) => {
      const wobbleY = 1.0 + Math.sin(time * 12 + index * 5) * 0.12 + Math.random() * 0.06;
      const wobbleXZ = 1.0 + Math.cos(time * 10 + index * 7) * 0.08 + Math.random() * 0.04;
      if (flame.scale.y > 0.01) {
        flame.scale.set(wobbleXZ, wobbleY * 1.8, wobbleXZ);
      }
    });
  }

  // Update smoke & physical crumbs & render
  updateSmokeParticles();
  updateCrumbParticles();

  if (cutControls) cutControls.update();
  if (cutRenderer) cutRenderer.render(cutScene, cutCamera);
}

// Initialise everything
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initHeroCake();
    initCuttingCake();
  }, 200);
});
