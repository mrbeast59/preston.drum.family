---
layout: page
title: "Forza Horizon 10"
---

<style>
  body { margin: 0; overflow: hidden; background: #88ccff; font-family: 'Segoe UI', sans-serif; }
  #ui { position: absolute; top: 20px; left: 20px; color: #000; pointer-events: none; z-index: 10; }
  .stat {
    background: rgba(255, 255, 255, 0.95);
    padding: 10px 20px;
    border-left: 5px solid #ff0055;
    margin-bottom: 5px;
    text-transform: uppercase;
    font-weight: 800;
    font-size: 14px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
  #speed { color: #ff0055; font-size: 28px; }
</style>

<div id="ui">
  <div class="stat">🏙️ TOKYO METROPOLIS 🏙️</div>
  <div class="stat" id="speed">0 KM/H</div>
  <div class="stat" style="font-size: 10px; border-color: #00ffff;">WASD: DRIVE | SPACE: DRIFT</div>
</div>

<script type="importmap">
  { "imports": { "three": "https://unpkg.com/three@0.160.0/build/three.module.js" } }
</script>

<script type="module">
  import * as THREE from 'three';

  // --- 1. VISIBILITY SETTINGS (DAY MODE) ---
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x88ccff); // Bright Blue Sky
  scene.fog = new THREE.Fog(0x88ccff, 400, 1500); // Distance fog

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // --- 2. LIGHTING ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(200, 500, 100);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // --- 3. MATERIALS ---
  function createTexture(color, type) {
    const canvas = document.createElement('canvas');
    canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color; ctx.fillRect(0,0,64,64);

    if (type === 'window') {
        // High density windows
        ctx.fillStyle = '#ddeeff';
        for(let y=4; y<64; y+=8) {
             for(let x=4; x<64; x+=8) {
                 if(Math.random()>0.2) ctx.fillRect(x,y,4,6);
             }
        }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  const bMat = new THREE.MeshStandardMaterial({ map: createTexture('#777', 'window'), roughness: 0.2 });
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa }); // Sidewalk
  const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x333333 }); // Road

  // Ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), asphaltMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const buildings = [];
  const intersections = [];

  // --- 4. TOKYO CITY GENERATION (SUPERBLOCKS) ---
  // Large blocks: 200 wide, 350 long (Less intersections)
  const blockW = 220;
  const blockL = 400;
  const roadW = 60;
  const sidewalkHeight = 0.8;

  const gridX = 4; // Number of blocks X
  const gridZ = 3; // Number of blocks Z (Longer)

  for (let i = -gridX; i <= gridX; i++) {
    for (let j = -gridZ; j <= gridZ; j++) {

      const x = i * blockW;
      const z = j * blockL; // Spaced further apart

      const islandW = blockW - roadW;
      const islandL = blockL - roadW;

      // 1. THE "SUPERBLOCK" SIDEWALK
      const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(islandW, sidewalkHeight, islandL), concreteMat);
      sidewalk.position.set(x, sidewalkHeight/2, z);
      scene.add(sidewalk);

      // Hitbox (The curb)
      buildings.push({
        bounds: { minX: x - islandW/2, maxX: x + islandW/2, minZ: z - islandL/2, maxZ: z + islandL/2 }
      });

      // 2. DENSITY GENERATOR (Cluster of buildings per block)
      // Instead of 1 building, we put 6-10 random towers on this island
      const numTowers = 8 + Math.floor(Math.random() * 6);

      for(let k=0; k<numTowers; k++) {
          const tW = (islandW / 4) + Math.random() * 20;
          const tL = (islandL / 5) + Math.random() * 20;
          const tH = 60 + Math.random() * 120; // Varied heights

          // Random position inside the sidewalk
          const offX = (Math.random() * (islandW - tW)) - (islandW/2 - tW/2);
          const offZ = (Math.random() * (islandL - tL)) - (islandL/2 - tL/2);

          const tower = new THREE.Mesh(new THREE.BoxGeometry(tW, tH, tL), bMat);
          tower.position.set(offX, tH/2, offZ);
          sidewalk.add(tower);

          // Rooftop Detail
          if(Math.random() > 0.5) {
              const roof = new THREE.Mesh(new THREE.BoxGeometry(tW*0.6, 4, tL*0.6), concreteMat);
              roof.position.set(offX, tH + 2, offZ);
              sidewalk.add(roof);
          }
      }

      // 3. TRAFFIC LIGHTS (Only at the corners of these huge blocks)
      if (i < gridX && j < gridZ) {
        const lightGroup = new THREE.Group();
        // Position at the intersection corner
        lightGroup.position.set(x + blockW/2, 0, z + blockL/2);

        // Horizontal Bar Pole (Japanese Style)
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 18), new THREE.MeshBasicMaterial({color:0x222}));
        pole.position.y = 9; lightGroup.add(pole);
        const bar = new THREE.Mesh(new THREE.BoxGeometry(12, 0.5, 0.5), new THREE.MeshBasicMaterial({color:0x222}));
        bar.position.y = 17; lightGroup.add(bar);

        const box = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 1), new THREE.MeshBasicMaterial({color:0x111}));
        box.position.y = 16.5; lightGroup.add(box);

        const redMat = new THREE.MeshBasicMaterial({color: 0x330000});
        const greenMat = new THREE.MeshBasicMaterial({color: 0x00ff00});
        const rSphere = new THREE.Mesh(new THREE.SphereGeometry(0.4), redMat); rSphere.position.set(-1, 16.5, 0.6); lightGroup.add(rSphere);
        const gSphere = new THREE.Mesh(new THREE.SphereGeometry(0.4), greenMat); gSphere.position.set(1, 16.5, 0.6); lightGroup.add(gSphere);

        scene.add(lightGroup);

        intersections.push({
            x: x + blockW/2, z: z + blockL/2,
            state: 'green', timer: Math.random() * 200,
            obj: { rM: redMat, gM: greenMat }
        });
      }
    }
  }

  // --- 5. TRAFFIC SYSTEM (Adapted for Long Roads) ---
  const traffic = [];
  const carColors = [0xff0000, 0x0000ff, 0xffff00, 0xeeeeee, 0x111111];

  function spawnCar(x, z, axis, speed) {
    const group = new THREE.Group();
    const geo = new THREE.BoxGeometry(3.5, 1.8, 7);
    const mat = new THREE.MeshStandardMaterial({ color: carColors[Math.floor(Math.random()*carColors.length)] });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.9;
    group.add(mesh);
    group.position.set(x, 0, z);
    if(axis === 'x') group.rotation.y = Math.PI / 2;
    scene.add(group);

    traffic.push({ mesh: group, axis: axis, baseSpeed: speed, currentSpeed: speed, stopped: false });
  }

  // Generate Traffic
  const mapSizeX = gridX * blockW;
  const mapSizeZ = gridZ * blockL;

  for(let i = -gridX; i <= gridX; i++) {
    const laneX = i * blockW;
    // Z-Axis Traffic (Long Avenues) - More Cars here
    for(let k=0; k<2; k++) { // 2 Lanes
        const offset = (k==0? 10 : -10);
        for(let c=0; c<8; c++) { // 8 cars per long road
            spawnCar(laneX + offset, (Math.random()*mapSizeZ*2)-mapSizeZ, 'z', 0.5 + Math.random()*0.3);
        }
    }
  }

  for(let j = -gridZ; j <= gridZ; j++) {
      const laneZ = j * blockL;
      // X-Axis Traffic (Cross streets)
      for(let k=0; k<2; k++) {
        const offset = (k==0? 10 : -10);
        for(let c=0; c<5; c++) {
            spawnCar((Math.random()*mapSizeX*2)-mapSizeX, laneZ + offset, 'x', 0.5 + Math.random()*0.3);
        }
      }
  }

  // --- 6. PLAYER CAR ---
  const car = new THREE.Group();
  const cBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, 5), new THREE.MeshStandardMaterial({ color: 0xff0055 }));
  cBody.position.y = 0.6;
  car.add(cBody);
  scene.add(car);

  // --- 7. GAME LOOP ---
  let speed = 0;
  let angle = 0;
  let velocity = new THREE.Vector3();
  const keys = {};

  window.addEventListener('keydown', e => keys[e.code] = true);
  window.addEventListener('keyup', e => keys[e.code] = false);

  function animate() {
    requestAnimationFrame(animate);

    // Traffic Lights
    intersections.forEach(int => {
        int.timer++;
        if (int.timer > 400) { // Slower lights for bigger blocks
            int.timer = 0;
            int.state = int.state === 'green' ? 'red' : 'green';
            if (int.state === 'red') {
                int.obj.rM.color.setHex(0xff0000); int.obj.gM.color.setHex(0x330000);
            } else {
                int.obj.rM.color.setHex(0x330000); int.obj.gM.color.setHex(0x00ff00);
            }
        }
    });

    // Traffic Movement
    traffic.forEach(t => {
        if (!t.stopped) {
            if (t.axis === 'x') t.mesh.position.x += t.currentSpeed;
            else t.mesh.position.z += t.currentSpeed;
        }
        // Wrap around larger map
        if (Math.abs(t.mesh.position.x) > mapSizeX + 200) t.mesh.position.x *= -1;
        if (Math.abs(t.mesh.position.z) > mapSizeZ + 200) t.mesh.position.z *= -1;

        t.stopped = false;
        for(let int of intersections) {
            const dist = t.mesh.position.distanceTo(new THREE.Vector3(int.x, 0, int.z));
            if (dist < 60) { // Detect light earlier
                if (t.axis === 'x' && int.state === 'red') t.stopped = true;
                if (t.axis === 'z' && int.state === 'green') t.stopped = true;
            }
        }
    });

    // Player Physics
    if (keys['KeyW'] || keys['ArrowUp']) speed += 0.04;
    if (keys['KeyS'] || keys['ArrowDown']) speed -= 0.04;

    if (Math.abs(speed) > 0.1) {
        const turn = keys['Space'] ? 0.08 : 0.05;
        if (keys['KeyA'] || keys['ArrowLeft']) angle += turn;
        if (keys['KeyD'] || keys['ArrowRight']) angle -= turn;
    }
    speed *= 0.97;
    car.rotation.y = angle;

    const dir = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    velocity.lerp(dir.multiplyScalar(speed), keys['Space'] ? 0.05 : 0.2);

    const nextPos = car.position.clone().add(velocity);
    let hit = false;

    // Collision: Sidewalks (Superblocks)
    for(let b of buildings) {
        const bound = b.bounds;
        if (nextPos.x > bound.minX && nextPos.x < bound.maxX &&
            nextPos.z > bound.minZ && nextPos.z < bound.maxZ) {
            if (Math.abs(speed) > 0.5) hit = true;
            else car.position.y = 0.8;
        }
    }
    // Collision: Cars
    for(let t of traffic) {
        if (nextPos.distanceTo(t.mesh.position) < 5) hit = true;
    }

    if(hit) {
        speed *= -0.5;
        velocity.multiplyScalar(-1);
    }

    car.position.add(velocity);
    if(car.position.y > 0.1) car.position.y *= 0.9;

    // Camera
    const camOffset = new THREE.Vector3(0, 20, -35).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
    camera.position.lerp(car.position.clone().add(camOffset), 0.1);
    camera.lookAt(car.position);

    document.getElementById('speed').innerText = Math.round(Math.abs(speed) * 220) + " KM/H";
    renderer.render(scene, camera);
  }
  animate();
</script>
