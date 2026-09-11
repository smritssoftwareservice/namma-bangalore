// First-Person Pedestrian Walkthrough Camera Controller for CesiumJS
// Provides 1.7m ground-level human eye perspective with WASD / Arrow keys navigation

export class WalkthroughController {
  constructor(viewer, onUpdate) {
    this.viewer = viewer;
    this.onUpdate = onUpdate;
    this.active = false;
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      turnLeft: false,
      turnRight: false,
    };
    this.removeTickListener = null;
    this.keyDownHandler = null;
    this.keyUpHandler = null;
    this.moveSpeed = 12.0; // meters per second
    this.turnSpeed = 1.2; // radians per second
    this.lastTime = 0;
  }

  start(targetLat, targetLng) {
    if (!this.viewer || !window.Cesium) return;
    const Cesium = window.Cesium;

    this.active = true;

    // Position camera at target lat/lng, 1.8m above ground
    const carto = Cesium.Cartographic.fromDegrees(targetLng, targetLat, 1.8);
    const destination = Cesium.Ellipsoid.WGS84.cartographicToCartesian(carto);

    this.viewer.camera.flyTo({
      destination: destination,
      orientation: {
        heading: this.viewer.camera.heading,
        pitch: Cesium.Math.toRadians(-2), // Eye-level looking forward towards towers
        roll: 0,
      },
      duration: 1.5,
      complete: () => {
        this._bindEvents();
      },
    });
  }

  stop() {
    this.active = false;
    this._unbindEvents();
  }

  _bindEvents() {
    this.keyDownHandler = (e) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          this.keys.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          this.keys.backward = true;
          break;
        case "KeyA":
          this.keys.left = true;
          break;
        case "KeyD":
          this.keys.right = true;
          break;
        case "ArrowLeft":
        case "KeyQ":
          this.keys.turnLeft = true;
          break;
        case "ArrowRight":
        case "KeyE":
          this.keys.turnRight = true;
          break;
      }
    };

    this.keyUpHandler = (e) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          this.keys.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          this.keys.backward = false;
          break;
        case "KeyA":
          this.keys.left = false;
          break;
        case "KeyD":
          this.keys.right = false;
          break;
        case "ArrowLeft":
        case "KeyQ":
          this.keys.turnLeft = false;
          break;
        case "ArrowRight":
        case "KeyE":
          this.keys.turnRight = false;
          break;
      }
    };

    window.addEventListener("keydown", this.keyDownHandler);
    window.addEventListener("keyup", this.keyUpHandler);

    this.lastTime = performance.now();

    const onTick = () => {
      if (!this.active || !this.viewer) return;
      const now = performance.now();
      const dt = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;

      const camera = this.viewer.camera;
      const Cesium = window.Cesium;

      // Turning
      if (this.keys.turnLeft) {
        camera.lookLeft(this.turnSpeed * dt);
      }
      if (this.keys.turnRight) {
        camera.lookRight(this.turnSpeed * dt);
      }

      // Movement
      const distance = this.moveSpeed * dt;
      if (this.keys.forward) {
        camera.moveForward(distance);
      }
      if (this.keys.backward) {
        camera.moveBackward(distance);
      }
      if (this.keys.left) {
        camera.moveLeft(distance);
      }
      if (this.keys.right) {
        camera.moveRight(distance);
      }

      if (
        this.keys.forward ||
        this.keys.backward ||
        this.keys.left ||
        this.keys.right ||
        this.keys.turnLeft ||
        this.keys.turnRight
      ) {
        this.viewer.scene.requestRender();
      }
    };

    this.viewer.clock.onTick.addEventListener(onTick);
    this.removeTickListener = () => {
      this.viewer.clock.onTick.removeEventListener(onTick);
    };
  }

  _unbindEvents() {
    if (this.keyDownHandler) {
      window.removeEventListener("keydown", this.keyDownHandler);
      this.keyDownHandler = null;
    }
    if (this.keyUpHandler) {
      window.removeEventListener("keyup", this.keyUpHandler);
      this.keyUpHandler = null;
    }
    if (this.removeTickListener) {
      this.removeTickListener();
      this.removeTickListener = null;
    }
    Object.keys(this.keys).forEach((k) => (this.keys[k] = false));
  }
}
