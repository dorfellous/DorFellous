import * as THREE from 'three';
import { getSectionById, SECTIONS } from './sections.js';

export function createNavigation({
  camera,
  canvas,
  controls,
  buildingTargets,
  sectionPage,
  sectionTitle,
  sectionCopy,
  sectionKicker,
  backButton,
  transitionLayer,
  mobileLinks,
  sceneState
}) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const transition = {
    active: false,
    sectionId: null,
    elapsed: 0,
    duration: 1.85,
    fromPosition: new THREE.Vector3(),
    toPosition: new THREE.Vector3(),
    fromQuaternion: new THREE.Quaternion(),
    toQuaternion: new THREE.Quaternion()
  };

  function onPointerDown(event) {
    if (transition.active || sectionPage.hidden === false) return;
    const sectionId = getPointedSectionId(event);
    if (sectionId) flyIntoSection(sectionId);
  }

  function onPointerMove(event) {
    if (document.pointerLockElement === canvas || transition.active || sectionPage.hidden === false) return;
    canvas.style.cursor = getPointedSectionId(event) ? 'pointer' : 'crosshair';
  }

  function getPointedSectionId(event) {
    const rect = canvas.getBoundingClientRect();
    const lockedToCanvas = document.pointerLockElement === canvas;

    pointer.x = lockedToCanvas ? 0 : ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = lockedToCanvas ? 0 : -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const intersections = raycaster.intersectObjects(buildingTargets, false);
    return intersections[0]?.object.userData.sectionId;
  }

  function flyIntoSection(sectionId) {
    const target =
      buildingTargets.find((mesh) => mesh.userData.sectionId === sectionId && mesh.userData.isBuilding) ||
      buildingTargets.find((mesh) => mesh.userData.sectionId === sectionId);
    if (!target) return;

    target.getWorldPosition(transition.toPosition);
    transition.toPosition.y = 1.8;

    const entranceDirection = new THREE.Vector3()
      .subVectors(transition.toPosition, camera.position)
      .setY(0)
      .normalize();

    transition.toPosition.addScaledVector(entranceDirection, 3.5);
    transition.fromPosition.copy(camera.position);
    transition.fromQuaternion.copy(camera.quaternion);

    const lookAt = transition.toPosition.clone().addScaledVector(entranceDirection, 7);
    const transitionCamera = camera.clone();
    transitionCamera.position.copy(transition.toPosition);
    transitionCamera.lookAt(lookAt);
    transition.toQuaternion.copy(transitionCamera.quaternion);

    transition.sectionId = sectionId;
    transition.elapsed = 0;
    transition.active = true;
    canvas.style.cursor = 'crosshair';
    controls.setEnabled(false);
    transitionLayer.classList.add('is-travelling');
  }

  function update(delta) {
    if (!transition.active) return;

    transition.elapsed += delta;
    const progress = Math.min(transition.elapsed / transition.duration, 1);
    const eased = easeInOutCubic(progress);

    camera.position.lerpVectors(transition.fromPosition, transition.toPosition, eased);
    camera.quaternion.copy(transition.fromQuaternion).slerp(transition.toQuaternion, eased);

    if (progress > 0.62) {
      transitionLayer.classList.add('is-opaque');
    }

    if (progress >= 1) {
      transition.active = false;
      showSection(transition.sectionId);
    }
  }

  function showSection(sectionId) {
    const section = getSectionById(sectionId);
    if (!section) return;

    sectionKicker.textContent = 'Dor Fellous';
    sectionTitle.textContent = section.title;
    sectionCopy.textContent = section.placeholder;
    canvas.setAttribute('aria-hidden', 'true');
    sectionPage.hidden = false;
    sectionPage.classList.add('is-visible');
    document.body.classList.add('showing-section');
    transitionLayer.classList.remove('is-travelling');
  }

  function backToEntrance() {
    sectionPage.classList.remove('is-visible');
    sectionPage.hidden = true;
    canvas.removeAttribute('aria-hidden');
    document.body.classList.remove('showing-section');
    transitionLayer.classList.remove('is-opaque', 'is-travelling');
    controls.setPose(sceneState.startPosition.clone(), sceneState.startYaw, 0);
    controls.setEnabled(true);
  }

  function populateMobileLinks() {
    SECTIONS.forEach((section) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = section.title;
      button.addEventListener('click', () => showSection(section.id));
      mobileLinks.appendChild(button);
    });
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  backButton.addEventListener('click', backToEntrance);
  populateMobileLinks();

  return {
    update,
    backToEntrance,
    showSection
  };
}

function easeInOutCubic(value) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}
