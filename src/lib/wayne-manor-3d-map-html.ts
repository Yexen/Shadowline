
export const wayneManor3DMapHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Wayne Manor - Complete Interactive 3D Walkthrough</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Georgia,serif;background:linear-gradient(180deg,#0a0a2e,#16213e);overflow:hidden;cursor:crosshair}
    canvas{display:block}

    #ui{position:absolute;top:20px;left:20px;color:#d4af37;font-size:18px;text-shadow:2px 2px 4px rgba(0,0,0,.9);z-index:100;pointer-events:none;background:rgba(0,0,0,.5);padding:15px;border-radius:10px;border:2px solid #d4af37}
    #instructions{position:absolute;bottom:20px;left:20px;color:#d4af37;font-size:14px;text-shadow:2px 2px 4px rgba(0,0,0,.9);z-index:100;pointer-events:none;background:rgba(0,0,0,.5);padding:10px;border-radius:8px;border:1px solid #d4af37;opacity:.9}

    .room-label{position:absolute;color:#d4af37;font-size:16px;font-weight:700;text-shadow:2px 2px 6px rgba(0,0,0,1);background:rgba(0,0,0,.7);padding:8px 15px;border-radius:12px;border:2px solid #d4af37;pointer-events:none;z-index:50;transition:.3s;backdrop-filter:blur(5px)}
    .room-label.batcave{color:#00ffff;border-color:#00ffff;text-shadow:0 0 10px #00ffff}

    #click-instruction{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#d4af37;font-size:22px;text-align:center;background:rgba(0,0,0,.9);padding:30px;border-radius:15px;border:3px solid #d4af37;z-index:200;cursor:pointer;backdrop-filter:blur(10px);transition:.3s}
    #click-instruction:hover{background:rgba(212,175,55,.1);transform:translate(-50%,-50%) scale(1.05)}

    #interaction-hint{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#d4af37;font-size:18px;text-align:center;background:rgba(0,0,0,.8);padding:20px;border-radius:10px;border:2px solid #d4af37;z-index:150;display:none;pointer-events:none}
    .batcave-hint{color:#00ffff!important;border-color:#00ffff!important;text-shadow:0 0 10px #00ffff!important}

    /* Minimap: no overflow, scroll list */
    #minimap{
      position:absolute;top:20px;right:20px;width:220px;height:180px;
      background:rgba(0,0,0,.8);border:2px solid #d4af37;border-radius:8px;
      z-index:100;pointer-events:none;padding:10px;color:#d4af37;font-size:12px;
      display:flex;flex-direction:column;gap:6px;overflow:hidden;
    }
    .minimap-floor{font-weight:700}
    #minimap-canvas{flex:0 0 90px;width:100%;height:90px;background:rgba(255,255,255,.05);border-radius:4px}
    .minimap-rooms{flex:1;font-size:10px;line-height:1.2;opacity:.9;overflow:auto}
    .current-room{color:#00ffff;font-weight:700}
  </style>
</head>
<body>
  <div id="click-instruction">
    <h2>🏰 Wayne Manor</h2>
    <p><strong>Welcome to the Wayne Estate</strong></p>
    <p>Click to begin your exploration</p>
    <hr style="margin:15px 0;border-color:#d4af37">
    <div style="font-size:14px;line-height:1.4">
      <strong>Controls:</strong><br>
      🎮 <strong>WASD</strong> move · 🖱️ Mouse look · ⚡ <strong>Shift</strong> sprint<br>
      🚀 <strong>Space</strong> jump · 🏷️ <strong>L</strong> labels · 🔓 <strong>ESC</strong> release<br>
      🔁 <strong>Q/E</strong> rotate view (fallback)
    </div>
  </div>

  <div id="interaction-hint"><p id="hint-text">Approach the grandfather clock...</p></div>

  <div id="ui">
    <div><strong>🦇 Wayne Manor</strong></div>
    <div id="location">Outside the Manor</div>
    <div id="floor-indicator">Ground Level</div>
    <div id="time">🌙 Midnight</div>
  </div>

  <div id="instructions">
    <strong>Navigation:</strong> WASD + Mouse | <strong>Actions:</strong> Shift=Sprint, Space=Jump, L=Labels, Q/E=Rotate | <strong>Explore:</strong> Click objects to interact
  </div>

  <div id="minimap">
    <div class="minimap-floor">📍 Current Location</div>
    <canvas id="minimap-canvas" width="200" height="90"></canvas>
    <div id="minimap-content"><div class="minimap-rooms">Loading...</div></div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script>
    // ---------- globals ----------
    let scene, camera, renderer;
    let player = { x: 0, y: 2, z: 35 };
    let velocity = { x: 0, y: 0, z: 0 };
    let keys = {};
    let mouseX = 0, mouseY = 0;
    let isPointerLocked = false;
    let showLabels = true;
    let currentFloor = 0; // 0 ground, 1 second, -1 batcave
    let roomLabels = [];
    let batcaveUnlocked = false;
    let interactiveObjects = [];
    let currentRoom = "Outside";

    function requestLock(el){ (el.requestPointerLock||el.mozRequestPointerLock||el.webkitRequestPointerLock||el.msRequestPointerLock)?.call(el); }
    function exitLock(){ (document.exitPointerLock||document.mozExitPointerLock||document.webkitExitPointerLock||document.msExitPointerLock)?.call(document); }

    const rooms = {
      ground: [
        { name:"Main Entrance", pos:[0,1,18], size:[8,4,6] },
        { name:"Grand Foyer",   pos:[0,1,12], size:[10,4,8] },
        { name:"Study",         pos:[15,1,8], size:[12,4,10] },
        { name:"Library",       pos:[-15,1,8], size:[12,4,10] },
        { name:"Kitchen",       pos:[20,1,-5], size:[10,4,8] },
        { name:"Dining Room",   pos:[0,1,-5], size:[14,4,10] },
        { name:"Ballroom",      pos:[-20,1,-8], size:[16,4,12] },
        { name:"Living Room",   pos:[0,1,2], size:[8,4,6] },
        { name:"Butler's Pantry",pos:[15,1,-12], size:[8,4,6] }
      ],
      second: [
        { name:"Master Suite", pos:[15,8,5], size:[14,4,12] },
        { name:"Alfred's Quarters", pos:[-15,8,8], size:[10,4,8] },
        { name:"Dick's Room", pos:[20,8,-5], size:[8,4,8] },
        { name:"Jason's Room", pos:[-20,8,-5], size:[8,4,8] },
        { name:"Tim's Room", pos:[15,8,-12], size:[8,4,8] },
        { name:"Damian's Room", pos:[-15,8,-12], size:[8,4,8] },
        { name:"Upper Hallway", pos:[0,8,0], size:[6,4,20] },
        { name:"Guest Room", pos:[0,8,-15], size:[8,4,6] }
      ],
      batcave: [
        { name:"Batcomputer", pos:[-25,-8,5], size:[10,4,8] },
        { name:"Vehicle Bay", pos:[0,-8,0], size:[20,4,15] },
        { name:"Trophy Room", pos:[25,-8,5], size:[10,4,8] },
        { name:"Training Area", pos:[0,-8,-20], size:[15,4,10] },
        { name:"Armory", pos:[-25,-8,-15], size:[8,4,6] },
        { name:"Medical Bay", pos:[25,-8,-15], size:[8,4,6] },
        { name:"Cave Entrance", pos:[0,-8,25], size:[8,4,6] }
      ]
    };

    // --- global stub so we never error even if unused
    window.addInteractiveElements = function () { /* interactivity registers itself (clock) */ };

    // ---------- init ----------
    function init(){
      scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x000011,80,300);

      camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
      camera.position.set(player.x, player.y, player.z);

      renderer = new THREE.WebGLRenderer({antialias:true});
      renderer.setSize(innerWidth, innerHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setClearColor(0x000011);
      document.body.appendChild(renderer.domElement);

      setupLighting();
      buildExterior();
      buildManor();
      buildBatcave();
      addInteractiveElements();  // harmless stub
      setupRoomLabels();
      setupEventListeners();

      updateMinimap();
      animate();
    }

    // ---------- lighting ----------
    function setupLighting(){
      scene.add(new THREE.AmbientLight(0x404080,0.8));

      const moon = new THREE.DirectionalLight(0xaaaaff,1.5);
      moon.position.set(100,150,50);
      moon.castShadow = true;
      moon.shadow.mapSize.width = moon.shadow.mapSize.height = 2048;
      Object.assign(moon.shadow.camera,{near:.5,far:500,left:-100,right:100,top:100,bottom:-100});
      scene.add(moon);

      const fill = new THREE.DirectionalLight(0xffd700,0.8);
      fill.position.set(-50,100,-50);
      scene.add(fill);

      addPointLight(0,6,15,0xffd700,3,60);
      addPointLight(15,4,8,0xffd700,2.5,50);
      addPointLight(-20,6,-8,0xffd700,3.5,70);
      addPointLight(0,12,0,0xffd700,2,50);

      addPointLight(-25,-3,5,0x00ddff,4,80);
      addPointLight(0,-3,0,0x0088ff,3.5,70);
      addPointLight(0,10,30,0xffaa00,1.5,30);
      addPointLight(0,-3,-20,0x0066cc,2.5,60);
    }
    function addPointLight(x,y,z,color,intensity,distance){
      const l = new THREE.PointLight(color,intensity,distance);
      l.position.set(x,y,z);
      l.castShadow = true;
      l.shadow.mapSize.width = l.shadow.mapSize.height = 512;
      l.userData.baseIntensity = intensity;
      scene.add(l);
    }

    // ---------- exterior/manor ----------
    function buildExterior(){
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(400,400),
        new THREE.MeshLambertMaterial({color:0x1a4d1a,transparent:true,opacity:.9}));
      ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; scene.add(ground);

      const driveway = new THREE.Mesh(new THREE.PlaneGeometry(60,8), new THREE.MeshLambertMaterial({color:0x666}));
      driveway.rotation.x = -Math.PI/2; driveway.position.set(0,.05,45); driveway.receiveShadow = true; scene.add(driveway);

      const stairMat = new THREE.MeshLambertMaterial({color:0x888});
      for(let i=0;i<5;i++){
        const step = new THREE.Mesh(new THREE.BoxGeometry(12,.4,2), stairMat);
        step.position.set(0, .2+i*.4, 25-i);
        step.castShadow = step.receiveShadow = true;
        scene.add(step);
      }

      addTrees();

      const foundation = new THREE.Mesh(new THREE.BoxGeometry(80,2,60), new THREE.MeshLambertMaterial({color:0x5a5a5a}));
      foundation.position.set(0,1,0); foundation.castShadow = foundation.receiveShadow = true; scene.add(foundation);
    }
    function addTrees(){
      const trunkMat = new THREE.MeshLambertMaterial({color:0x4a3728});
      const leafMat  = new THREE.MeshLambertMaterial({color:0x2d5a2d});
      [[-50,30],[50,30],[-40,-30],[40,-30],[-60,0],[60,0],[-35,50],[35,50]].forEach(([x,z])=>{
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1,1.5,8,8), trunkMat);
        trunk.position.set(x,4,z); trunk.castShadow = true; scene.add(trunk);
        const leaves = new THREE.Mesh(new THREE.SphereGeometry(6,8,6), leafMat);
        leaves.position.set(x,10,z); leaves.castShadow = true; scene.add(leaves);
      });
    }

    function buildManor(){
      buildGroundFloor();
      buildSecondFloor();
      buildStaircases();
      addDetailedFurniture();
    }
    function buildGroundFloor(){
      const wallMat = new THREE.MeshLambertMaterial({color:0x8B6914});
      const floorMat = new THREE.MeshLambertMaterial({color:0x654321});

      const floor = new THREE.Mesh(new THREE.BoxGeometry(80,.5,60), floorMat);
      floor.position.set(0,2,0); floor.receiveShadow = true; scene.add(floor);

      createDetailedWall(-40,5,0,1,8,60,wallMat);
      createDetailedWall(40,5,0,1,8,60,wallMat);
      createDetailedWall(0,5,-30,80,8,1,wallMat);
      createDetailedWall(0,8,30,80,4,1,wallMat);

      createWall(-20,5,30,40,8,1,wallMat);
      createWall(20,5,30,40,8,1,wallMat);

      createWall(8,5,15,1,8,10,wallMat);
      createWall(-8,5,15,1,8,10,wallMat);
      createWall(25,5,12,1,8,16,wallMat);
      createWall(-25,5,12,1,8,16,wallMat);
      createWall(10,5,-2,20,8,1,wallMat);
      createWall(-10,5,-2,20,8,1,wallMat);

      createDoorway(21,5,8,3,7,1,wallMat);
      createDoorway(-21,5,8,3,7,1,wallMat);
      createDoorway(25,5,-2,3,7,1,wallMat);
      createDoorway(-25,5,-8,3,7,1,wallMat);
    }
    function buildSecondFloor(){
      const wallMat = new THREE.MeshLambertMaterial({color:0x8B6914});
      const floorMat = new THREE.MeshLambertMaterial({color:0x654321});

      const floor = new THREE.Mesh(new THREE.BoxGeometry(70,.5,50), floorMat);
      floor.position.set(0,9,0); floor.receiveShadow = true; scene.add(floor);

      createWall(-35,12,0,1,8,50,wallMat);
      createWall(35,12,0,1,8,50,wallMat);
      createWall(0,12,-25,70,8,1,wallMat);
      createWall(0,12,25,70,8,1,wallMat);

      createWall(8,12,8,1,8,16,wallMat);
      createWall(-8,12,8,1,8,16,wallMat);
      createWall(25,12,-2,1,8,20,wallMat);
      createWall(-25,12,-2,1,8,20,wallMat);
      createWall(10,12,-10,20,8,1,wallMat);
      createWall(-10,12,-10,20,8,1,wallMat);

      createDoorway(25,12,-5,3,7,1,wallMat);
      createDoorway(-25,12,-5,3,7,1,wallMat);
      createDoorway(15,12,-15,3,7,1,wallMat);
      createDoorway(-15,12,-15,3,7,1,wallMat);
    }
    function buildStaircases(){
      const stairMat = new THREE.MeshLambertMaterial({color:0x654321});
      const steps=20, radius=8, cx=35, cz=15;
      for(let i=0;i<steps;i++){
        const a = (i/steps)*Math.PI;
        const x = cx+Math.cos(a)*radius, z = cz+Math.sin(a)*radius, y=2.5+(i/steps)*7;
        const step = new THREE.Mesh(new THREE.BoxGeometry(3,.3,2),stairMat);
        step.position.set(x,y,z); step.rotation.y = a+Math.PI/2; step.castShadow = step.receiveShadow = true; scene.add(step);
      }
      const railMat = new THREE.MeshLambertMaterial({color:0x8B4513});
      for(let i=0;i<steps;i++){
        const a=(i/steps)*Math.PI, x=cx+Math.cos(a)*(radius+1.5), z=cz+Math.sin(a)*(radius+1.5), y=3.5+(i/steps)*7;
        const rail = new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,1,8), railMat);
        rail.position.set(x,y,z); scene.add(rail);
      }
    }

    // ---------- batcave ----------
    function buildBatcave(){
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(120,80), new THREE.MeshLambertMaterial({color:0x1a1a1a}));
      floor.rotation.x = -Math.PI/2; floor.position.y = -10; floor.receiveShadow = true; scene.add(floor);

      const caveMat = new THREE.MeshLambertMaterial({color:0x2F2F2F});
      createWall(-60,-5,0,1,10,80,caveMat);
      createWall(60,-5,0,1,10,80,caveMat);
      createWall(0,-5,-40,120,10,1,caveMat);
      createWall(0,-5,40,120,10,1,caveMat);

      const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(120,80), caveMat);
      ceiling.rotation.x = Math.PI/2; ceiling.position.y = 0; scene.add(ceiling);

      addStalactites();
      buildBatcomputer();
      buildVehicleBay();
      buildTrophyRoom();  // includes T-Rex, Penny, Jason’s memorial
      buildTrainingArea();
      buildSecretStairway();
    }
    function addStalactites(){
      const mat = new THREE.MeshLambertMaterial({color:0x404040});
      for(let i=0;i<40;i++){
        const h=2+Math.random()*8, r=.3+Math.random()*1.2;
        const stal = new THREE.Mesh(new THREE.ConeGeometry(r,h,8), mat);
        stal.position.set((Math.random()-.5)*100, -h/2, (Math.random()-.5)*70);
        stal.castShadow = true; scene.add(stal);
      }
    }
    function buildBatcomputer(){
      const comp = new THREE.Mesh(new THREE.BoxGeometry(12,4,3), new THREE.MeshLambertMaterial({color:0x222222}));
      comp.position.set(-25,-8,5); comp.castShadow = true; scene.add(comp);
      const screenMat = new THREE.MeshLambertMaterial({color:0x00ffff,emissive:0x002222});
      for(let i=-2;i<=2;i++){
        const screen = new THREE.Mesh(new THREE.BoxGeometry(2,1.5,.2), screenMat);
        screen.position.set(-25+i*2.5,-6.5,6.5); scene.add(screen);
      }
      const chair = new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,16), new THREE.MeshLambertMaterial({color:0x444444}));
      chair.position.set(-25,-9,8); scene.add(chair);
    }
    function buildVehicleBay(){
      const platform = new THREE.Mesh(new THREE.CylinderGeometry(12,12,1,32), new THREE.MeshLambertMaterial({color:0x444}));
      platform.position.set(0,-9,0); platform.castShadow = platform.receiveShadow = true; scene.add(platform);

      const car = new THREE.Mesh(new THREE.BoxGeometry(8,2,4), new THREE.MeshLambertMaterial({color:0x000}));
      car.position.set(0,-8,0); car.castShadow = true; scene.add(car);

      const dome = new THREE.Mesh(new THREE.SphereGeometry(2,16,8,0,Math.PI*2,0,Math.PI/2), new THREE.MeshLambertMaterial({color:0x111,transparent:true,opacity:.6}));
      dome.position.set(0,-6.5,0); scene.add(dome);

      const wheelMat = new THREE.MeshLambertMaterial({color:0x222});
      [-3,3].forEach(x=>[-1.5,1.5].forEach(z=>{
        const w = new THREE.Mesh(new THREE.CylinderGeometry(.8,.8,.3,16), wheelMat);
        w.position.set(x,-8.5,z); w.rotation.z = Math.PI/2; scene.add(w);
      }));

      buildBatwing();
      buildBatboat();
    }
    function buildBatwing(){
      const mat = new THREE.MeshLambertMaterial({color:0x1a1a1a});
      const body = new THREE.Mesh(new THREE.BoxGeometry(2,1,6), mat); body.position.set(15,-8,-5); scene.add(body);
      const wing = new THREE.Mesh(new THREE.BoxGeometry(8,.3,3), mat); wing.position.set(15,-7.5,-5); scene.add(wing);
    }
    function buildBatboat(){
      const hull = new THREE.Mesh(new THREE.BoxGeometry(1.5,.8,5), new THREE.MeshLambertMaterial({color:0x2a2a2a}));
      hull.position.set(-15,-8.5,-5); scene.add(hull);
    }

    // ---------- training area ----------
    function buildTrainingArea(){
      const gearMat = new THREE.MeshLambertMaterial({color:0x555});
      const dummy = new THREE.Mesh(new THREE.CylinderGeometry(1,1,3,16), gearMat);
      dummy.position.set(-5,-7.5,-20); scene.add(dummy);
      const bag = new THREE.Mesh(new THREE.CylinderGeometry(.8,.8,2.5,16), new THREE.MeshLambertMaterial({color:0x8B4513}));
      bag.position.set(5,-7.5,-20); scene.add(bag);
      const weights = new THREE.Mesh(new THREE.BoxGeometry(4,1,2), gearMat);
      weights.position.set(0,-8.5,-25); scene.add(weights);
    }

    // ---------- slimmed-down batcave icons ----------
    function buildTRex(){
      const green = new THREE.MeshLambertMaterial({ color: 0x2e8b57 });

      // body
      const body = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 16), green);
      body.position.set(22, -6.5, 6);
      scene.add(body);

      // head
      const head = new THREE.Mesh(new THREE.BoxGeometry(5, 4, 5), green);
      head.position.set(27, -4.5, 11);
      scene.add(head);

      // tail
      const tail = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 10), green);
      tail.position.set(16, -6.5, 0);
      scene.add(tail);

      // legs
      [[20.5, -8.5, 8],[23.5, -8.5, 8]].forEach(([x,y,z])=>{
        const leg = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 3), green);
        leg.position.set(x,y,z); scene.add(leg);
      });

      // glowing eye + helper light
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.5,12,12),
                    new THREE.MeshLambertMaterial({ color: 0xffff66, emissive: 0x333300 }));
      eye.position.set(28.7, -3.6, 12.5);
      scene.add(eye);

      const rim = new THREE.PointLight(0x66ff99, 0.6, 20);
      rim.position.set(26, -2.5, 12);
      scene.add(rim);
    }
    function buildGiantPenny(){
      const bronze = new THREE.MeshLambertMaterial({ color: 0xcd7f32 });

      // coin (vertical), a bit below ceiling (y=0)
      const coin = new THREE.Mesh(new THREE.CylinderGeometry(6,6,0.5,32), bronze);
      coin.position.set(30, -5.5, 5);
      coin.rotation.y = Math.PI / 4;
      coin.userData.swing = true; // mark for sway
      scene.add(coin);

      // cable from ceiling down to coin
      const length = 0 - coin.position.y;
      const cable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, Math.max(0.1, Math.abs(length)), 8),
        new THREE.MeshLambertMaterial({ color: 0xaaaaaa })
      );
      cable.position.set(coin.position.x, coin.position.y + length/2, coin.position.z);
      scene.add(cable);
      coin.userData.cable = cable;

      // warm accent light
      const light = new THREE.PointLight(0xffa54f, 0.8, 18);
      light.position.set(30, -3, 5);
      scene.add(light);
    }
    function buildJasonMemorial(){
      const caseMat = new THREE.MeshLambertMaterial({color:0x00ff00,transparent:true,opacity:.2,emissive:0x001100});
      const glass = new THREE.Mesh(new THREE.BoxGeometry(2.5,6,2.5), caseMat); glass.position.set(24,-6,-2); scene.add(glass);
      const torso = new THREE.Mesh(new THREE.BoxGeometry(1.5,2.5,1), new THREE.MeshLambertMaterial({color:0xff0000})); torso.position.set(24,-6,-2); scene.add(torso);
      const legs = new THREE.Mesh(new THREE.BoxGeometry(1.5,2,1), new THREE.MeshLambertMaterial({color:0x0000ff})); legs.position.set(24,-7.5,-2); scene.add(legs);
      const head = new THREE.Mesh(new THREE.SphereGeometry(.6,12,12), new THREE.MeshLambertMaterial({color:0xffff00})); head.position.set(24,-3.5,-2); scene.add(head);
      const glow = new THREE.PointLight(0x33ff66,.6,15); glow.position.set(24,-3,-2); scene.add(glow);
    }

    // ---------- trophy room ----------
    function buildTrophyRoom(){
      const caseMat = new THREE.MeshLambertMaterial({color:0x444,transparent:true,opacity:.8});
      for(let i=0;i<5;i++){
        const cabinet = new THREE.Mesh(new THREE.BoxGeometry(2,4,1), caseMat);
        cabinet.position.set(20+i*2.5, -6, 8); scene.add(cabinet);
        const orb = new THREE.Mesh(new THREE.SphereGeometry(.3,8,6), new THREE.MeshLambertMaterial({color:0xffd700}));
        orb.position.set(20+i*2.5, -6, 7.5); scene.add(orb);
      }
      buildTRex();
      buildGiantPenny();
      buildJasonMemorial();
    }

    // ---------- secret stair ----------
    function buildSecretStairway(){
      const mat = new THREE.MeshLambertMaterial({color:0x333});
      const steps=25, r=4, cx=15, cz=8;
      for(let i=0;i<steps;i++){
        const a=(i/steps)*Math.PI*1.5;
        const x=cx+Math.cos(a)*r, z=cz+Math.sin(a)*r, y=2-(i/steps)*12;
        const s = new THREE.Mesh(new THREE.BoxGeometry(2,.3,1.5), mat);
        s.position.set(x,y,z); s.rotation.y = a+Math.PI/2; s.castShadow = true; scene.add(s);
      }
    }

    // ---------- furniture ----------
    function addDetailedFurniture(){
      const wood = new THREE.MeshLambertMaterial({color:0x8B4513});
      const fabric = new THREE.MeshLambertMaterial({color:0x654321});

      addDesk(18,2.5,5,wood);
      addBookshelf(12,3,12,wood);
      addBookshelf(12,3,4,wood);
      addChair(16,2,5,fabric);
      createGrandfatherClock();

      addBookshelf(-18,3,12,wood);
      addBookshelf(-12,3,12,wood);
      addBookshelf(-18,3,4,wood);
      addReadingTable(-15,2.5,8,wood);
      addChair(-13,2,8,fabric);
      addChair(-17,2,8,fabric);

      addCounters();
      addRefrigerator(25,3,-8,new THREE.MeshLambertMaterial({color:0xeee}));

      addDiningTable(0,2.5,-5,wood);
      addDiningChairs();

      addPiano(-25,2.5,-12,new THREE.MeshLambertMaterial({color:0x000}));
      addChandelier(-20,7,-8);

      addBedroomFurniture();
    }
    function addDesk(x,y,z,mat){ const m=new THREE.Mesh(new THREE.BoxGeometry(4,1.5,2.5),mat); m.position.set(x,y,z); m.castShadow=true; scene.add(m); }
    function addBookshelf(x,y,z,mat){
      const shelf=new THREE.Mesh(new THREE.BoxGeometry(1,5,8),mat); shelf.position.set(x,y,z); shelf.castShadow=true; scene.add(shelf);
      for(let i=0;i<20;i++){
        const b=new THREE.Mesh(new THREE.BoxGeometry(.2,2+Math.random(),.8+Math.random()*.4), new THREE.MeshLambertMaterial({color:Math.random()*0xffffff}));
        b.position.set(x+.4, 2+Math.random()*2, z-3+(i%10)*.6); scene.add(b);
      }
    }
    function addChair(x,y,z,mat){
      const seat=new THREE.Mesh(new THREE.BoxGeometry(1,.3,1),mat); seat.position.set(x,y,z); scene.add(seat);
      const back=new THREE.Mesh(new THREE.BoxGeometry(1,2,.2),mat); back.position.set(x,y+1,z-.4); scene.add(back);
      [-.4,.4].forEach(dx=>[-.4,.4].forEach(dz=>{
        const leg=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,1.5,8), new THREE.MeshLambertMaterial({color:0x654321}));
        leg.position.set(x+dx,y-.75,z+dz); scene.add(leg);
      }));
    }
    function addReadingTable(x,y,z,mat){ const t=new THREE.Mesh(new THREE.BoxGeometry(3,.3,6),mat); t.position.set(x,y,z); scene.add(t); }
    function addCounters(){
      const mat=new THREE.MeshLambertMaterial({color:0x8B7355});
      const c1=new THREE.Mesh(new THREE.BoxGeometry(8,1.5,2),mat); c1.position.set(24,2.5,-2); scene.add(c1);
      const c2=new THREE.Mesh(new THREE.BoxGeometry(2,1.5,6),mat); c2.position.set(27,2.5,-6); scene.add(c2);
    }
    function addRefrigerator(x,y,z,mat){ const f=new THREE.Mesh(new THREE.BoxGeometry(2,4,2),mat); f.position.set(x,y,z); f.castShadow=true; scene.add(f); }
    function addDiningTable(x,y,z,mat){
      const t=new THREE.Mesh(new THREE.BoxGeometry(10,.4,4),mat); t.position.set(x,y,z); t.castShadow=true; scene.add(t);
      [-4,4].forEach(dx=>[-1.5,1.5].forEach(dz=>{
        const leg=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,2.5,16),mat); leg.position.set(x+dx,y-1.25,z+dz); scene.add(leg);
      }));
    }
    function addDiningChairs(){ const cmat=new THREE.MeshLambertMaterial({color:0x654321}); [[-4,2,-7],[0,2,-7],[4,2,-7],[-4,2,-3],[4,2,-3],[-2,2,-7],[2,2,-7]].forEach(p=>addChair(p[0],p[1],p[2],cmat)); }
    function addPiano(x,y,z,mat){ const body=new THREE.Mesh(new THREE.BoxGeometry(3,2,1.5),mat); body.position.set(x,y,z); body.castShadow=true; scene.add(body); const keys=new THREE.Mesh(new THREE.BoxGeometry(2.5,.2,.8), new THREE.MeshLambertMaterial({color:0xffffff})); keys.position.set(x,y+1,z+.5); scene.add(keys); const bench=new THREE.Mesh(new THREE.BoxGeometry(2,.3,1),mat); bench.position.set(x,y-.5,z+2); scene.add(bench); }
    function addChandelier(x,y,z){
      const mat=new THREE.MeshLambertMaterial({color:0xffd700,emissive:0x221100});
      const center=new THREE.Mesh(new THREE.SphereGeometry(.5,16,8),mat); center.position.set(x,y,z); scene.add(center);
      for(let i=0;i<6;i++){
        const a=(i/6)*Math.PI*2, ax=x+Math.cos(a)*1.5, az=z+Math.sin(a)*1.5;
        const arm=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.8,6),mat); arm.position.set(ax,y-.4,az); scene.add(arm);
        const candle=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.4,6), new THREE.MeshLambertMaterial({color:0xfffacd})); candle.position.set(ax,y-.6,az); scene.add(candle);
      }
    }
    function addBedroomFurniture(){
      const wood=new THREE.MeshLambertMaterial({color:0x8B4513});
      const bedMat=new THREE.MeshLambertMaterial({color:0x4a4a4a});
      addBed(18,9,8,wood,bedMat); addWardrobe(12,10,2,wood); addDesk(18,9.5,2,wood);
      addBed(-18,9,11,wood,bedMat); addWardrobe(-12,10,5,wood);
      addBed(23,9,-2,wood,bedMat); addDesk(17,9.5,-2,wood);
      addBed(-23,9,-2,wood,bedMat); addWardrobe(-17,10,-5,wood);
      addBed(18,9,-15,wood,bedMat); addDesk(12,9.5,-15,wood);
      addBed(-18,9,-15,wood,bedMat); addWardrobe(-12,10,-12,wood);
    }
    function addBed(x,y,z,frame,bed){ const f=new THREE.Mesh(new THREE.BoxGeometry(3,1,5),frame); f.position.set(x,y,z); scene.add(f); const m=new THREE.Mesh(new THREE.BoxGeometry(2.8,.5,4.8),bed); m.position.set(x,y+.75,z); scene.add(m); const h=new THREE.Mesh(new THREE.BoxGeometry(3,2,.3),frame); h.position.set(x,y+1.5,z-2.5); scene.add(h); }
    function addWardrobe(x,y,z,mat){ const w=new THREE.Mesh(new THREE.BoxGeometry(1.5,4,3),mat); w.position.set(x,y,z); w.castShadow=true; scene.add(w); }
    function createGrandfatherClock(){
      const body=new THREE.Mesh(new THREE.BoxGeometry(1.2,7,.8), new THREE.MeshLambertMaterial({color:0x4A2C17}));
      body.position.set(21,5.5,12); body.castShadow=true; scene.add(body);
      const face=new THREE.Mesh(new THREE.CylinderGeometry(.8,.8,.1,32), new THREE.MeshLambertMaterial({color:0xffffff}));
      face.rotation.x=Math.PI/2; face.position.set(21,7,12.5); scene.add(face);
      const hr=new THREE.Mesh(new THREE.BoxGeometry(.05,.4,.02), new THREE.MeshLambertMaterial({color:0x000})); hr.position.set(21,7,12.6); scene.add(hr);
      const min=new THREE.Mesh(new THREE.BoxGeometry(.03,.6,.02), new THREE.MeshLambertMaterial({color:0x000})); min.position.set(21,7,12.6); scene.add(min);
      interactiveObjects.push({mesh:body,type:'grandfatherClock',position:{x:21,y:5.5,z:12},activated:false});
    }

    // ---------- walls/openings ----------
    function createWall(x,y,z,w,h,d,mat){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); m.castShadow=m.receiveShadow=true; scene.add(m); }
    function createDetailedWall(x,y,z,w,h,d,mat){ createWall(x,y,z,w,h,d,mat); if(Math.abs(x)>35||Math.abs(z)>25) addWindows(x,y,z,w,h,d); }
    function addWindows(x,y,z,w,h,d){
      const winMat=new THREE.MeshLambertMaterial({color:0x87CEEB,transparent:true,opacity:.6});
      const count=Math.floor(Math.max(w,d)/8);
      for(let i=0;i<count;i++){
        const pane=new THREE.Mesh(new THREE.BoxGeometry(2,3,.2),winMat);
        if(w>d) pane.position.set(x-w/2+(i+1)*w/(count+1), y+1, z);
        else    pane.position.set(x, y+1, z-d/2+(i+1)*d/(count+1));
        scene.add(pane);
      }
    }
    function createDoorway(x,y,z,w,h,d,mat){
      const fw=.3, dw=w-fw*2;
      createWall(x-w/2+fw/2,y,z,fw,h,d,mat);
      createWall(x+w/2-fw/2,y,z,fw,h,d,mat);
      createWall(x, y+h/2-fw/2, z, dw, fw, d, mat);
    }

    // ---------- labels ----------
    function setupRoomLabels(){
      const all=[...rooms.ground.map(r=>({...r,floor:0})),...rooms.second.map(r=>({...r,floor:1})),...rooms.batcave.map(r=>({...r,floor:-1}))];
      all.forEach(room=>{
        const el=document.createElement('div');
        el.className='room-label'; if(room.floor===-1) el.classList.add('batcave');
        el.textContent=room.name; el.style.display='none'; document.body.appendChild(el);
        roomLabels.push({element:el,position:new THREE.Vector3(room.pos[0],room.pos[1]+3,room.pos[2]),room,floor:room.floor});
      });
    }
    function updateRoomLabels(){
      if(!showLabels){ roomLabels.forEach(l=>l.element.style.display='none'); return; }
      roomLabels.forEach(label=>{
        const dist=camera.position.distanceTo(label.position);
        const ok=(currentFloor===label.floor);
        if(dist<25 && ok){
          const p=label.position.clone(); p.project(camera);
          const x=(p.x*.5+.5)*innerWidth, y=(p.y*-.5+.5)*innerHeight;
          if(p.z<1 && x>0 && x<innerWidth && y>0 && y<innerHeight){
            const el=label.element; el.style.display='block';
            el.style.left=Math.max(10,Math.min(innerWidth-200,x))+'px';
            el.style.top=Math.max(10,Math.min(innerHeight-50,y))+'px';
            el.style.opacity=Math.max(.4,Math.min(1,(25-dist)/25));
            el.style.transform=\`scale(\${Math.max(.8,Math.min(1.2,(25-dist)/20+.8))})\`;
          } else label.element.style.display='none';
        } else label.element.style.display='none';
      });
    }

    // ---------- events & input ----------
    function setupEventListeners(){
      const start=document.getElementById('click-instruction');
      start.addEventListener('click',()=>{ start.style.display='none'; requestLock(renderer.domElement); });
      renderer.domElement.addEventListener('mousedown',()=>{ if(!isPointerLocked) requestLock(renderer.domElement); });
      document.addEventListener('pointerlockchange',()=>{ isPointerLocked = (document.pointerLockElement===renderer.domElement); });
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('keydown', onKeyDown);
      document.addEventListener('keyup', onKeyUp);
      window.addEventListener('resize', onWindowResize);
      renderer.domElement.addEventListener('click', onClick);
    }
    function onMouseMove(e){ if(!isPointerLocked) return; mouseX -= e.movementX*0.002; mouseY -= e.movementY*0.002; mouseY = Math.max(-Math.PI/2, Math.min(Math.PI/2, mouseY)); }
    function onKeyDown(e){
      const k=e.key.toLowerCase(); keys[k]=true;
      if(!isPointerLocked){ if(k==='q') mouseX -= 0.05; if(k==='e') mouseX += 0.05; }
      if(k==='l'){ showLabels=!showLabels; updateRoomLabels(); }
      if(e.key==='Escape'){ exitLock(); }
    }
    function onKeyUp(e){ keys[e.key.toLowerCase()] = false; }
    function onClick(){ checkInteractions(); }

    // ---------- interactions ----------
    function checkInteractions(){
      interactiveObjects.forEach(obj=>{
        const d=Math.hypot(player.x-obj.position.x, player.z-obj.position.z);
        if(d<5 && obj.type==='grandfatherClock' && !obj.activated){ activateBatcaveEntrance(); obj.activated=true; }
      });
    }
    function activateBatcaveEntrance(){
      batcaveUnlocked = true;
      const hint=document.getElementById('interaction-hint'), text=document.getElementById('hint-text');
      hint.classList.add('batcave-hint'); text.textContent='🦇 Secret passage revealed! The way to the Batcave is now open...';
      hint.style.display='block'; setTimeout(()=>{ hint.style.display='none'; hint.classList.remove('batcave-hint'); },4000);

      const entrance = new THREE.Mesh(new THREE.BoxGeometry(2.5,6,1), new THREE.MeshLambertMaterial({color:0x000,transparent:true,opacity:.9}));
      entrance.position.set(21,3,11); scene.add(entrance);
      const glow = new THREE.Mesh(new THREE.BoxGeometry(3,7,1.2), new THREE.MeshLambertMaterial({color:0x0ff,emissive:0x001111,transparent:true,opacity:.3}));
      glow.position.set(21,3,11); scene.add(glow);
    }

    // ---------- movement & collisions ----------
    function updateMovement(){
      const base=0.15, speed=base*(keys['shift']?2:1);
      const dir=new THREE.Vector3();
      if(keys['w']||keys['arrowup']) dir.z-=1;
      if(keys['s']||keys['arrowdown']) dir.z+=1;
      if(keys['a']||keys['arrowleft']) dir.x-=1;
      if(keys['d']||keys['arrowright']) dir.x+=1;
      if(dir.length()>0){ dir.normalize().multiplyScalar(speed).applyAxisAngle(new THREE.Vector3(0,1,0), mouseX); }
      velocity.y -= 0.015; if(keys[' '] && Math.abs(velocity.y)<0.1) velocity.y = 0.25;
      player.x += dir.x; player.z += dir.z; player.y += velocity.y;
      checkCollisions(); updateCurrentRoom(); updateFloorTransitions();
      camera.position.set(player.x,player.y,player.z); camera.rotation.set(mouseY,mouseX,0);
    }
    function checkCollisions(){
      let ground=2; if(currentFloor===1) ground=9; else if(currentFloor===-1) ground=-8;
      if(player.y<ground){ player.y=ground; velocity.y=0; }
      const bx=(currentFloor===-1)?55:38, bz=(currentFloor===-1)?35:28;
      player.x=Math.max(-bx,Math.min(bx,player.x)); player.z=Math.max(-bz,Math.min(bz,player.z));
      if(currentFloor===0 && Math.abs(player.x-18)<3 && Math.abs(player.z-5)<2) player.x = (player.x>18)?21:15;
      if(currentFloor===0 && Math.abs(player.x)<6 && Math.abs(player.z+5)<3)   player.z = (player.z>-5)?-2:-8;
    }

    // ---------- floor transitions ----------
    function updateFloorTransitions(){
      const sx=35, sz=15, sd=Math.hypot(player.x-sx, player.z-sz);
      if(sd<12){
        if(currentFloor===0 && player.y>4){ currentFloor=1; player.y=9; showTransitionMessage('🏰 Second Floor - Residential Wing'); }
        else if(currentFloor===1 && player.y<8){ currentFloor=0; player.y=2; showTransitionMessage('🏛️ Ground Floor - Main Level'); }
      }
      if(batcaveUnlocked && Math.abs(player.x-21)<3 && Math.abs(player.z-11)<3 && currentFloor===0){
        currentFloor=-1; player.x=0; player.y=-8; player.z=20; showTransitionMessage('🦇 Entering the Batcave',true);
      }
      if(currentFloor===-1 && player.z>22){ currentFloor=0; player.x=21; player.y=2; player.z=11; showTransitionMessage('🕰️ Returning to Study via Secret Passage'); }
      showTransitionHints();
    }
    function showTransitionMessage(msg,isBat=false){
      const hint=document.getElementById('interaction-hint'), text=document.getElementById('hint-text');
      if(isBat){ hint.classList.add('batcave-hint'); text.textContent=\`🦇 \${msg}\`; } else { text.textContent=\`📍 \${msg}\`; }
      hint.style.display='block'; setTimeout(()=>{ hint.style.display='none'; if(isBat) hint.classList.remove('batcave-hint'); },2500);
    }
    function showTransitionHints(){
      const hint=document.getElementById('interaction-hint'), text=document.getElementById('hint-text');
      const sx=35, sz=15, sd=Math.hypot(player.x-sx, player.z-sz);
      const nearClock=(Math.abs(player.x-21)<4 && Math.abs(player.z-11)<4 && currentFloor===0 && !batcaveUnlocked);
      if(sd<10 && currentFloor!==-1){
        if(hint.style.display!=='block'){ text.textContent='↕ Use the grand staircase to move between floors'; hint.style.display='block'; setTimeout(()=>{ if(hint.style.display==='block') hint.style.display='none'; },1800); }
      } else if(nearClock){
        if(hint.style.display!=='block'){ text.textContent='🕰️ Something about this clock… try clicking it'; hint.style.display='block'; setTimeout(()=>{ if(hint.style.display==='block') hint.style.display='none'; },1800); }
      }
    }

    // ---------- room tracking ----------
    function updateCurrentRoom(){
      let newRoom="Hallway", floorName="Ground Floor";
      if(currentFloor===-1){
        floorName="Batcave Level";
        rooms.batcave.forEach(r=>{ const [rx,,rz]=r.pos,[rw,,rd]=r.size; if(Math.abs(player.x-rx)<rw/2 && Math.abs(player.z-rz)<rd/2) newRoom=r.name; });
      } else if(currentFloor===1){
        floorName="Second Floor";
        rooms.second.forEach(r=>{ const [rx,,rz]=r.pos,[rw,,rd]=r.size; if(Math.abs(player.x-rx)<rw/2 && Math.abs(player.z-rz)<rd/2) newRoom=r.name; });
      } else {
        rooms.ground.forEach(r=>{ const [rx,,rz]=r.pos,[rw,,rd]=r.size; if(Math.abs(player.x-rx)<rw/2 && Math.abs(player.z-rz)<rd/2) newRoom=r.name; });
        if(Math.abs(player.x)>35 || Math.abs(player.z)>25){ newRoom="Manor Grounds"; floorName="Outside"; }
      }
      if(newRoom!==currentRoom){
        currentRoom=newRoom;
        document.getElementById('location').textContent=currentRoom;
        document.getElementById('floor-indicator').textContent=floorName;
        updateMinimap();
        showRoomHints(newRoom);
      }
    }
    function showRoomHints(name){
      const hint=document.getElementById('interaction-hint'), text=document.getElementById('hint-text');
      let msg='', bat=false;
      switch(name){
        case 'Study': if(!batcaveUnlocked) msg='🕰️ There\\'s something mysterious about that grandfather clock...'; break;
        case 'Batcomputer': msg='🖥️ The world\\'s most advanced crime-fighting computer'; bat=true; break;
        case 'Vehicle Bay': msg='🚗 The legendary Batmobile and other vehicles'; bat=true; break;
        case 'Trophy Room': msg='🏆 T-Rex, Giant Penny, and Jason’s memorial stand here'; bat=true; break;
        case 'Master Suite': msg='🛏️ Bruce Wayne\\'s private chambers'; break;
        case 'Library': msg='📚 Thousands of rare books and documents'; break;
        case 'Ballroom': msg='💃 Charity galas echo in this hall'; break;
      }
      if(msg){
        if(bat) hint.classList.add('batcave-hint');
        text.textContent=msg; hint.style.display='block';
        setTimeout(()=>{ hint.style.display='none'; if(bat) hint.classList.remove('batcave-hint'); },3000);
      }
    }

    // ---------- minimap ----------
    function updateMinimap(){
      const content=document.getElementById('minimap-content'); if(!content) return;
      let floorName='Ground Floor', list=rooms.ground;
      if(currentFloor===1){ floorName='Second Floor'; list=rooms.second; }
      if(currentFloor===-1){ floorName='Batcave Level'; list=rooms.batcave; }
      content.innerHTML = \`
        <div style="font-weight:bold;margin-bottom:6px;">\${floorName}</div>
        <div class="minimap-rooms">
          \${list.map(r=>\`<div class="\${r.name===currentRoom?'current-room':''}">• \${r.name}</div>\`).join('')}
        </div>\`;
    }
    function drawMinimapDot(){
      const cnv=document.getElementById('minimap-canvas'); if(!cnv) return;
      const ctx=cnv.getContext('2d'); if(!ctx) return;
      const w=cnv.width,h=cnv.height;
      ctx.clearRect(0,0,w,h);
      const b=(currentFloor===-1)?{xMin:-55,xMax:55,zMin:-35,zMax:35}:{xMin:-38,xMax:38,zMin:-28,zMax:28};
      ctx.globalAlpha=.9; ctx.strokeStyle='#d4af37'; ctx.lineWidth=2; ctx.strokeRect(1,1,w-2,h-2);
      const mapX=(player.x-b.xMin)/(b.xMax-b.xMin)*(w-8)+4;
      const mapZ=(player.z-b.zMin)/(b.zMax-b.zMin)*(h-8)+4;
      ctx.fillStyle='rgba(212,175,55,0.08)'; ctx.fillRect(4,4,w-8,h-8);
      const px=Math.max(4,Math.min(w-4,mapX)), pz=Math.max(4,Math.min(h-4,mapZ));
      ctx.beginPath(); ctx.fillStyle=(currentFloor===-1)?'#00ffff':'#ffffff'; ctx.arc(px,pz,3,0,Math.PI*2); ctx.fill();
      const dx=Math.cos(mouseX)*8, dz=Math.sin(mouseX)*8;
      ctx.beginPath(); ctx.moveTo(px,pz); ctx.lineTo(px+dx,pz+dz); ctx.strokeStyle=(currentFloor===-1)?'#00ffff':'#d4af37'; ctx.lineWidth=1.5; ctx.stroke();
    }

    // ---------- window/loop ----------
    function onWindowResize(){ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); }
    function animate(){
      requestAnimationFrame(animate);
      updateMovement();
      updateRoomLabels();
      updateInteractionPrompts();
      animateScene();
      drawMinimapDot();
      renderer.render(scene,camera);
    }
    function updateInteractionPrompts(){
      if(!batcaveUnlocked && currentRoom==='Study'){
        const d=Math.hypot(player.x-21, player.z-12);
        if(d<4){
          const hint=document.getElementById('interaction-hint'), text=document.getElementById('hint-text');
          if(hint.style.display==='none'||hint.style.display===''){ text.textContent='🖱️ Click on the grandfather clock to investigate...'; hint.style.display='block'; setTimeout(()=>{ if(hint.style.display==='block') hint.style.display='none'; },5000); }
        }
      }
    }
    function animateScene(){
      const t=Date.now()*0.001;
      scene.traverse(ch=>{
        if(ch.isPointLight){
          ch.intensity=(ch.userData.baseIntensity||ch.intensity)*(1+Math.sin(t*.5)*.1);
        }
        // sway the Giant Penny (and its cable)
        if(ch.userData && ch.userData.swing){
          ch.rotation.z = Math.sin(t*0.7)*0.05;
          if(ch.userData.cable) ch.userData.cable.rotation.z = ch.rotation.z;
        }
      });
    }

    // ---------- go ----------
    init();
  </script>
</body>
</html>
`
