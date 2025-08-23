
export const gotham3DMapHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ultimate Gotham City - Complete 3D Map (Fixed UI Clicks)</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #0a0a0a;
            overflow: hidden;
            font-family: 'Arial', sans-serif;
        }
        
        #container {
            width: 100vw;
            height: 100vh;
            position: relative; /* important for absolute children + z-index layering */
        }

        /* --- Make the WebGL canvas sit behind UI and labels --- */
        canvas {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            z-index: 0;           /* behind all UI */
            pointer-events: auto;  /* still draggable for camera */
        }
        
        #ui {
            position: absolute;
            top: 20px;
            left: 20px;
            color: #ffffff;
            z-index: 1000;          /* above canvas */
            max-width: 280px;
            pointer-events: auto;    /* clickable */
        }
        
        #info {
            background: rgba(0,0,0,0.9);
            padding: 15px;
            border-radius: 8px;
            border: 2px solid #ffd700;
            margin-bottom: 10px;
        }
        
        #minimap {
            width: 180px;
            height: 180px;
            background: rgba(0,0,0,0.8);
            border: 2px solid #ffd700;
            border-radius: 8px;
            position: relative;
            margin-bottom: 10px;
        }
        
        .district-dot {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            transform: translate(-50%, -50%);
        }
        
        .villain-dot {
            position: absolute;
            width: 6px;
            height: 6px;
            border: 1px solid #ff0000;
            border-radius: 50%;
            transform: translate(-50%, -50%);
        }
        
        .player-dot {
            position: absolute;
            width: 6px;
            height: 6px;
            background: #ff0000;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            z-index: 10;
        }
        
        #locations {
            background: rgba(0,0,0,0.9);
            padding: 10px;
            border-radius: 8px;
            border: 1px solid #333;
            font-size: 10px;
            margin-bottom: 10px;
            max-height: 200px;
            overflow-y: auto;
        }
        
        .location {
            margin: 3px 0;
            padding: 4px;
            border-radius: 3px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .hero-location {
            background: rgba(0,100,255,0.1);
            border-left: 3px solid #0064ff;
        }
        
        .villain-location {
            background: rgba(255,0,0,0.1);
            border-left: 3px solid #ff0000;
        }
        
        .neutral-location {
            background: rgba(255,215,0,0.1);
            border-left: 3px solid #ffd700;
        }
        
        .location:hover {
            transform: scale(1.02);
            opacity: 0.8;
        }
        
        #controls {
            position: absolute;
            bottom: 20px;
            left: 20px;
            color: #ffffff;
            font-size: 10px;
            z-index: 1000;         /* above canvas */
            background: rgba(0,0,0,0.8);
            padding: 10px;
            border-radius: 5px;
            pointer-events: auto;   /* clickable */
        }
        
        #coordinates {
            position: absolute;
            bottom: 20px;
            right: 20px;
            color: #ffd700;
            font-size: 11px;
            background: rgba(0,0,0,0.8);
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            z-index: 1000;          /* above canvas */
            pointer-events: auto;    /* clickable */
        }
        
        .label-3d {
            position: absolute;
            color: white;
            font-size: 12px;
            background: rgba(0,0,0,0.8);
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid #ffd700;
            pointer-events: auto;    /* allow clicks on labels */
            transform: translate(-50%, -100%);
            white-space: nowrap;
            z-index: 1000;           /* above canvas */
            cursor: pointer;
        }
        
        .villain-label { border-color: #ff0000 !important; color: #ff6666 !important; }
        .hero-label   { border-color: #0064ff !important; color: #66aaff !important; }
        
        .street-label {
            position: absolute;
            color: #888;
            font-size: 10px;
            background: rgba(0,0,0,0.6);
            padding: 2px 6px;
            border-radius: 3px;
            pointer-events: none;    /* decorative only */
            white-space: nowrap;
            z-index: 900;            /* still above canvas */
        }

        .location-card {
            position: absolute;
            background: rgba(0,0,0,0.95);
            border: 2px solid #ffd700;
            border-radius: 8px;
            padding: 15px;
            max-width: 300px;
            color: white;
            font-size: 12px;
            z-index: 1100;           /* topmost */
            display: none;
            box-shadow: 0 4px 20px rgba(0,0,0,0.8);
            pointer-events: auto;     /* clickable */
        }

        .location-card.villain { border-color: #ff0000; background: rgba(20,0,0,0.95); }
        .location-card.hero   { border-color: #0064ff; background: rgba(0,0,20,0.95); }

        .card-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            font-size: 14px;
            font-weight: bold;
        }
        .card-icon { font-size: 20px; margin-right: 8px; }
        .card-threat { float: right; padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: bold; }
        .threat-low { background: #00aa00; }
        .threat-medium { background: #aaaa00; }
        .threat-high { background: #aa4400; }
        .threat-extreme { background: #aa0000; animation: pulse 1s infinite; }

        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.7} }

        .card-description { margin: 8px 0; line-height: 1.4; }
        .card-details { margin: 8px 0; font-size: 11px; color: #ccc; }
        .card-close { position: absolute; top: 5px; right: 8px; cursor: pointer; color: #999; font-size: 16px; }
        .card-close:hover { color: #fff; }
    </style>
</head>
<body>
    <div id="container">
        <div id="ui">
            <div id="info">
                <h3 style="margin:0 0 10px 0">🦇 ULTIMATE GOTHAM</h3>
                <div id="current-location">Location: Downtown</div>
                <div id="threat-level" style="font-size: 10px; margin-top: 5px;">Threat Level: LOW</div>
            </div>
            
            <div id="minimap">
                <div class="player-dot" id="player-dot"></div>
            </div>
            
            <div id="locations">
                <div style="font-weight: bold; margin-bottom: 5px;">🦸 HERO LOCATIONS</div>
                <div class="location hero-location" data-pos="0,20,-50">🏢 Financial District</div>
                <div class="location hero-location" data-pos="-30,60,-30">🏗️ Wayne Tower</div>
                <div class="location hero-location" data-pos="-40,10,40">👮 GCPD Headquarters</div>
                <div class="location neutral-location" data-pos="0,5,0">📍 City Hall</div>
                <div class="location neutral-location" data-pos="-60,15,-80">🏘️ Park Row</div>
                <div class="location neutral-location" data-pos="80,10,20">🏭 Industrial Zone</div>
                
                <div style="font-weight: bold; margin: 10px 0 5px 0;">🦹 VILLAIN TERRITORIES</div>
                <div class="location villain-location" data-pos="60,15,60">🏥 Arkham Asylum</div>
                <div class="location villain-location" data-pos="120,8,-40">🃏 ACE Chemicals</div>
                <div class="location villain-location" data-pos="-120,12,80">🧊 Iceberg Lounge</div>
                <div class="location villain-location" data-pos="40,10,-120">🌿 Poison Ivy's Lair</div>
                <div class="location villain-location" data-pos="-80,15,120">😈 Two-Face Territory</div>
            </div>
        </div>
        
        <div id="controls">
            <b>CONTROLS:</b><br />
            WASD: Move | Mouse: Look | Scroll: Zoom<br />
            Click Locations: Quick Travel<br />
            L: Toggle Labels | M: Toggle Minimap<br />
            <strong>Click floating labels for info cards!</strong>
        </div>
        
        <div id="coordinates">
            <div>X: <span id="coord-x">0</span></div>
            <div>Y: <span id="coord-y">50</span></div>
            <div>Z: <span id="coord-z">100</span></div>
            <div>Street: <span id="current-street">Main St</span></div>
        </div>
        
        <!-- Location Info Cards container -->
        <div id="location-cards"></div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        let scene, camera, renderer, buildings = [], labels = [];
        let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
        let mouseX = 0, mouseY = 0, isMouseDown = false;
        let showLabels = true;
        
        // Locations data
        const locations = [
            { name: 'Financial District', pos: [0, 20, -50], color: 0x4a90e2, type: 'hero', threat: 'low', icon: '🏢',
              description: 'The economic heart of Gotham City, home to Wayne Enterprises and major banks. Gleaming skyscrapers house corporate HQs.',
              details: 'Known for: Corporate offices, Stock exchange, Banking sector\nControlled by: Legitimate businesses\nActive hours: 9 AM - 6 PM\nSecurity level: High corporate security' },
            { name: 'Wayne Tower', pos: [-30, 60, -30], color: 0xffd700, type: 'hero', threat: 'low', icon: '🏗️',
              description: "The towering HQ of Wayne Enterprises. Also a secret Batman operations base.",
              details: 'CEO: Bruce Wayne\nHeight: 150 floors\nSecret: Advanced R&D labs\nSecurity: Wayne Tech systems\nFun fact: Penthouse residence' },
            { name: 'GCPD Headquarters', pos: [-40, 10, 40], color: 0x0064ff, type: 'hero', threat: 'low', icon: '👮',
              description: 'Gotham City Police Department HQ with the iconic Bat-Signal rooftop.',
              details: 'Commissioner: James Gordon\nOfficers: 1200+\nUnits: MCU, SWAT, Detectives\nAlly: Batman (unofficial)\nFamous: The Bat-Signal' },
            { name: 'City Hall', pos: [0, 5, 0], color: 0xffffff, type: 'neutral', threat: 'low', icon: '📍',
              description: "The seat of Gotham's government.",
              details: 'Mayor: (varies)\nServices: Planning, Public works, Emergency\nArchitecture: Classical with golden dome\nSecurity: Municipal police' },
            { name: 'Park Row', pos: [-60, 15, -80], color: 0x44aa44, type: 'neutral', threat: 'medium', icon: '🏘️',
              description: 'A residential district in decline. Crime Alley nearby.',
              details: 'Notable: Crime Alley\nPopulation: Mixed income\nCrime rate: Moderate-high\nHistory: Former upper-class' },
            { name: 'Industrial Zone', pos: [80, 10, 20], color: 0x888888, type: 'neutral', threat: 'medium', icon: '🏭',
              description: 'Factories, warehouses, docks. Often used by criminals as hideouts.',
              details: 'Industries: Manufacturing, Shipping\nCrimes: Smuggling, gangs\nNotable: Abandoned facilities' },
            { name: 'Arkham Asylum', pos: [60, 15, 60], color: 0xff4444, type: 'villain', threat: 'high', icon: '🏥',
              description: 'Psychiatric hospital for Gotham\'s criminally insane.',
              details: 'Patients: Joker, Riddler, Scarecrow\nSecurity: Max with specialized cells\nBreakouts: Too many\nFounder: Amadeus Arkham' },
            { name: 'ACE Chemicals', pos: [120, 8, -40], color: 0x00ff00, type: 'villain', threat: 'extreme', icon: '🃏',
              description: 'Chemical plant where Red Hood fell, creating the Joker.',
              details: 'Status: Abandoned toxic site\nDangers: Burns, toxic exposure\nVillain activity: Joker returns often' },
            { name: 'Iceberg Lounge', pos: [-120, 12, 80], color: 0x00ffff, type: 'villain', threat: 'high', icon: '🧊',
              description: "Penguin's upscale nightclub fronting a criminal empire.",
              details: 'Owner: Oswald Cobblepot\nCover: Casino & nightclub\nReal biz: Laundering, arms, intel\nSecurity: Armed bouncers' },
            { name: 'Poison Ivy\'s Lair', pos: [40, 10, -120], color: 0x228b22, type: 'villain', threat: 'high', icon: '🌿',
              description: 'Overgrown greenhouse complex full of toxic flora.',
              details: 'Inhabitant: Dr. Pamela Isley\nDangers: Spores, carnivorous plants\nWarning: Hazmat needed' },
            { name: 'Two-Face Territory', pos: [-80, 15, 120], color: 0x800080, type: 'villain', threat: 'high', icon: '😈',
              description: 'Old courthouse district ruled by coin flips.',
              details: 'Leader: Harvey Dent\nTheme: Duality/chance\nGang: The Doubles\nDanger: Unpredictable' },
        ];

        // Streets
        const streets = [
            { name: 'Wayne Boulevard', direction: 'horizontal', position: -30 },
            { name: 'Gordon Avenue', direction: 'horizontal', position: 0 },
            { name: 'Penguin Street', direction: 'horizontal', position: 60 },
            { name: 'Batman Drive', direction: 'vertical', position: -40 },
            { name: 'Main Street', direction: 'vertical', position: 0 },
            { name: 'Joker Lane', direction: 'vertical', position: 80 },
            { name: 'Arkham Road', direction: 'horizontal', position: 120 },
            { name: 'Harvey Dent Way', direction: 'vertical', position: -100 },
        ];
        
        function init() {
            // Scene
            scene = new THREE.Scene();
            scene.fog = new THREE.Fog(0x1a1a2e, 50, 500);
            
            // Camera
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 50, 100);
            
            // Renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setClearColor(0x0f0f23);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            
            document.getElementById('container').appendChild(renderer.domElement);
            
            createCity();
            setupLighting();
            setupControls();
            setupMinimap();
            addStreetLabels();
            
            animate();
        }
        
        function createCity() {
            const groundGeometry = new THREE.PlaneGeometry(600, 600);
            const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x1a1a2e });
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.receiveShadow = true;
            scene.add(ground);
            
            createStreets();
            locations.forEach(location => createLocation(location));
        }
        
        function createStreets() {
            const streetMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
            streets.forEach(street => {
                if (street.direction === 'horizontal') {
                    const hStreet = new THREE.Mesh(new THREE.PlaneGeometry(500, 4), streetMaterial);
                    hStreet.rotation.x = -Math.PI / 2;
                    hStreet.position.set(0, 0.1, street.position);
                    scene.add(hStreet);
                } else {
                    const vStreet = new THREE.Mesh(new THREE.PlaneGeometry(4, 500), streetMaterial);
                    vStreet.rotation.x = -Math.PI / 2;
                    vStreet.position.set(street.position, 0.1, 0);
                    scene.add(vStreet);
                }
            });
        }
        
        function createLocation(location) {
            const [x, y, z] = location.pos;
            let buildingCount, specialBuilding = false;
            
            if (location.name === 'Wayne Tower') { createWayneTower(x, y, z); buildingCount = 10; specialBuilding = true; }
            else if (location.name === 'GCPD Headquarters') { createGCPD(x, y, z); buildingCount = 8; specialBuilding = true; }
            else if (location.name === 'Arkham Asylum') { createArkham(x, y, z); buildingCount = 12; specialBuilding = true; }
            else if (location.name === 'ACE Chemicals') { createACEChemicals(x, y, z); buildingCount = 6; specialBuilding = true; }
            else if (location.name === 'Iceberg Lounge') { createIcebergLounge(x, y, z); buildingCount = 8; specialBuilding = true; }
            else { buildingCount = 15; }
            
            for (let i = 0; i < buildingCount; i++) {
                const width = Math.random() * 8 + 4;
                const height = Math.random() * 40 + 10;
                const depth = Math.random() * 8 + 4;
                
                const geometry = new THREE.BoxGeometry(width, height, depth);
                const material = new THREE.MeshLambertMaterial({ color: location.color });
                const building = new THREE.Mesh(geometry, material);
                
                let offsetX, offsetZ;
                do {
                    offsetX = x + (Math.random() - 0.5) * 80;
                    offsetZ = z + (Math.random() - 0.5) * 80;
                } while (specialBuilding && Math.abs(offsetX - x) < 20 && Math.abs(offsetZ - z) < 20);
                
                building.position.set(offsetX, height / 2, offsetZ);
                building.castShadow = true;
                building.receiveShadow = true;
                
                addWindows(building, width, height, depth, location.type);
                scene.add(building);
                buildings.push(building);
            }
            
            add3DLabel(location.name, x, y + 40, z, location.type, location);
        }
        
        function createWayneTower(x, y, z) {
            const tower = new THREE.Mesh(new THREE.BoxGeometry(15, 120, 15), new THREE.MeshLambertMaterial({ color: 0x2c2c2c }));
            tower.position.set(x, 60, z);
            tower.castShadow = true;
            scene.add(tower);
            const logo = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 2, 8), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
            logo.position.set(x, 121, z);
            scene.add(logo);
            addWindows(tower, 15, 120, 15, 'hero');
        }
        function createGCPD(x, y, z) {
            const g = new THREE.Mesh(new THREE.BoxGeometry(25, 35, 20), new THREE.MeshLambertMaterial({ color: 0x0064ff }));
            g.position.set(x, 17.5, z); g.castShadow = true; scene.add(g);
            const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 15, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
            antenna.position.set(x, 42.5, z); scene.add(antenna);
            for (let i = 0; i < 4; i++) { const car = new THREE.Mesh(new THREE.BoxGeometry(3,1.5,6), new THREE.MeshLambertMaterial({ color: 0x000080 })); car.position.set(x + i*4 - 6, 0.75, z + 15); scene.add(car);}            
            addWindows(g, 25, 35, 20, 'hero');
        }
        function createArkham(x, y, z) {
            const a = new THREE.Mesh(new THREE.BoxGeometry(30, 40, 25), new THREE.MeshLambertMaterial({ color: 0x2c1810 }));
            a.position.set(x, 20, z); a.castShadow = true; scene.add(a);
            for (let i = 0; i < 4; i++) { const t = new THREE.Mesh(new THREE.BoxGeometry(8, 50, 8), new THREE.MeshLambertMaterial({ color: 0x1a1a1a })); const angle = (i/4) * Math.PI * 2; t.position.set(x + Math.cos(angle)*20, 25, z + Math.sin(angle)*20); t.castShadow = true; scene.add(t);}            
            addWindows(a, 30, 40, 25, 'villain');
        }
        function createACEChemicals(x, y, z) {
            const f = new THREE.Mesh(new THREE.BoxGeometry(35, 25, 30), new THREE.MeshLambertMaterial({ color: 0x228b22 }));
            f.position.set(x, 12.5, z); f.castShadow = true; scene.add(f);
            for (let i = 0; i < 3; i++) { const vat = new THREE.Mesh(new THREE.CylinderGeometry(4,4,8,12), new THREE.MeshLambertMaterial({ color: 0x00ff00 })); vat.position.set(x + (i-1)*12, 4, z - 15); scene.add(vat);}            
            addWindows(f, 35, 25, 30, 'villain');
        }
        function createIcebergLounge(x, y, z) {
            const l = new THREE.Mesh(new THREE.BoxGeometry(20, 15, 25), new THREE.MeshLambertMaterial({ color: 0x00ffff }));
            l.position.set(x, 7.5, z); l.castShadow = true; scene.add(l);
            const ice = new THREE.Mesh(new THREE.ConeGeometry(5, 10, 4), new THREE.MeshBasicMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.7 }));
            ice.position.set(x, 20, z); scene.add(ice);
            addWindows(l, 20, 15, 25, 'villain');
        }
        
        function addWindows(building, width, height, depth, type) {
            const windowGroup = new THREE.Group();
            const baseColor = type === 'hero' ? 0x88aaff : type === 'villain' ? 0xff4444 : 0x444488;
            for (let y = 3; y < height - 2; y += 4) {
                for (let x = -width/2 + 1; x < width/2 - 1; x += 2) {
                    if (Math.random() > 0.3) {
                        const w = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.5), new THREE.MeshBasicMaterial({ color: Math.random() > 0.7 ? 0xffff88 : baseColor, transparent: true, opacity: 0.8 }));
                        w.position.set(x, y - height/2, depth/2 + 0.01);
                        windowGroup.add(w);
                    }
                }
            }
            building.add(windowGroup);
        }
        
        function add3DLabel(text, x, y, z, type, locationData) {
            const label = document.createElement('div');
            label.className = 'label-3d';
            label.textContent = text;
            if (type === 'villain') label.classList.add('villain-label');
            else if (type === 'hero') label.classList.add('hero-label');
            
            label.addEventListener('click', (e) => {
                e.stopPropagation();
                showLocationCard(locationData, e.pageX, e.pageY);
            });
            
            // initial position (will be updated each frame)
            label.style.left = '50%';
            label.style.top = '50%';
            
            document.getElementById('container').appendChild(label);
            labels.push({ element: label, position: new THREE.Vector3(x, y, z), locationData });
        }
        
        function showLocationCard(location, x, y) {
            hideAllLocationCards();
            const card = document.createElement('div');
            card.className = \`location-card \${location.type}\`;
            card.innerHTML = \`
                <div class="card-close" onclick="hideAllLocationCards()">×</div>
                <div class="card-header">
                    <span class="card-icon">\${location.icon}</span>
                    \${location.name}
                    <span class="card-threat threat-\${location.threat}">\${location.threat.toUpperCase()}</span>
                </div>
                <div class="card-description">\${location.description}</div>
                <div class="card-details">\${location.details.replace(/\\n/g, '<br>')}</div>
                <div style="margin-top: 10px; font-size: 10px; color: #999;">Click anywhere outside to close • Move with WASD to explore</div>
            \`;
            card.style.left = Math.min(x, window.innerWidth - 320) + 'px';
            card.style.top = Math.min(y, window.innerHeight - 200) + 'px';
            card.style.display = 'block';
            card.addEventListener('click', (e) => e.stopPropagation()); // keep clicks inside
            document.getElementById('container').appendChild(card);
            
            // Auto-hide after 15s
            setTimeout(() => { if (card.parentNode) card.remove(); }, 15000);
        }
        
        function hideAllLocationCards() {
            document.querySelectorAll('.location-card').forEach(card => card.remove());
        }
        
        function addStreetLabels() {
            streets.forEach(street => {
                const label = document.createElement('div');
                label.className = 'street-label';
                label.textContent = street.name;
                document.getElementById('container').appendChild(label);
                const pos = street.direction === 'horizontal' 
                    ? new THREE.Vector3(-200, 2, street.position)
                    : new THREE.Vector3(street.position, 2, -200);
                labels.push({ element: label, position: pos, isStreet: true });
            });
        }
        
        function setupLighting() {
            scene.add(new THREE.AmbientLight(0x404040, 0.4));
            const moonLight = new THREE.DirectionalLight(0x9999ff, 0.6);
            moonLight.position.set(100, 200, 100);
            moonLight.castShadow = true;
            moonLight.shadow.camera.left = -200;
            moonLight.shadow.camera.right = 200;
            moonLight.shadow.camera.top = 200;
            moonLight.shadow.camera.bottom = -200;
            scene.add(moonLight);
            locations.forEach(loc => { const light = new THREE.PointLight(loc.color, 0.5, 100); light.position.set(loc.pos[0], loc.pos[1] + 20, loc.pos[2]); scene.add(light); });
        }
        
        function setupControls() {
            // Keyboard
            document.addEventListener('keydown', (e) => {
                switch (e.code) {
                    case 'KeyW': moveForward = true; break;
                    case 'KeyS': moveBackward = true; break;
                    case 'KeyA': moveLeft = true; break;
                    case 'KeyD': moveRight = true; break;
                    case 'KeyL': toggleLabels(); break;
                    case 'KeyM': toggleMinimap(); break;
                }
            });
            document.addEventListener('keyup', (e) => {
                switch (e.code) {
                    case 'KeyW': moveForward = false; break;
                    case 'KeyS': moveBackward = false; break;
                    case 'KeyA': moveLeft = false; break;
                    case 'KeyD': moveRight = false; break;
                }
            });
            
            // Mouse drag to look
            renderer.domElement.addEventListener('mousedown', () => { isMouseDown = true; });
            renderer.domElement.addEventListener('mouseup', () => { isMouseDown = false; });
            renderer.domElement.addEventListener('mousemove', (e) => {
                if (isMouseDown) {
                    const deltaX = e.clientX - mouseX;
                    const deltaY = e.clientY - mouseY;
                    camera.rotation.y -= deltaX * 0.005;
                    camera.rotation.x -= deltaY * 0.005;
                    camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
                }
                mouseX = e.clientX; mouseY = e.clientY;
            });
            
            // Zoom
            renderer.domElement.addEventListener('wheel', (e) => {
                const factor = 1 + (e.deltaY > 0 ? 0.1 : -0.1);
                camera.position.multiplyScalar(factor);
            });
            
            // Click outside to close cards
            document.getElementById('container').addEventListener('click', () => hideAllLocationCards());
            
            // Sidebar quick travel
            document.querySelectorAll('.location').forEach(el => {
                el.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    const pos = el.dataset.pos.split(',').map(Number);
                    camera.position.set(pos[0], pos[1] + 30, pos[2] + 50);
                    camera.lookAt(pos[0], pos[1], pos[2]);
                });
            });
            
            // Resize
            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
        }
        
        function setupMinimap() {
            const minimap = document.getElementById('minimap');
            locations.forEach(location => {
                const dot = document.createElement('div');
                if (location.type === 'villain') { dot.className = 'villain-dot'; dot.style.backgroundColor = \`#\${location.color.toString(16).padStart(6, '0')}\`; }
                else { dot.className = 'district-dot'; dot.style.backgroundColor = \`#\${location.color.toString(16).padStart(6, '0')}\`; }
                const mapX = ((location.pos[0] + 250) / 500) * 180;
                const mapZ = ((location.pos[2] + 250) / 500) * 180;
                dot.style.left = mapX + 'px';
                dot.style.top = mapZ + 'px';
                dot.title = location.name; minimap.appendChild(dot);
            });
        }
        
        function toggleLabels() {
            showLabels = !showLabels;
            labels.forEach(label => { label.element.style.display = showLabels ? 'block' : 'none'; });
        }
        function toggleMinimap() {
            const minimap = document.getElementById('minimap');
            minimap.style.display = minimap.style.display === 'none' ? 'block' : 'none';
        }
        
        function updateUI() {
            document.getElementById('coord-x').textContent = Math.round(camera.position.x);
            document.getElementById('coord-y').textContent = Math.round(camera.position.y);
            document.getElementById('coord-z').textContent = Math.round(camera.position.z);
            
            const playerDot = document.getElementById('player-dot');
            const mapX = ((camera.position.x + 250) / 500) * 180;
            const mapZ = ((camera.position.z + 250) / 500) * 180;
            playerDot.style.left = mapX + 'px';
            playerDot.style.top = mapZ + 'px';
            
            let nearest = 'Unknown';
            let minDist = Infinity;
            let currentThreat = 'low';
            locations.forEach(location => {
                const dist = Math.hypot(camera.position.x - location.pos[0], camera.position.z - location.pos[2]);
                if (dist < minDist && dist < 100) { minDist = dist; nearest = location.name; currentThreat = location.threat; }
            });
            
            let currentStreet = 'Unknown Street';
            let streetDist = Infinity;
            streets.forEach(street => {
                const dist = street.direction === 'horizontal' ? Math.abs(camera.position.z - street.position) : Math.abs(camera.position.x - street.position);
                if (dist < streetDist && dist < 25) { streetDist = dist; currentStreet = street.name; }
            });
            
            document.getElementById('current-location').textContent = \`Location: \${nearest}\`;
            document.getElementById('current-street').textContent = currentStreet;
            const threatElement = document.getElementById('threat-level');
            threatElement.textContent = \`Threat Level: \${currentThreat.toUpperCase()}\`;
            threatElement.style.color = ({ low: '#00ff00', medium: '#ffff00', high: '#ff8800', extreme: '#ff0000' })[currentThreat] || '#00ff00';
            threatElement.style.fontWeight = currentThreat === 'extreme' ? 'bold' : 'normal';
            
            // project labels into screen space
            labels.forEach(label => {
                const vector = label.position.clone();
                vector.project(camera);
                const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
                const y = (vector.y * -0.5 + 0.5) * window.innerHeight;
                const distance = camera.position.distanceTo(label.position);
                const isVisible = vector.z < 1 && distance < 200;
                if (isVisible && showLabels) {
                    label.element.style.left = x + 'px';
                    label.element.style.top = y + 'px';
                    label.element.style.display = 'block';
                    const opacity = Math.max(0.3, 1 - (distance / 200));
                    label.element.style.opacity = opacity;
                    if (label.isStreet) { label.element.style.fontSize = '8px'; label.element.style.opacity = opacity * 0.6; }
                } else {
                    label.element.style.display = 'none';
                }
            });
        }
        
        function animate() {
            requestAnimationFrame(animate);
            const speed = 2;
            const direction = new THREE.Vector3();
            direction.z = Number(moveForward) - Number(moveBackward);
            direction.x = Number(moveRight) - Number(moveLeft);
            direction.normalize();
            if (direction.length() > 0) {
                const euler = new THREE.Euler(0, camera.rotation.y, 0);
                direction.applyEuler(euler);
                camera.position.add(direction.multiplyScalar(speed));
                camera.position.y = Math.max(5, camera.position.y);
            }
            if (Math.random() > 0.98) {
                buildings.forEach(building => {
                    if (building.children[0] && building.children[0].children.length > 0) {
                        const windows = building.children[0].children;
                        const randomWindow = windows[Math.floor(Math.random() * windows.length)];
                        if (randomWindow.material) randomWindow.material.opacity = Math.random() * 0.8 + 0.2;
                    }
                });
            }
            updateUI();
            renderer.render(scene, camera);
        }
        
        // Expose close helper for inline onclick
        window.hideAllLocationCards = hideAllLocationCards;
        
        init();
    </script>
</body>
</html>
`;
