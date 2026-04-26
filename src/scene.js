import * as THREE from 'three';
import { SECTIONS } from './sections.js';

const START_POSITION = new THREE.Vector3(0, 1.75, 7.5);
const START_YAW = 0;

export function createPortfolioScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020202);
  scene.fog = new THREE.FogExp2(0x050505, 0.034);

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
  renderer.toneMappingExposure = 0.92;

  const buildingTargets = [];
  const materials = createMaterials();

  createAtmosphere(scene);
  createFloor(scene, materials);
  createFloorName(scene);
  createBuildings(scene, materials, buildingTargets);

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

function createMaterials() {
  return {
    floor: new THREE.MeshStandardMaterial({
      color: 0x030303,
      roughness: 0.48,
      metalness: 0.34
    }),
    monolith: new THREE.MeshStandardMaterial({
      color: 0x060606,
      roughness: 0.57,
      metalness: 0.22
    }),
    monolithAccent: new THREE.MeshStandardMaterial({
      color: 0x101010,
      roughness: 0.42,
      metalness: 0.34
    }),
    label: new THREE.MeshBasicMaterial({
      color: 0xd8d8d0,
      transparent: true,
      opacity: 0.9
    }),
    floorLabel: new THREE.MeshBasicMaterial({
      color: 0xd2d2c8,
      transparent: true,
      opacity: 0.42
    })
  };
}

function createAtmosphere(scene) {
  scene.add(new THREE.HemisphereLight(0x252525, 0x020202, 0.7));

  const keyLight = new THREE.DirectionalLight(0xf2eee1, 2.8);
  keyLight.position.set(-14, 18, 12);
  scene.add(keyLight);

  const backLight = new THREE.DirectionalLight(0x8e918d, 1.1);
  backLight.position.set(18, 10, -30);
  scene.add(backLight);

  const entranceGlow = new THREE.PointLight(0xf5f0dc, 6, 24, 2);
  entranceGlow.position.set(0, 3, 3);
  scene.add(entranceGlow);

  const industrialLights = [
    [-17, 8, -14, 4.2],
    [12, 10, -22, 5.2],
    [2, 9, -34, 4.5],
    [24, 7, -8, 3.6]
  ];

  industrialLights.forEach(([x, y, z, intensity]) => {
    const light = new THREE.PointLight(0xd8d4c6, intensity, 22, 2.2);
    light.position.set(x, y, z);
    scene.add(light);
  });
}

function createFloor(scene, materials) {
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(95, 95), materials.floor);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  scene.add(floor);

  const grid = new THREE.GridHelper(95, 38, 0x141414, 0x090909);
  grid.material.transparent = true;
  grid.material.opacity = 0.22;
  scene.add(grid);

  const corridor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 42),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.035 })
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

    const bevelLines = createBuildingLines(size);
    group.add(bevelLines);

    const label = createBuildingLabel(section.title, size, labelSide);
    group.add(label);

    const entrance = createEntranceMarker(size, labelSide);
    group.add(entrance);

    scene.add(group);
  });
}

function createBuildingLines(size) {
  const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(size.x + 0.02, size.y + 0.02, size.z + 0.02));
  const lines = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0x242424, transparent: true, opacity: 0.55 })
  );
  return lines;
}

function createBuildingLabel(title, size, side) {
  const texture = createTextTexture(title, {
    width: 1536,
    height: 512,
    fontSize: title.length > 7 ? 170 : 210,
    fill: 'rgba(230, 230, 220, 0.92)',
    stroke: 'rgba(0, 0, 0, 0.82)',
    strokeWidth: 14,
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

  const surfaceOffset = 0.035;
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
    new THREE.MeshBasicMaterial({ color: 0xf4f0dd, transparent: true, opacity: 0.08 })
  );

  marker.position.y = -size.y / 2 + marker.geometry.parameters.height / 2;
  const offset = 0.04;

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
