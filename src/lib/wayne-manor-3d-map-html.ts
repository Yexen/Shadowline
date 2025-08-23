
export const wayneManor3DMapHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wayne Manor - Interactive 3D Walkthrough</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Georgia', serif;
            background: #000;
            overflow: hidden;
            cursor: crosshair;
        }
        
        canvas {
            display: block;
            background: linear-gradient(135deg, #0a0a2e, #16213e);
        }
        
        #ui {
            position: absolute;
            top: 20px;
            left: 20px;
            color: #d4af37;
            font-size: 16px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            z-index: 100;
            pointer-events: none;
        }
        
        #instructions {
            position: absolute;
            bottom: 20px;
            left: 20px;
            color: #d4af37;
            font-size: 14px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            z-index: 100;
            pointer-events: none;
            opacity: 0.8;
        }
        
        .room-label {
            position: absolute;
            color: #d4af37;
            font-size: 18px;
            font-weight: bold;
            text-shadow: 2px 2px 6px rgba(0,0,0,0.9);
            background: rgba(0,0,0,0.3);
            padding: 8px 12px;
            border-radius: 8px;
            border: 2px solid #d4af37;
            pointer-events: none;
            z-index: 50;
            transition: opacity 0.3s ease;
        }
        
        #click-instruction {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #d4af37;
            font-size: 20px;
            text-align: center;
            background: rgba(0,0,0,0.8);
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #d4af37;
            z-index: 200;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div id="click-instruction">
        <h2>🏰 Welcome to Wayne Manor</h2>
        <p>Click anywhere to begin your exploration</p>
        <small>Use mouse to look around • WASD to move • Shift to sprint • Space to jump • L to toggle labels</small>
    </div>
    
    <div id="ui">
        <div>Wayne Manor - Interactive Walkthrough</div>
        <div id="location">Outside Wayne Manor</div>
    </div>
    
    <div id="instructions">
        WASD: Move • Mouse: Look • Shift: Sprint • Space: Jump • L: Toggle Labels • ESC: Release Mouse
    </div>
    
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"><\/script>
    <script>
        let scene, camera, renderer, controls;
        let player = { x: 0, y: 2, z: 30 };
        let velocity = { x: 0, y: 0, z: 0 };
        let keys = {};
        let mouseX = 0, mouseY = 0;
        let isPointerLocked = false;
        let showLabels = true;
        let currentFloor = 0; // 0 = ground, 1 = second, -1 = batcave
        let roomLabels = [];
        let batcaveUnlocked = false;
        
        // Game objects
        let walls = [];
        let floors = [];
        let furniture = [];
        let doors = [];
        let grandFatherClock = null;
        let batcaveEntrance = null;
        
        // Room definitions
        const rooms = {
            ground: [
                { name: "Study", pos: [0, 1, 5], size: [8, 3, 6] },
                { name: "Library", pos: [-15, 1, 0], size: [10, 3, 12] },
                { name: "Kitchen", pos: [15, 1, -5], size: [8, 3, 8] },
                { name: "Dining Room", pos: [0, 1, -10], size: [12, 3, 8] },
                { name: "Ballroom", pos: [-15, 1, -15], size: [15, 3, 12] },
                { name: "Main Hall", pos: [0, 1, 15], size: [6, 3, 4] }
            ],
            second: [
                { name: "Bruce's Suite", pos: [0, 8, 5], size: [10, 3, 8] },
                { name: "Alfred's Quarters", pos: [-12, 8, 0], size: [8, 3, 6] },
                { name: "Dick's Room", pos: [12, 8, 0], size: [6, 3, 6] },
                { name: "Jason's Room", pos: [-12, 8, -10], size: [6, 3, 6] },
                { name: "Tim's Room", pos: [12, 8, -10], size: [6, 3, 6] },
                { name: "Damian's Room", pos: [0, 8, -12], size: [6, 3, 6] }
            ],
            batcave: [
                { name: "Batcomputer", pos: [-20, -8, 0], size: [8, 3, 4] },
                { name: "Vehicle Bay", pos: [0, -8, 0], size: [15, 3, 10] },
                { name: "Trophy Room", pos: [20, -8, 0], size: [8, 3, 6] },
                { name: "Training Area", pos: [0, -8, -15], size: [12, 3, 8] }
            ]
        };

        function init() {
            // Scene setup
            scene = new THREE.Scene();
            scene.fog = new THREE.Fog(0x000011, 50, 200);
            
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(player.x, player.y, player.z);
            
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            renderer.setClearColor(0x000011);
            document.body.appendChild(renderer.domElement);
            
            setupLighting();
            buildManor();
            buildBatcave();
            setupRoomLabels();
            setupEventListeners();
            
            animate();
        }

        function setupLighting() {
            // Ambient light
            const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
            scene.add(ambientLight);
            
            // Moonlight
            const moonlight = new THREE.DirectionalLight(0x9999ff, 0.5);
            moonlight.position.set(50, 100, 50);
            moonlight.castShadow = true;
            moonlight.shadow.mapSize.width = 2048;
            moonlight.shadow.mapSize.height = 2048;
            scene.add(moonlight);
            
            // Manor interior lights
            addPointLight(0, 3, 0, 0xffd700, 1.5); // Main hall
            addPointLight(-15, 3, 0, 0xffd700, 1.2); // Library
            addPointLight(15, 3, -5, 0xffd700, 1.2); // Kitchen
            addPointLight(0, 3, -10, 0xffd700, 1.2); // Dining
            addPointLight(-15, 3, -15, 0xffd700, 1.5); // Ballroom
            
            // Second floor lights
            addPointLight(0, 10, 5, 0xffd700, 1.0); // Bruce's room
            addPointLight(-12, 10, 0, 0xffd700, 0.8); // Alfred's room
            
            // Batcave lighting
            addPointLight(-20, -5, 0, 0x00ffff, 2.0); // Computer area
            addPointLight(0, -5, 0, 0x0080ff, 1.5); // Vehicle bay
            addPointLight(20, -5, 0, 0x00ffff, 1.2); // Trophy room
        }

        function addPointLight(x, y, z, color, intensity) {
            const light = new THREE.PointLight(color, intensity, 50);
            light.position.set(x, y, z);
            light.castShadow = true;
            scene.add(light);
        }

        function buildManor() {
            // Ground
            const groundGeometry = new THREE.PlaneGeometry(200, 200);
            const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x1a4d1a });
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.receiveShadow = true;
            scene.add(ground);
            
            // Manor foundation
            const foundationGeometry = new THREE.BoxGeometry(60, 1, 40);
            const stoneMaterial = new THREE.MeshLambertMaterial({ color: 0x4a4a4a });
            const foundation = new THREE.Mesh(foundationGeometry, stoneMaterial);
            foundation.position.set(0, 0.5, 0);
            scene.add(foundation);
            
            // Build walls and rooms
            buildGroundFloor();
            buildSecondFloor();
            buildStaircase();
            
            // Add furniture
            addFurniture();
            
            // Grandfather clock (Batcave entrance)
            createGrandfatherClock();
        }

        function buildGroundFloor() {
            const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            
            // Outer walls
            createWall(-30, 2.5, 0, 1, 5, 40, wallMaterial); // Left wall
            createWall(30, 2.5, 0, 1, 5, 40, wallMaterial);  // Right wall
            createWall(0, 2.5, -20, 60, 5, 1, wallMaterial); // Back wall
            createWall(0, 2.5, 20, 60, 5, 1, wallMaterial);  // Front wall
            
            // Interior walls
            createWall(-8, 2.5, 8, 1, 5, 8, wallMaterial);   // Study wall
            createWall(8, 2.5, 8, 1, 5, 8, wallMaterial);    // Study wall
            createWall(-8, 2.5, -2, 1, 5, 8, wallMaterial);  // Library wall
            createWall(8, 2.5, -2, 1, 5, 8, wallMaterial);   // Kitchen wall
            
            // Floor
            const floorGeometry = new THREE.PlaneGeometry(60, 40);
            const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
            const floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.rotation.x = -Math.PI / 2;
            floor.position.y = 0.1;
            floor.receiveShadow = true;
            scene.add(floor);
        }

        function buildSecondFloor() {
            const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            
            // Second floor platform
            const floorGeometry = new THREE.BoxGeometry(50, 0.5, 35);
            const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
            const secondFloor = new THREE.Mesh(floorGeometry, floorMaterial);
            secondFloor.position.set(0, 6, 0);
            scene.add(secondFloor);
            
            // Second floor walls
            createWall(-25, 9.5, 0, 1, 5, 35, wallMaterial);
            createWall(25, 9.5, 0, 1, 5, 35, wallMaterial);
            createWall(0, 9.5, -17.5, 50, 5, 1, wallMaterial);
            createWall(0, 9.5, 17.5, 50, 5, 1, wallMaterial);
            
            // Room dividers
            createWall(-6, 9.5, 5, 1, 5, 6, wallMaterial);
            createWall(6, 9.5, 5, 1, 5, 6, wallMaterial);
            createWall(-6, 9.5, -5, 1, 5, 6, wallMaterial);
            createWall(6, 9.5, -5, 1, 5, 6, wallMaterial);
        }

        function buildStaircase() {
            const stairMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
            
            // Main staircase
            for (let i = 0; i < 12; i++) {
                const step = new THREE.BoxGeometry(4, 0.3, 1);
                const stepMesh = new THREE.Mesh(step, stairMaterial);
                stepMesh.position.set(25, 0.5 + i * 0.5, 10 - i * 0.8);
                scene.add(stepMesh);
            }
        }

        function buildBatcave() {
            // Cave walls
            const caveMaterial = new THREE.MeshLambertMaterial({ color: 0x2F2F2F });
            
            // Cave floor
            const caveFloorGeometry = new THREE.PlaneGeometry(80, 50);
            const caveFloorMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
            const caveFloor = new THREE.Mesh(caveFloorGeometry, caveFloorMaterial);
            caveFloor.rotation.x = -Math.PI / 2;
            caveFloor.position.y = -10;
            scene.add(caveFloor);
            
            // Cave walls
            createWall(-40, -7, 0, 1, 6, 50, caveMaterial);
            createWall(40, -7, 0, 1, 6, 50, caveMaterial);
            createWall(0, -7, -25, 80, 6, 1, caveMaterial);
            createWall(0, -7, 25, 80, 6, 1, caveMaterial);
            
            // Stalactites
            for (let i = 0; i < 20; i++) {
                const stalactite = new THREE.ConeGeometry(0.5 + Math.random() * 1.5, 2 + Math.random() * 4, 8);
                const stalactiteMesh = new THREE.Mesh(stalactite, caveMaterial);
                stalactiteMesh.position.set(
                    (Math.random() - 0.5) * 70,
                    -4 + Math.random() * 2,
                    (Math.random() - 0.5) * 40
                );
                scene.add(stalactiteMesh);
            }
            
            // Batcomputer
            const computerGeometry = new THREE.BoxGeometry(6, 3, 2);
            const computerMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
            const computer = new THREE.Mesh(computerGeometry, computerMaterial);
            computer.position.set(-20, -8.5, 0);
            scene.add(computer);
            
            // Batmobile platform
            const platformGeometry = new THREE.CylinderGeometry(8, 8, 0.5, 16);
            const platformMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
            const platform = new THREE.Mesh(platformGeometry, platformMaterial);
            platform.position.set(0, -9.5, 0);
            scene.add(platform);
            
            // Simple Batmobile
            const batmobileGeometry = new THREE.BoxGeometry(6, 1.5, 3);
            const batmobileMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
            const batmobile = new THREE.Mesh(batmobileGeometry, batmobileMaterial);
            batmobile.position.set(0, -8.5, 0);
            scene.add(batmobile);
        }

        function createWall(x, y, z, width, height, depth, material) {
            const wallGeometry = new THREE.BoxGeometry(width, height, depth);
            const wall = new THREE.Mesh(wallGeometry, material);
            wall.position.set(x, y, z);
            wall.castShadow = true;
            wall.receiveShadow = true;
            scene.add(wall);
            walls.push({ mesh: wall, bounds: { x, y, z, width, height, depth } });
        }

        function addFurniture() {
            const furnitureMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            
            // Study furniture
            addBox(2, 1, 8, 3, 2, 1, furnitureMaterial); // Desk
            addBox(-3, 1, 6, 1, 2, 4, furnitureMaterial); // Bookshelf
            
            // Library furniture
            addBox(-18, 1, -2, 1, 2, 8, furnitureMaterial); // Bookshelf
            addBox(-12, 1, -2, 1, 2, 8, furnitureMaterial); // Bookshelf
            
            // Kitchen furniture
            addBox(18, 1, -8, 4, 2, 1, furnitureMaterial); // Counter
            
            // Dining room
            addBox(0, 1, -10, 6, 1.5, 3, furnitureMaterial); // Table
            
            // Second floor bedrooms
            addBox(-2, 8.5, 8, 2, 1, 4, furnitureMaterial); // Bruce's bed
            addBox(-15, 8.5, 2, 2, 1, 3, furnitureMaterial); // Alfred's bed
            addBox(14, 8.5, 2, 2, 1, 3, furnitureMaterial); // Dick's bed
        }

        function addBox(x, y, z, width, height, depth, material) {
            const geometry = new THREE.BoxGeometry(width, height, depth);
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x, y, z);
            mesh.castShadow = true;
            scene.add(mesh);
            furniture.push({ mesh, bounds: { x, y, z, width, height, depth } });
        }

        function createGrandfatherClock() {
            const clockMaterial = new THREE.MeshLambertMaterial({ color: 0x4A4A4A });
            const clockGeometry = new THREE.BoxGeometry(1, 6, 0.5);
            grandFatherClock = new THREE.Mesh(clockGeometry, clockMaterial);
            grandFatherClock.position.set(-2, 3, 11);
            grandFatherClock.castShadow = true;
            scene.add(grandFatherClock);
            
            // Secret entrance marker
            batcaveEntrance = { x: -2, y: 3, z: 11, activated: false };
        }

        function setupRoomLabels() {
            // Create labels for all rooms
            [...rooms.ground, ...rooms.second, ...rooms.batcave].forEach((room, index) => {
                const labelDiv = document.createElement('div');
                labelDiv.className = 'room-label';
                labelDiv.textContent = room.name;
                labelDiv.style.display = 'none';
                document.body.appendChild(labelDiv);
                
                roomLabels.push({
                    element: labelDiv,
                    position: new THREE.Vector3(room.pos[0], room.pos[1] + 2, room.pos[2]),
                    room: room,
                    floor: index < 6 ? 0 : (index < 12 ? 1 : -1)
                });
            });
        }

        function updateRoomLabels() {
            if (!showLabels) {
                roomLabels.forEach(label => label.element.style.display = 'none');
                return;
            }
            
            roomLabels.forEach(label => {
                const distance = camera.position.distanceTo(label.position);
                const onCorrectFloor = (currentFloor === label.floor);
                
                if (distance < 15 && onCorrectFloor) {
                    // Project 3D position to screen
                    const screenPosition = label.position.clone();
                    screenPosition.project(camera);
                    
                    const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
                    const y = (screenPosition.y * -0.5 + 0.5) * window.innerHeight;
                    
                    // Check if behind camera
                    if (screenPosition.z < 1) {
                        label.element.style.display = 'block';
                        label.element.style.left = x + 'px';
                        label.element.style.top = y + 'px';
                        label.element.style.opacity = Math.max(0.3, 1 - distance / 15);
                    } else {
                        label.element.style.display = 'none';
                    }
                } else {
                    label.element.style.display = 'none';
                }
            });
        }

        function setupEventListeners() {
            // Pointer lock
            document.getElementById('click-instruction').addEventListener('click', () => {
                document.getElementById('click-instruction').style.display = 'none';
                renderer.domElement.requestPointerLock();
            });
            
            document.addEventListener('pointerlockchange', () => {
                isPointerLocked = document.pointerLockElement === renderer.domElement;
            });
            
            // Mouse movement
            document.addEventListener('mousemove', onMouseMove);
            
            // Keyboard
            document.addEventListener('keydown', onKeyDown);
            document.addEventListener('keyup', onKeyUp);
            
            // Window resize
            window.addEventListener('resize', onWindowResize);
            
            // Mouse click for interactions
            renderer.domElement.addEventListener('click', onClick);
        }

        function onMouseMove(event) {
            if (!isPointerLocked) return;
            
            mouseX -= event.movementX * 0.002;
            mouseY -= event.movementY * 0.002;
            mouseY = Math.max(-Math.PI/2, Math.min(Math.PI/2, mouseY));
        }

        function onKeyDown(event) {
            keys[event.key.toLowerCase()] = true;
            
            if (event.key.toLowerCase() === 'l') {
                showLabels = !showLabels;
            }
            
            if (event.key === 'Escape') {
                document.exitPointerLock();
            }
        }

        function onKeyUp(event) {
            keys[event.key.toLowerCase()] = false;
        }

        function onClick() {
            if (!isPointerLocked) return;
            
            // Check if clicking on grandfather clock
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
            
            const clockDistance = camera.position.distanceTo(new THREE.Vector3(-2, 3, 11));
            if (clockDistance < 5 && !batcaveUnlocked) {
                batcaveUnlocked = true;
                document.getElementById('location').textContent = "Secret passage revealed!";
                
                // Create visible entrance
                const entranceGeometry = new THREE.BoxGeometry(2, 3, 1);
                const entranceMaterial = new THREE.MeshLambertMaterial({ 
                    color: 0x000000,
                    transparent: true,
                    opacity: 0.8 
                });
                const entrance = new THREE.Mesh(entranceGeometry, entranceMaterial);
                entrance.position.set(-2, 1.5, 10.5);
                scene.add(entrance);
            }
        }

        function updateMovement() {
            const speed = keys['shift'] ? 0.3 : 0.15;
            
            // Calculate movement direction
            const direction = new THREE.Vector3();
            
            if (keys['w'] || keys['arrowup']) direction.z -= 1;
            if (keys['s'] || keys['arrowdown']) direction.z += 1;
            if (keys['a'] || keys['arrowleft']) direction.x -= 1;
            if (keys['d'] || keys['arrowright']) direction.x += 1;
            
            // Normalize diagonal movement
            if (direction.length() > 0) {
                direction.normalize();
                direction.multiplyScalar(speed);
                
                // Apply camera rotation to movement
                direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), mouseX);
            }
            
            // Apply gravity
            velocity.y -= 0.02;
            
            // Jump
            if (keys[' '] && Math.abs(velocity.y) < 0.1) {
                velocity.y = 0.3;
            }
            
            // Update position
            player.x += direction.x;
            player.z += direction.z;
            player.y += velocity.y;
            
            // Collision detection and floor boundaries
            checkCollisions();
            updateFloor();
            
            // Update camera
            camera.position.set(player.x, player.y, player.z);
            camera.rotation.set(mouseY, mouseX, 0);
        }

        function checkCollisions() {
            // Simple ground collision
            if (currentFloor === 0 && player.y < 2) {
                player.y = 2;
                velocity.y = 0;
            } else if (currentFloor === 1 && player.y < 9) {
                player.y = 9;
                velocity.y = 0;
            } else if (currentFloor === -1 && player.y < -8) {
                player.y = -8;
                velocity.y = 0;
            }
            
            // Boundary checks
            player.x = Math.max(-28, Math.min(28, player.x));
            player.z = Math.max(-18, Math.min(18, player.z));
            
            // Batcave entrance
            if (batcaveUnlocked && 
                Math.abs(player.x - (-2)) < 2 && 
                Math.abs(player.z - 10.5) < 2 && 
                currentFloor === 0) {
                // Transport to batcave
                player.y = -8;
                player.x = 0;
                player.z = 20;
                currentFloor = -1;
                document.getElementById('location').textContent = "The Batcave";
            }
            
            // Staircase
            if (Math.abs(player.x - 25) < 2 && 
                Math.abs(player.z - 5) < 5) {
                if (currentFloor === 0 && player.y > 5) {
                    currentFloor = 1;
                    player.y = 9;
                    document.getElementById('location').textContent = "Second Floor";
                } else if (currentFloor === 1 && player.y < 7) {
                    currentFloor = 0;
                    player.y = 2;
                    document.getElementById('location').textContent = "Ground Floor";
                }
            }
        }

        function updateFloor() {
            // Update current location text
            if (currentFloor === -1) {
                document.getElementById('location').textContent = "The Batcave";
            } else if (currentFloor === 1) {
                document.getElementById('location').textContent = "Second Floor";
            } else {
                const roomsToCheck = rooms.ground;
                let inRoom = "Ground Floor";
                
                roomsToCheck.forEach(room => {
                    const [rx, ry, rz] = room.pos;
                    const [rw, rh, rd] = room.size;
                    
                    if (Math.abs(player.x - rx) < rw/2 && 
                        Math.abs(player.z - rz) < rd/2) {
                        inRoom = room.name;
                    }
                });
                
                document.getElementById('location').textContent = inRoom;
            }
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function animate() {
            requestAnimationFrame(animate);
            
            if (isPointerLocked) {
                updateMovement();
                updateRoomLabels();
            }
            
            renderer.render(scene, camera);
        }

        // Initialize the game
        init();
    <\/script>
</body>
</html>
`
