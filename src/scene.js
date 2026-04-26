import * as THREE from 'three';
import { SECTIONS } from './sections.js';

const START_POSITION = new THREE.Vector3(0, 1.75, 7.5);
const START_YAW = 0;

export function createPortfolioScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020202);
  scene.fog = new THREE.FogExp2(0x070707, 0.052);

  const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.copy(START_POSITION);
  camera.rotation.order = 'YXZ';

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.86;

  const buildingTargets = [];
  const textureSet = createTextureSet();
  const materials = createMaterials(textureSet);

  createAtmosphere(scene);
  createFloor(scene, materials);
  createFloorName(scene);
  createBuildings(scene, materials, buildingTargets);
  createStreetLights(scene, materials);

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  window.addEventListener('resize', resize);

  return {
    scene,
    camera,
    renderer,
    buildingTargets,
    startPosition: START_POSITION.clone(),
    startYaw: START_YAW,
    resize,
    render() {
      renderer.render(scene, camera);
    }
  };
}

function createTextureSet() {
  return {
    floorColor: createNoiseTexture({
      size: 1024,
      base: [9, 9, 8],
      spread: 36,
      scratchCount: 1500,
      stainCount: 90,
      repeat: 18
    }),
    floorBump: createNoiseTexture({
      size: 1024,
      base: [118, 118, 112],
      spread: 92,
      scratchCount: 2300,
      stainCount: 120,
      repeat: 18,
      grayscale: true
    }),
    buildingColor: createNoiseTexture({
      size: 1024,
      base: [13, 13, 13],
      spread: 34,
      scratchCount: 900,
      stainCount: 120,
      repeat: 3
    }),
    buildingBump: createNoiseTexture({
      size: 1024,
      base: [120, 120, 116],
      spread: 70,
      scratchCount: 1400,
      stainCount: 140,
      repeat: 3,
      grayscale: true
    })
  };
}

function createMaterials(textures) {
  return {
    floor: new THREE.MeshStandardMaterial({
      color: 0x050505,
      map: textures.floorColor,
      bumpMap: textures.floorBump,
      bumpScale: 0.09,
      roughness: 0.62,
      metalness: 0.28
    }),
    monolith: new THREE.MeshStandardMaterial({
      color: 0x080808,
      map: textures.buildingColor,
      bumpMap: textures.buildingBump,
      bumpScale: 0.16,
      roughness: 0.72,
      metalness: 0.18
    }),
    monolithAccent: new THREE.MeshStandardMaterial({
      color: 0x111111,
      map: textures.buildingColor.clone(),
      bumpMap: textures.buildingBump.clone(),
      bumpScale: 0.12,
      roughness: 0.64,
      metalness: 0.24
    }),
    metal: new THREE.MeshStandardMaterial({
      color: 0x0b0b0b,
      roughness: 0.44,
      metalness: 0.72
    }),
    glass: new THREE.MeshStandardMaterial({
      color: 0xf2ecd9,
      emissive: 0xd8caa8,
      emissiveIntensity: 1.4,
      roughness: 0.18,
      metalness: 0.08
    })
  };
}

function createAtmosphere(scene) {
  scene.add(new THREE.HemisphereLight(0x202020, 0x030303, 0.58));

  const keyLight = new THREE.DirectionalLight(0xf2eee1, 2.1);
  keyLight.position.set(-14, 18, 12);
  scene.add(keyLight);

  const backLight = new THREE.DirectionalLight(0x8e918d, 0.9);
  backLight.position.set(18, 10, -30);
  scene.add(backLight);

  const entranceGlow = new THREE.PointLight(0xf5f0dc, 4.8, 24, 2);
  entranceGlow.position.set(0, 3, 3);
  scene.add(entranceGlow);

  const industrialLights = [
    [-17, 8, -14, 3.2],
    [12, 10, -22, 3.8],
    [2, 9, -34, 3.1],
    [24, 7, -8, 2.8]
  ];

  industrialLights.forEach(([x, y, z, intensity]) => {
    const light = new THREE.PointLight(0xd8d4c6, intensity, 22, 2.2);
    light.position.set(x, y, z);
    scene.add(light);
  });
}

function createFloor(scene, materials) {
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(95, 95, 32, 32), materials.floor);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  scene.add(floor);

  const grid = new THREE.GridHelper(95, 38, 0x141414, 0x090909);
  grid.material.transparent = true;
  grid.material.opacity = 0.14;
  scene.add(grid);

  const corridor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 42),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.028 })
  );
  corridor.rotation.x = -Math.PI / 2;
  corridor.position.set(0, 0.012, -15);
  scene.add(corridor);
}

function createFloorName(scene) {
  const nameTexture = createTextTexture('DOR FELLOUS', {
    width: 2048,
    height: 512,
    fontSize: 210,
    fill: 'rgba(222, 222, 210, 0.72)',
    stroke: 'rgba(0, 0, 0, 0.65)',
    strokeWidth: 10,
    letterSpacing: 14
  });

  const name = new THREE.Mesh(
    new THREE.PlaneGeometry(11.8, 2.9),
    new THREE.MeshBasicMaterial({
      map: nameTexture,
      transparent: true,
      opacity: 0.58,
      depthWrite: false
    })
  );
  name.rotation.x = -Math.PI / 2;
  name.position.set(0, 0.026, 2.4);
  scene.add(name);

  const incision = new THREE.Mesh(
    new THREE.PlaneGeometry(12.4, 3.1),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.026 })
  );
  incision.rotation.x = -Math.PI / 2;
  incision.position.set(0, 0.018, 2.4);
  scene.add(incision);
}

function createBuildings(scene, materials, buildingTargets) {
  SECTIONS.forEach((section, index) => {
    const { position, size, labelSide } = section.building;
    const group = new THREE.Group();
    group.position.set(position.x, position.y, position.z);
    group.userData.sectionId = section.id;

    const material = index % 2 === 0 ? materials.monolith : materials.monolithAccent;
    const body = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), material);
    body.userData.sectionId = section.id;
    body.userData.isBuilding = true;
    group.add(body);
    buildingTargets.push(body);

    const ledges = createConcreteBands(size, material);
    group.add(ledges);

    const bevelLines = createBuildingLines(size);
    group.add(bevelLines);

    const label = createBuildingLabel(section.title, size, labelSide);
    label.userData.sectionId = section.id;
    label.userData.isCategoryLabel = true;
    group.add(label);
    buildingTargets.push(label);

    const entrance = createEntranceMarker(size, labelSide);
    entrance.userData.sectionId = section.id;
    group.add(entrance);
    buildingTargets.push(entrance);

    scene.add(group);
  });
}

function createConcreteBands(size, material) {
  const bands = new THREE.Group();
  const bandMaterial = material.clone();
  bandMaterial.color = new THREE.Color(0x151515);
  bandMaterial.roughness = 0.76;

  const topBand = new THREE.Mesh(new THREE.BoxGeometry(size.x + 0.08, 0.12, size.z + 0.08), bandMaterial);
  topBand.position.y = size.y / 2 - 0.8;
  bands.add(topBand);

  const lowerBand = new THREE.Mesh(new THREE.BoxGeometry(size.x + 0.1, 0.1, size.z + 0.1), bandMaterial);
  lowerBand.position.y = -size.y / 2 + 1.2;
  bands.add(lowerBand);

  return bands;
}

function createStreetLights(scene, materials) {
  const lights = [
    { x: -8, z: 1, rotation: 0.35, height: 5.4 },
    { x: 8, z: -4, rotation: -0.45, height: 5.8 },
    { x: -12, z: -16, rotation: 0.18, height: 6.2 },
    { x: 13, z: -18, rotation: -0.2, height: 6.0 },
    { x: 0, z: -26, rotation: 0, height: 6.4 }
  ];

  lights.forEach((light) => {
    const group = new THREE.Group();
    group.position.set(light.x, 0, light.z);
    group.rotation.y = light.rotation;

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, light.height, 12), materials.metal);
    pole.position.y = light.height / 2;
    group.add(pole);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.08, 0.08), materials.metal);
    arm.position.set(0.65, light.height - 0.35, 0);
    group.add(arm);

    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.18, 0.36), materials.glass);
    lamp.position.set(1.42, light.height - 0.44, 0);
    group.add(lamp);

    const glow = new THREE.PointLight(0xfff0c4, 3.4, 14, 2.1);
    glow.position.set(1.42, light.height - 0.62, 0);
    group.add(glow);

    const pool = new THREE.Mesh(
      new THREE.CircleGeometry(4.8, 48),
      new THREE.MeshBasicMaterial({ color: 0xffefc4, transparent: true, opacity: 0.075, depthWrite: false })
    );
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(1.42, 0.018, 0);
    group.add(pool);

    const beam = new THREE.Mesh(
      new THREE.ConeGeometry(2.4, light.height - 0.5, 32, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffefc4, transparent: true, opacity: 0.035, depthWrite: false, side: THREE.DoubleSide })
    );
    beam.position.set(1.42, (light.height - 0.5) / 2, 0);
    beam.rotation.x = Math.PI;
    group.add(beam);

    scene.add(group);
  });
}

function createBuildingLines(size) {
  const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(size.x + 0.02, size.y + 0.02, size.z + 0.02));
  const lines = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0x282828, transparent: true, opacity: 0.48 })
  );
  return lines;
}

function createBuildingLabel(title, size, side) {
  const texture = createTextTexture(title, {
    width: 1536,
    height: 512,
    fontSize: title.length > 7 ? 170 : 210,
    fill: 'rgba(238, 236, 222, 0.96)',
    stroke: 'rgba(0, 0, 0, 0.9)',
    strokeWidth: 16,
    letterSpacing: 10
  });

  const labelWidth = Math.min(size.x * 0.9, 9);
  const labelHeight = Math.min(size.y * 0.32, 2.7);
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(labelWidth, labelHeight),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false
    })
  );

  const surfaceOffset = 0.055;
  label.position.y = Math.min(size.y * 0.18, 2.4);

  if (side === 'left') {
    label.rotation.y = Math.PI / 2;
    label.position.x = -size.x / 2 - surfaceOffset;
  } else if (side === 'right') {
    label.rotation.y = -Math.PI / 2;
    label.position.x = size.x / 2 + surfaceOffset;
  } else {
    label.position.z = size.z / 2 + surfaceOffset;
  }

  return label;
}

function createEntranceMarker(size, side) {
  const marker = new THREE.Mesh(
    new THREE.PlaneGeometry(Math.min(size.x * 0.34, 3), Math.min(size.y * 0.42, 4)),
    new THREE.MeshBasicMaterial({ color: 0xf4f0dd, transparent: true, opacity: 0.11 })
  );

  marker.position.y = -size.y / 2 + marker.geometry.parameters.height / 2;
  const offset = 0.05;

  if (side === 'left') {
    marker.rotation.y = Math.PI / 2;
    marker.position.x = -size.x / 2 - offset;
  } else if (side === 'right') {
    marker.rotation.y = -Math.PI / 2;
    marker.position.x = size.x / 2 + offset;
  } else {
    marker.position.z = size.z / 2 + offset;
  }

  return marker;
}

function createNoiseTexture({ size, base, spread, scratchCount, stainCount, repeat, grayscale = false }) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  const imageData = context.createImageData(size, size);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const noise = Math.random() * spread - spread / 2;
    const grain = Math.random() > 0.985 ? Math.random() * spread : 0;
    const value = clamp(base[0] + noise + grain, 0, 255);
    imageData.data[i] = grayscale ? value : clamp(base[0] + noise + grain, 0, 255);
    imageData.data[i + 1] = grayscale ? value : clamp(base[1] + noise + grain, 0, 255);
    imageData.data[i + 2] = grayscale ? value : clamp(base[2] + noise + grain, 0, 255);
    imageData.data[i + 3] = 255;
  }

  context.putImageData(imageData, 0, 0);
  context.globalAlpha = 0.16;

  for (let i = 0; i < stainCount; i += 1) {
    const radius = 12 + Math.random() * 84;
    const x = Math.random() * size;
    const y = Math.random() * size;
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(255,255,255,0.18)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
  }

  context.globalAlpha = 0.2;
  context.strokeStyle = grayscale ? 'rgba(255,255,255,0.3)' : 'rgba(170,170,160,0.22)';
  context.lineWidth = 1;

  for (let i = 0; i < scratchCount; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const length = 6 + Math.random() * 70;
    const angle = Math.random() * Math.PI;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.anisotropy = 4;
  return texture;
}

function createTextTexture(text, options) {
  const canvas = document.createElement('canvas');
  canvas.width = options.width;
  canvas.height = options.height;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = `800 ${options.fontSize}px Arial, Helvetica, sans-serif`;
  context.lineJoin = 'round';

  drawLetterSpacedText(context, text, canvas.width / 2, canvas.height / 2, options.letterSpacing, {
    fill: options.fill,
    stroke: options.stroke,
    strokeWidth: options.strokeWidth
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function drawLetterSpacedText(context, text, x, y, letterSpacing, style) {
  const characters = text.split('');
  const totalWidth = characters.reduce((width, character, index) => {
    const spacing = index === characters.length - 1 ? 0 : letterSpacing;
    return width + context.measureText(character).width + spacing;
  }, 0);

  let cursor = x - totalWidth / 2;
  context.strokeStyle = style.stroke;
  context.lineWidth = style.strokeWidth;
  context.fillStyle = style.fill;

  characters.forEach((character) => {
    const characterWidth = context.measureText(character).width;
    const characterX = cursor + characterWidth / 2;
    context.strokeText(character, characterX, y);
    context.fillText(character, characterX, y);
    cursor += characterWidth + letterSpacing;
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
