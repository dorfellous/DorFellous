import * as THREE from 'three';

const MOVE_KEYS = new Set([
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ArrowUp',
  'ArrowLeft',
  'ArrowDown',
  'ArrowRight'
]);

export function createFirstPersonControls(camera, domElement) {
  const state = {
    enabled: true,
    pointerLocked: false,
    keys: new Set(),
    yaw: 0,
    pitch: 0,
    velocity: new THREE.Vector3(),
    desiredDirection: new THREE.Vector3()
  };

  const settings = {
    eyeHeight: 1.75,
    movementSpeed: 5.2,
    damping: 9,
    mouseSensitivity: 0.002,
    touchSensitivity: 0.004,
    pitchLimit: Math.PI / 2.8,
    worldLimit: 38
  };

  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const touch = {
    active: false,
    previousX: 0,
    previousY: 0
  };

  function applyRotation() {
    camera.rotation.order = 'YXZ';
    camera.rotation.y = state.yaw;
    camera.rotation.x = state.pitch;
  }

  function lockPointer() {
    if (!state.enabled || state.pointerLocked) return;
    domElement.requestPointerLock?.();
  }

  function setEnabled(enabled) {
    state.enabled = enabled;
    state.keys.clear();
    state.velocity.set(0, 0, 0);

    if (!enabled && document.pointerLockElement === domElement) {
      document.exitPointerLock();
    }
  }

  function setPose(position, yaw, pitch = 0) {
    camera.position.copy(position);
    state.yaw = yaw;
    state.pitch = THREE.MathUtils.clamp(pitch, -settings.pitchLimit, settings.pitchLimit);
    applyRotation();
  }

  function onPointerLockChange() {
    state.pointerLocked = document.pointerLockElement === domElement;
  }

  function onMouseMove(event) {
    if (!state.enabled || !state.pointerLocked) return;
    state.yaw -= event.movementX * settings.mouseSensitivity;
    state.pitch -= event.movementY * settings.mouseSensitivity;
    state.pitch = THREE.MathUtils.clamp(state.pitch, -settings.pitchLimit, settings.pitchLimit);
    applyRotation();
  }

  function onKeyDown(event) {
    if (!state.enabled || !MOVE_KEYS.has(event.code)) return;
    event.preventDefault();
    state.keys.add(event.code);
  }

  function onKeyUp(event) {
    if (!MOVE_KEYS.has(event.code)) return;
    event.preventDefault();
    state.keys.delete(event.code);
  }

  function onTouchStart(event) {
    if (!state.enabled || event.touches.length !== 1) return;
    touch.active = true;
    touch.previousX = event.touches[0].clientX;
    touch.previousY = event.touches[0].clientY;
  }

  function onTouchMove(event) {
    if (!state.enabled || !touch.active || event.touches.length !== 1) return;
    const nextX = event.touches[0].clientX;
    const nextY = event.touches[0].clientY;
    const deltaX = nextX - touch.previousX;
    const deltaY = nextY - touch.previousY;
    touch.previousX = nextX;
    touch.previousY = nextY;

    state.yaw -= deltaX * settings.touchSensitivity;
    state.pitch -= deltaY * settings.touchSensitivity;
    state.pitch = THREE.MathUtils.clamp(state.pitch, -settings.pitchLimit, settings.pitchLimit);
    applyRotation();
  }

  function onTouchEnd() {
    touch.active = false;
  }

  function update(delta) {
    if (!state.enabled) return;

    state.desiredDirection.set(0, 0, 0);
    if (state.keys.has('KeyW') || state.keys.has('ArrowUp')) state.desiredDirection.z -= 1;
    if (state.keys.has('KeyS') || state.keys.has('ArrowDown')) state.desiredDirection.z += 1;
    if (state.keys.has('KeyA') || state.keys.has('ArrowLeft')) state.desiredDirection.x -= 1;
    if (state.keys.has('KeyD') || state.keys.has('ArrowRight')) state.desiredDirection.x += 1;

    forward.set(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), state.yaw);
    right.set(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), state.yaw);

    const targetVelocity = new THREE.Vector3();
    if (state.desiredDirection.lengthSq() > 0) {
      state.desiredDirection.normalize();
      targetVelocity
        .addScaledVector(forward, -state.desiredDirection.z)
        .addScaledVector(right, state.desiredDirection.x)
        .normalize()
        .multiplyScalar(settings.movementSpeed);
    }

    state.velocity.lerp(targetVelocity, 1 - Math.exp(-settings.damping * delta));
    camera.position.addScaledVector(state.velocity, delta);
    camera.position.y = settings.eyeHeight;
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -settings.worldLimit, settings.worldLimit);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -settings.worldLimit, 9);
  }

  document.addEventListener('pointerlockchange', onPointerLockChange);
  document.addEventListener('mousemove', onMouseMove);
  window.addEventListener('keydown', onKeyDown, { passive: false });
  window.addEventListener('keyup', onKeyUp, { passive: false });
  domElement.addEventListener('click', lockPointer);
  domElement.addEventListener('touchstart', onTouchStart, { passive: true });
  domElement.addEventListener('touchmove', onTouchMove, { passive: true });
  domElement.addEventListener('touchend', onTouchEnd);

  applyRotation();

  return {
    update,
    lockPointer,
    setEnabled,
    setPose,
    get yaw() {
      return state.yaw;
    },
    get pitch() {
      return state.pitch;
    }
  };
}
