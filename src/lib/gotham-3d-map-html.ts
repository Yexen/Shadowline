
export const gotham3DMapHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Ultimate Gotham City - Complete 3D Map</title>
  <style>
    body{margin:0;padding:0;background:#0a0a0a;overflow:hidden;font-family:'Arial',sans-serif;}
    #container{width:100vw;height:100vh;position:relative;}
    canvas{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:auto;}

    #ui{position:absolute;top:20px;left:20px;color:#fff;z-index:1000;max-width:280px;pointer-events:auto;}
    #info{background:rgba(0,0,0,.9);padding:15px;border-radius:8px;border:2px solid #ffd700;margin-bottom:10px;}
    #minimap{width:180px;height:180px;background:rgba(0,0,0,.8);border:2px solid #ffd700;border-radius:8px;position:relative;margin-bottom:10px;}
    .district-dot,.villain-dot{position:absolute;border-radius:50%;transform:translate(-50%,-50%);}
    .district-dot{width:8px;height:8px;}
    .villain-dot{width:6px;height:6px;border:1px solid #f00;}
    .player-dot{position:absolute;width:6px;height:6px;background:#f00;border-radius:50%;transform:translate(-50%,-50%);z-index:10;}

    #locations{background:rgba(0,0,0,.9);padding:10px;border-radius:8px;border:1px solid #333;font-size:10px;margin-bottom:10px;max-height:200px;overflow-y:auto;}
    .location{margin:3px 0;padding:4px;border-radius:3px;cursor:pointer;transition:.3s;}
    .hero-location{background:rgba(0,100,255,.1);border-left:3px solid #0064ff;}
    .villain-location{background:rgba(255,0,0,.1);border-left:3px solid #f00;}
    .neutral-location{background:rgba(255,215,0,.1);border-left:3px solid #ffd700;}
    .location:hover{transform:scale(1.02);opacity:.8;}

    #controls{position:absolute;bottom:20px;left:20px;color:#fff;font-size:10px;z-index:1000;background:rgba(0,0,0,.8);padding:10px;border-radius:5px;pointer-events:auto;}
    #coordinates{position:absolute;bottom:20px;right:20px;color:#ffd700;font-size:11px;background:rgba(0,0,0,.8);padding:10px;border-radius:5px;font-family:monospace;z-index:1000;pointer-events:auto;}

    /* floating 3D labels */
    .label-3d{position:absolute;color:#fff;font-size:12px;background:rgba(0,0,0,.8);padding:4px 8px;border-radius:4px;border:1px solid #ffd700;cursor:pointer;transform:translate(-50%,-100%);white-space:nowrap;z-index:1000;transition:.2s;}
    .label-3d:hover{background:rgba(255,215,0,.2);transform:translate(-50%,-100%) scale(1.1);}
    .villain-label{border-color:#f00!important;color:#f66!important;}
    .villain-label:hover{background:rgba(255,0,0,.2)!important;}
    .hero-label{border-color:#0064ff!important;color:#66aaff!important;}
    .hero-label:hover{background:rgba(0,100,255,.2)!important;}
    .street-label{position:absolute;color:#888;font-size:10px;background:rgba(0,0,0,.6);padding:2px 6px;border-radius:3px;pointer-events:none;white-space:nowrap;z-index:900;}

    /* info card */
    .location-card{position:absolute;background:rgba(0,0,0,.95);border:2px solid #ffd700;border-radius:8px;padding:15px;max-width:300px;color:#fff;font-size:12px;z-index:1100;display:none;box-shadow:0 4px 20px rgba(0,0,0,.8);pointer-events:auto;animation:fadeIn .3s;}
    @keyframes fadeIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
    .location-card.villain{border-color:#f00;background:rgba(40,0,0,.95);}
    .location-card.hero{border-color:#0064ff;background:rgba(0,0,40,.95);}
    .card-header{display:flex;align-items:center;margin-bottom:10px;font-size:14px;font-weight:bold;}
    .card-icon{font-size:20px;margin-right:8px;}
    .card-threat{margin-left:auto;padding:2px 6px;border-radius:3px;font-size:10px;font-weight:bold;}
    .threat-low{background:#0a0;}
    .threat-medium{background:#aa0;}
    .threat-high{background:#a40;}
    .threat-extreme{background:#a00;animation:pulse 1s infinite;}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.7}}
    .card-description{margin:8px 0;line-height:1.4;}
    .card-details{margin:8px 0;font-size:11px;color:#ccc;line-height:1.3;}
    .card-close{position:absolute;top:5px;right:8px;cursor:pointer;color:#999;font-size:18px;font-weight:bold;}
    .card-close:hover{color:#fff;}

    /* small UI button */
    .ui-btn{margin-top:6px;display:inline-flex;align-items:center;gap:6px;padding:6px 10px;font-size:11px;border:1px solid #ffd700;border-radius:6px;background:#0b0b15;color:#ffd700;cursor:pointer;}
    .ui-btn:hover{filter:brightness(1.1);}
  </style>
</head>
<body>
  <div id="container">
    <div id="ui">
      <div id="info">
        <h3 style="margin:0 0 10px 0">🦇 ULTIMATE GOTHAM</h3>
        <div id="current-location">Location: Downtown</div>
        <div id="threat-level" style="font-size:10px;margin-top:5px;">Threat Level: LOW</div>
      </div>

      <div id="minimap"><div class="player-dot" id="player-dot"></div></div>

      <div id="locations">
        <div style="font-weight:bold;margin-bottom:5px;">🦸 HERO LOCATIONS</div>
        <div class="location hero-location" data-pos="0,20,-50">🏢 Financial District</div>
        <div class="location hero-location" data-pos="-30,60,-30">🏗️ Wayne Tower</div>
        <div class="location hero-location" data-pos="-40,10,40">👮 GCPD Headquarters</div>
        <div class="location neutral-location" data-pos="0,5,0">📍 City Hall</div>
        <div class="location neutral-location" data-pos="-60,15,-80">🏘️ Park Row</div>
        <div class="location neutral-location" data-pos="80,10,20">🏭 Industrial Zone</div>
        <div class="location hero-location" data-pos="-180,25,-120">🏰 Wayne Manor</div>
        <div class="location hero-location" data-pos="-190,6,-140">🦇 Batcave</div>

        <div style="font-weight:bold;margin:10px 0 5px 0;">🦹 VILLAIN TERRITORIES</div>
        <div class="location villain-location" data-pos="60,15,60">🏥 Arkham Asylum</div>
        <div class="location villain-location" data-pos="120,8,-40">🃏 ACE Chemicals</div>
        <div class="location villain-location" data-pos="-120,12,80">🧊 Iceberg Lounge</div>
        <div class="location villain-location" data-pos="40,10,-120">🌿 Poison Ivy's Lair</div>
        <div class="location villain-location" data-pos="-80,15,120">😈 Two-Face Territory</div>

        <div style="font-weight:bold;margin:10px 0 5px 0;">🌊 WATERWAYS & BRIDGES</div>
        <div class="location neutral-location" data-pos="-150,2,40">🛶 North Docks</div>
        <div class="location neutral-location" data-pos="-20,2,10">🛳️ Central Docks</div>
        <div class="location neutral-location" data-pos="110,2,-10">⛵ South Docks</div>
        <div class="location hero-location" data-pos="-40,6,10">🌉 Wayne Bridge</div>
        <div class="location neutral-location" data-pos="40,6,-5">🌉 Midtown Bridge</div>
        <div class="location villain-location" data-pos="90,6,-15">🌉 ACE Overpass</div>
      </div>
    </div>

    <div id="controls">
      <b>BATMAN CONTROLS:</b><br/>
      WASD: Fly Around | Mouse: Look | Scroll: Zoom<br/>
      Click Districts: Quick Travel | L: Toggle Labels | M: Toggle Minimap<br/>
      <strong>🎯 Click floating labels for intel!</strong><br/>
      <button id="toggle-batsignal" class="ui-btn">🔦 Bat-Signal: ON</button>
    </div>

    <div id="coordinates">
      <div>X: <span id="coord-x">0</span></div>
      <div>Y: <span id="coord-y">50</span></div>
      <div>Z: <span id="coord-z">100</span></div>
      <div>Street: <span id="current-street">Main St</span></div>
    </div>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script>
    console.log('🚀 MAP SCRIPT STARTED - JavaScript is executing!');
    let scene, camera, renderer, buildings=[], labels=[];
    let moveForward=false, moveBackward=false, moveLeft=false, moveRight=false;
    let mouseX=0, mouseY=0, isMouseDown=false, showLabels=true;
    let cloudSprites=[];
    // Bat-signal bits
    let batLight, batBeam, batSprite, batSignalOn = true;

    const locations = [
      { name:'Financial District', pos:[0,20,-50], color:0x4a90e2, type:'hero', threat:'low', icon:'🏢',
        description:'The economic heart of Gotham City, home to Wayne Enterprises and major banks. Gleaming skyscrapers house corporate headquarters.',
        details:'Known for: Corporate offices, Stock exchange, Banking sector<br>Controlled by: Legitimate businesses<br>Active hours: 9 AM - 6 PM<br>Security level: High corporate security' },
      { name:'Wayne Tower', pos:[-30,60,-30], color:0xffd700, type:'hero', threat:'low', icon:'🏗️',
        description:'The towering headquarters of Wayne Enterprises. Also serves as a secret Batman operations base.',
        details:'CEO: Bruce Wayne<br>Height: 150 floors<br>Secret: Advanced R&D labs<br>Security: Wayne Tech systems<br>Fun fact: Penthouse connects to Batcave' },
      { name:'GCPD Headquarters', pos:[-40,10,40], color:0x0064ff, type:'hero', threat:'low', icon:'👮',
        description:'Gotham City Police Department headquarters with the iconic Bat-Signal on the rooftop.',
        details:'Commissioner: James Gordon<br>Officers: 1200+ active duty<br>Units: MCU, SWAT, Detectives<br>Allied with: Batman (unofficial)<br>Famous for: The Bat-Signal' },
      { name:'City Hall', pos:[0,5,0], color:0xffffff, type:'neutral', threat:'low', icon:'📍',
        description:"The seat of Gotham's government and political power.",
        details:'Mayor: Often varies due to corruption<br>Services: City planning, Public works<br>Architecture: Classical with golden dome<br>Security: Municipal police protection' },
      { name:'Park Row', pos:[-60,15,-80], color:0x44aa44, type:'neutral', threat:'medium', icon:'🏘️',
        description:'A residential district in decline. Crime Alley is located nearby.',
        details:'Notable: Crime Alley (Wayne family murder site)<br>Population: Mixed income families<br>Crime rate: Moderate to high<br>History: Former upper-class area' },
      { name:'Industrial Zone', pos:[80,10,20], color:0x888888, type:'neutral', threat:'medium', icon:'🏭',
        description:'Factories, warehouses, and docks. Often used by criminals as hideouts.',
        details:'Industries: Manufacturing, Shipping<br>Employment: Blue-collar workers<br>Crime: Smuggling, gang activity<br>Notable: Abandoned facilities' },
      { name:'Arkham Asylum', pos:[60,15,60], color:0xff4444, type:'villain', threat:'high', icon:'🏥',
        description:"Psychiatric hospital for Gotham's criminally insane.",
        details:'Current inmates: Joker, Riddler, Scarecrow, Mad Hatter<br>Security: Maximum with specialized containment<br>Breakout frequency: Disturbingly high<br>Founded: 1921 by Dr. Amadeus Arkham' },
      { name:'ACE Chemicals', pos:[120,8,-40], color:0x00ff00, type:'villain', threat:'extreme', icon:'🃏',
        description:'Chemical plant where Red Hood fell, creating the Joker.',
        details:'History: Birthplace of the Joker<br>Status: Abandoned toxic site<br>Dangers: Chemical burns, toxic exposure<br>Contamination: Extremely hazardous - requires protective gear' },
      { name:'Iceberg Lounge', pos:[-120,12,80], color:0x00ffff, type:'villain', threat:'high', icon:'🧊',
        description:'Penguin upscale nightclub fronting a criminal empire.',
        details:'Owner: Oswald "Penguin" Cobblepot<br>Cover: High-end nightclub and casino<br>Real business: Money laundering, arms dealing<br>Security: Armed thugs as "bouncers"' },
      { name:'Poison Ivy Lair', pos:[40,10,-120], color:0x228b22, type:'villain', threat:'high', icon:'🌿',
        description:'Botanical hideout with mutated plants and toxic air.',
        details:'Inhabitant: Dr. Pamela Isley<br>Environment: Overgrown greenhouse complex<br>Dangers: Toxic spores, carnivorous plants<br>Required: Full hazmat protection and antidotes' },
      { name:'Two-Face Territory', pos:[-80,15,120], color:0x800080, type:'villain', threat:'high', icon:'😈',
        description:'Old courthouse district ruled by coin flips.',
        details:'Ruler: Harvey "Two-Face" Dent (former DA)<br>Theme: Duality and chance<br>Territory: Old courthouse district<br>Gang: The "Doubles"<br>Danger: Unpredictable coin-flip decisions' },
      { name:'North Docks', pos:[-150,2,40], color:0x1e3a5f, type:'neutral', threat:'low', icon:'🛶',
        description:'Cargo piers and warehouses along the northern riverbank.',
        details:'Traffic: Moderate freight<br>Use: Freight and fishing boats<br>Security: Night patrols<br>Access: Loading cranes operational' },
      { name:'Central Docks', pos:[-20,2,10], color:0x1e3a5f, type:'neutral', threat:'low', icon:'🛳️',
        description:'Busy midtown dock with ferries and barges.',
        details:'Ferry lines: 3 active routes<br>Smuggling risk: Medium<br>Shore cranes: Operational<br>Security: Regular GCPD patrols' },
      { name:'South Docks', pos:[110,2,-10], color:0x1e3a5f, type:'neutral', threat:'medium', icon:'⛵',
        description:'Quieter docks near ACE Chemicals with potential contamination.',
        details:'Hazards: Chemical runoff from ACE<br>Traffic: Low at night<br>Condition: Some contamination<br>Warning: Avoid swimming' },
      { name:'Wayne Bridge', pos:[-40,6,10], color:0xffd700, type:'hero', threat:'low', icon:'🌉',
        description:'Elegant suspension bridge linking west and central districts.',
        details:'Design: Suspension bridge<br>Patrols: GCPD nightly<br>Visibility: High security lighting<br>Status: Well-maintained' },
      { name:'Midtown Bridge', pos:[40,6,-5], color:0xffffff, type:'neutral', threat:'low', icon:'🌉',
        description:'Main commuter bridge across the central channel.',
        details:'Lanes: 6 traffic lanes<br>Traffic: Heavy during rush hour<br>Maintenance: Regular inspections<br>Safety: Standard guardrails' },
      { name:'ACE Overpass', pos:[90,6,-15], color:0x00ff00, type:'villain', threat:'medium', icon:'🌉',
        description:'Industrial overpass near ACE Chemicals in poor condition.',
        details:'Condition: Rusting infrastructure<br>Watch: Joker gang activity rumored<br>Hazards: Structural concerns<br>Patrol: Irregular coverage' },
      { name:'Wayne Manor', pos:[-180,25,-120], color:0x8b4513, type:'hero', threat:'low', icon:'🏰',
        description:'The ancestral home of the Wayne family, outside Gotham proper. Secret entrance to the Batcave.',
        details:'Owner: Bruce Wayne<br>Built: 1855 by the Wayne family<br>Staff: Alfred Pennyworth (butler)<br>Secret: Hidden Batcave entrance<br>Security: Advanced Wayne Tech systems' },
      { name:'Batcave', pos:[-190,6,-140], color:0x222222, type:'hero', threat:'low', icon:'🦇',
        description:'Hidden cavern base accessible via a concealed entrance near Wayne Manor.',
        details:'Access: Secret cliffside entrance<br>Vehicles: Batmobile dock & turntable<br>Facilities: Batcomputer, Armory, Lab<br>Security: Biometric locks & failsafes' },
      
      // Additional Canonical Gotham Locations
      { name:'Crime Alley', pos:[-70,1,-85], color:0x800000, type:'villain', threat:'high', icon:'⚰️',
        description:'The narrow alley where Thomas and Martha Wayne were murdered.',
        details:'Historic significance: Wayne family murder site<br>Current state: Memorial plaque installed<br>Crime rate: Still dangerously high' },
      
      { name:'Blackgate Penitentiary', pos:[180,5,60], color:0x333333, type:'neutral', threat:'high', icon:'🏢',
        description:'Maximum security prison for non-insane criminals on its own island.',
        details:'Security level: Maximum<br>Capacity: 2,500 inmates<br>Notable inmates: Mob bosses, gang leaders' },
        
      { name:'Gotham University', pos:[40,15,-60], color:0x4169e1, type:'neutral', threat:'low', icon:'🎓',
        description:'Prestigious university known for research programs and frequent villain targets.',
        details:'Students: 15,000+ enrolled<br>Notable alumni: Many Wayne family members<br>Research: Advanced sciences, criminology' },
        
      { name:'Livs Apartment', pos:[25,12,-25], color:0xff69b4, type:'neutral', threat:'low', icon:'🏠',
        description:'Cozy apartment in Midtown district. Safe neighborhood with good security.',
        details:'Location: Midtown residential district<br>Building: Modern high-rise with doorman<br>Security: 24/7 concierge, security cameras' },
        
      { name:'The Narrows', pos:[100,5,80], color:0x2f4f4f, type:'villain', threat:'extreme', icon:'🏚️',
        description:'Most dangerous slum, a maze of decrepit buildings and criminal hideouts.',
        details:'Population: Mostly impoverished families<br>Crime rate: Extremely high<br>Gang presence: Multiple competing factions' },
        
      { name:'Amusement Mile', pos:[150,5,-50], color:0xff1493, type:'villain', threat:'extreme', icon:'🎪',
        description:'Abandoned amusement park, now the Jokers primary base of operations.',
        details:'Status: Closed since 1985, now Joker territory<br>Hazards: Booby traps, laughing gas, unstable structures' },
        
      { name:'Diamond District', pos:[35,18,-45], color:0xe6e6fa, type:'neutral', threat:'low', icon:'💎',
        description:'Upscale shopping and business district with luxury stores.',
        details:'Establishments: Luxury boutiques, fine dining, art galleries<br>Clientele: Elite<br>Security: High-end private security' },
        
      { name:'The East End', pos:[120,8,40], color:0x696969, type:'villain', threat:'high', icon:'🌃',
        description:'Working-class district known for organized crime and Catwomans territory.',
        details:'Population: Working families, some criminal elements<br>Notable: Catwoman operating area<br>Crime: Organized theft' },
        
      { name:'Robbinsville', pos:[60,15,-100], color:0x9370db, type:'neutral', threat:'low', icon:'🏡',
        description:'Upscale residential area where many wealthy families live.',
        details:'Demographics: Upper class families<br>Housing: Mansions, luxury condos<br>Security: Private security firms' }
    ];

    const streets = [
      { name:'Wayne Boulevard', direction:'horizontal', position:-30 },
      { name:'Gordon Avenue', direction:'horizontal', position:0 },
      { name:'Penguin Street', direction:'horizontal', position:60 },
      { name:'Batman Drive', direction:'vertical', position:-40 },
      { name:'Main Street', direction:'vertical', position:0 },
      { name:'Joker Lane', direction:'vertical', position:80 },
      { name:'Arkham Road', direction:'horizontal', position:120 },
      { name:'Harvey Dent Way', direction:'vertical', position:-100 },
    ];

    function init(){
      scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x0b0b15, 80, 600);

      camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
      camera.position.set(0,50,100);

      renderer = new THREE.WebGLRenderer({ antialias:true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x05050b);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      document.getElementById('container').appendChild(renderer.domElement);

      createCity();
      createSky();
      createStars();
      createMoon();
      createClouds();
      createWaterways();

      setupLighting();
      createBatSignal(); // ← NEW
      setupControls();
      setupMinimap();
      addStreetLabels();

      animate();
    }

    function createCity(){
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(600,600), new THREE.MeshLambertMaterial({ color:0x141428 }));
      ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; scene.add(ground);

      createStreets();
      // Create ALL locations so Wayne Manor is visible
      locations.forEach(loc => createLocation(loc));
    }

    function createStreets(){
      const streetMat = new THREE.MeshLambertMaterial({ color:0x2a2a2f });
      streets.forEach(street=>{
        if (street.direction==='horizontal'){
          const h = new THREE.Mesh(new THREE.PlaneGeometry(500,4), streetMat);
          h.rotation.x = -Math.PI/2; h.position.set(0,0.1,street.position); scene.add(h);
        } else {
          const v = new THREE.Mesh(new THREE.PlaneGeometry(4,500), streetMat);
          v.rotation.x = -Math.PI/2; v.position.set(street.position,0.1,0); scene.add(v);
        }
      });
    }

    // —— SKY
    function createSky(){
      const sky = new THREE.Mesh(
        new THREE.SphereGeometry(1200,32,32),
        new THREE.ShaderMaterial({
          side:THREE.BackSide,
          uniforms:{ topColor:{value:new THREE.Color(0x0a0a19)}, bottomColor:{value:new THREE.Color(0x151532)}, offset:{value:33}, exponent:{value:0.8} },
          vertexShader:\`varying vec3 vWorldPosition; void main(){ vec4 wp=modelMatrix*vec4(position,1.0); vWorldPosition=wp.xyz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }\`,
          fragmentShader:\`uniform vec3 topColor; uniform vec3 bottomColor; uniform float offset; uniform float exponent; varying vec3 vWorldPosition; void main(){ float h=normalize(vWorldPosition+offset).y; float t=max(pow(max(h,0.0),exponent),0.0); gl_FragColor=vec4(mix(bottomColor,topColor,t),1.0); }\`
        })
      );
      scene.add(sky);
    }
    function createStars(){
      const starCount=2000, radius=900, positions=new Float32Array(starCount*3);
      for(let i=0;i<starCount;i++){ const phi=Math.acos(2*Math.random()-1), theta=2*Math.PI*Math.random(), r=radius;
        positions[i*3]=r*Math.sin(phi)*Math.cos(theta);
        positions[i*3+1]=r*Math.cos(phi);
        positions[i*3+2]=r*Math.sin(phi)*Math.sin(theta);
      }
      const geo=new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(positions,3));
      scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ size:1.1, color:0xffffff })));
    }
    function createMoon(){
      const moon=new THREE.Mesh(new THREE.SphereGeometry(20,32,32), new THREE.MeshPhongMaterial({ color:0xeaeaea, emissive:0x222244, emissiveIntensity:0.2, shininess:5 }));
      moon.position.set(-250,260,-200); scene.add(moon);
      const halo=new THREE.Sprite(new THREE.SpriteMaterial({ color:0x99aaff, transparent:true, opacity:0.2 })); halo.scale.set(120,120,1); halo.position.copy(moon.position); scene.add(halo);
    }
    function createClouds(){
      const c=document.createElement('canvas'); c.width=256; c.height=128; const ctx=c.getContext('2d');
      const g=ctx.createLinearGradient(0,0,256,128); g.addColorStop(0,'rgba(255,255,255,0)'); g.addColorStop(.3,'rgba(255,255,255,.4)'); g.addColorStop(.7,'rgba(255,255,255,.35)'); g.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(128,64,120,50,0,0,Math.PI*2); ctx.fill();
      const tex=new THREE.CanvasTexture(c);
      for(let i=0;i<10;i++){ const sp=new THREE.Sprite(new THREE.SpriteMaterial({ map:tex, depthWrite:false, transparent:true, opacity:.6 }));
        sp.position.set((Math.random()*2-1)*400,120+Math.random()*40,(Math.random()*2-1)*400);
        const s=200+Math.random()*150; sp.scale.set(s,s*.5,1); sp.userData={speed:.02+Math.random()*.03}; scene.add(sp); cloudSprites.push(sp);
      }
    }
    function createWaterways(){
      const riverColor=0x1e3a5f, waterY=.11;
      function seg(x,z,len,deg,width){
        const geo=new THREE.PlaneGeometry(len,width);
        const mat=new THREE.MeshLambertMaterial({ color:riverColor, transparent:true, opacity:.95 });
        const m=new THREE.Mesh(geo,mat); m.rotation.x=-Math.PI/2; m.rotation.z=THREE.MathUtils.degToRad(deg); m.position.set(x,waterY,z); m.receiveShadow=true; scene.add(m);
      }
      // S-curve + branch
      seg(-200,30,180,15,14); seg(-110,20,160,-10,16); seg(-20,10,160,-5,18); seg(70,-5,160,-12,16); seg(160,-15,150,-20,14);
      seg(-160,55,120,35,10);
    }

    // —— SPECIAL LOCATIONS / BUILDINGS
    function createLocation(location){
      const [x,y,z]=location.pos; let buildingCount, special=false;
      if (location.name==='Wayne Tower'){ createWayneTower(x,y,z); buildingCount=10; special=true; }
      else if (location.name==='Wayne Manor'){ createWayneManor(x,y,z); buildingCount=2; special=true; }
      else if (location.name==='GCPD Headquarters'){ createGCPD(x,y,z); buildingCount=8; special=true; }
      else if (location.name==='Arkham Asylum'){ createArkham(x,y,z); buildingCount=12; special=true; }
      else if (location.name==='ACE Chemicals'){ createACEChemicals(x,y,z); buildingCount=6; special=true; }
      else if (location.name==='Batcave'){ createBatcave(x,y,z); buildingCount=0; special=true; }
      else if (location.name.includes('Docks')){ createDock(x,y,z,location.name); buildingCount=3; special=true; }
      else if (location.name.includes('Bridge') || location.name.includes('Overpass')){ createBridge(x,y,z,location); buildingCount=2; special=true; }
      else { buildingCount=15; }

      for(let i=0;i<buildingCount;i++){
        const width=Math.random()*8+4, height=Math.random()*40+10, depth=Math.random()*8+4;
        const building=new THREE.Mesh(new THREE.BoxGeometry(width,height,depth), new THREE.MeshLambertMaterial({ color:location.color }));
        let ox, oz;
        do { ox=x+(Math.random()-.5)*80; oz=z+(Math.random()-.5)*80; } while (special && Math.abs(ox-x)<20 && Math.abs(oz-z)<20);
        building.position.set(ox, height/2, oz); building.castShadow=true; building.receiveShadow=true;
        addWindows(building,width,height,depth,location.type);
        scene.add(building); buildings.push(building);
      }
      add3DLabel(location.name, x, y+40, z, location.type, location);
    }
    function createWayneTower(x,y,z){
      const tower=new THREE.Mesh(new THREE.BoxGeometry(15,120,15), new THREE.MeshLambertMaterial({ color:0x2c2c2c }));
      tower.position.set(x,60,z); tower.castShadow=true; scene.add(tower);
      const logo=new THREE.Mesh(new THREE.CylinderGeometry(3,3,2,8), new THREE.MeshBasicMaterial({ color:0xffff00 }));
      logo.position.set(x,121,z); scene.add(logo);
      addWindows(tower,15,120,15,'hero');
    }
    function createGCPD(x,y,z){
      const g=new THREE.Mesh(new THREE.BoxGeometry(25,35,20), new THREE.MeshLambertMaterial({ color:0x0064ff }));
      g.position.set(x,17.5,z); g.castShadow=true; scene.add(g);
      const antenna=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,15,8), new THREE.MeshBasicMaterial({ color:0xffffff }));
      antenna.position.set(x,42.5,z); scene.add(antenna);
      for(let i=0;i<4;i++){ const car=new THREE.Mesh(new THREE.BoxGeometry(3,1.5,6), new THREE.MeshLambertMaterial({ color:0x000080 })); car.position.set(x+i*4-6,.75,z+15); scene.add(car); }
      addWindows(g,25,35,20,'hero');
    }
    function createArkham(x,y,z){
      const a=new THREE.Mesh(new THREE.BoxGeometry(30,40,25), new THREE.MeshLambertMaterial({ color:0x2c1810 }));
      a.position.set(x,20,z); a.castShadow=true; scene.add(a);
      for(let i=0;i<4;i++){ const t=new THREE.Mesh(new THREE.BoxGeometry(8,50,8), new THREE.MeshLambertMaterial({ color:0x1a1a1a })); const ang=(i/4)*Math.PI*2; t.position.set(x+Math.cos(ang)*20,25,z+Math.sin(ang)*20); t.castShadow=true; scene.add(t); }
      addWindows(a,30,40,25,'villain');
    }
    function createACEChemicals(x,y,z){
      const f=new THREE.Mesh(new THREE.BoxGeometry(35,25,30), new THREE.MeshLambertMaterial({ color:0x228b22 }));
      f.position.set(x,12.5,z); f.castShadow=true; scene.add(f);
      for(let i=0;i<3;i++){ const vat=new THREE.Mesh(new THREE.CylinderGeometry(4,4,8,12), new THREE.MeshLambertMaterial({ color:0x00ff00 })); vat.position.set(x+(i-1)*12,4,z-15); scene.add(vat); }
      addWindows(f,35,25,30,'villain');
    }
    function createIcebergLounge(x,y,z){
      const l=new THREE.Mesh(new THREE.BoxGeometry(20,15,25), new THREE.MeshLambertMaterial({ color:0x00ffff })); l.position.set(x,7.5,z); l.castShadow=true; scene.add(l);
      const ice=new THREE.Mesh(new THREE.ConeGeometry(5,10,4), new THREE.MeshBasicMaterial({ color:0x87ceeb, transparent:true, opacity:.7 })); ice.position.set(x,20,z); scene.add(ice);
      addWindows(l,20,15,25,'villain');
    }
    function createBatcave(x,y,z){
      // Rocky arch entrance
      const rockMat = new THREE.MeshLambertMaterial({ color:0x303030 });
      const arch = new THREE.Group();
      for (let i=0;i<12;i++){
        const r = 4 + Math.random()*3;
        const s = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 12), rockMat);
        const ang = (i/12) * Math.PI; // semi-arch
        s.position.set(x + Math.cos(ang)*8 + (Math.random()-0.5)*2, y + Math.sin(ang)*4 + Math.random()*1.5, z + (Math.random()-0.5)*4);
        s.castShadow = true; s.receiveShadow = true;
        arch.add(s);
      }
      scene.add(arch);

      // Entrance platform
      const pad = new THREE.Mesh(new THREE.BoxGeometry(16,1,10), new THREE.MeshLambertMaterial({ color:0x1a1a1a }));
      pad.position.set(x, y-0.5, z+2); pad.receiveShadow = true; scene.add(pad);

      // Downward tunnel
      const tunnelLen = 28;
      const tunnel = new THREE.Mesh(
        new THREE.CylinderGeometry(6,6,tunnelLen, 24, 1, true),
        new THREE.MeshLambertMaterial({ color:0x151515, side:THREE.DoubleSide })
      );
      tunnel.rotation.z = Math.PI/2; // horizontal
      tunnel.rotation.y = -Math.PI/8; // slight turn
      tunnel.position.set(x-8, y-2, z-6);
      tunnel.castShadow = false; tunnel.receiveShadow = false; scene.add(tunnel);

      // Subtle worklight
      const wl = new THREE.PointLight(0x66aaff, 0.6, 40); wl.position.set(x, y+6, z+2); scene.add(wl);
    }
    function createDock(x,y,z,name){
      const dock=new THREE.Mesh(new THREE.BoxGeometry(30,2,10), new THREE.MeshLambertMaterial({ color:0x3b3b3b }));
      dock.position.set(x,1.2,z); dock.castShadow=true; dock.receiveShadow=true; scene.add(dock);
    }
    function createBridge(x,y,z,location){
      const length= location.name.includes('Wayne')?44: location.name.includes('ACE')?40:50;
      const color = location.name.includes('Wayne')?0xffd700: location.name.includes('ACE')?0x00ff00:0xffffff;
      const bridge=new THREE.Mesh(new THREE.BoxGeometry(length,3,6), new THREE.MeshLambertMaterial({ color }));
      bridge.position.set(x,6,z); bridge.rotation.y=THREE.MathUtils.degToRad(-10); bridge.castShadow=true; bridge.receiveShadow=true; scene.add(bridge);
    }
    function createWayneManor(x,y,z){
      const manor=new THREE.Mesh(new THREE.BoxGeometry(40,30,35), new THREE.MeshLambertMaterial({ color:0x8b4513 }));
      manor.position.set(x,15,z); manor.castShadow=true; scene.add(manor);
      for(let i=0;i<2;i++){
        const t=new THREE.Mesh(new THREE.BoxGeometry(12,45,12), new THREE.MeshLambertMaterial({ color:0x654321 }));
        t.position.set(x+(i===0?-18:18),22.5,z-10); t.castShadow=true; scene.add(t);
        const roof=new THREE.Mesh(new THREE.ConeGeometry(8,12,8), new THREE.MeshLambertMaterial({ color:0x2f4f2f })); roof.position.set(x+(i===0?-18:18),51,z-10); scene.add(roof);
      }
      const mainRoof=new THREE.Mesh(new THREE.BoxGeometry(42,2,37), new THREE.MeshLambertMaterial({ color:0x2f4f2f })); mainRoof.position.set(x,31,z); scene.add(mainRoof);
      addManorWindows(manor,40,30,35);
    }
    function addWindows(building,w,h,d,type){
      const group=new THREE.Group(); const base = type==='hero'?0x88aaff: type==='villain'?0xff4444:0x444488;
      for(let Y=3;Y<h-2;Y+=4){ for(let X=-w/2+1; X<w/2-1; X+=2){ if (Math.random()>.3){
        const win=new THREE.Mesh(new THREE.PlaneGeometry(.8,1.5), new THREE.MeshBasicMaterial({ color: Math.random()>.7?0xffff88:base, transparent:true, opacity:.8 }));
        win.position.set(X, Y-h/2, d/2+.01); group.add(win);
      }}}
      building.add(group);
    }
    function addManorWindows(building,w,h,d){
      const g=new THREE.Group();
      for(let Y=8; Y<h-5; Y+=12){ for(let X=-w/2+6; X<w/2-6; X+=8){
        const win=new THREE.Mesh(new THREE.PlaneGeometry(3,6), new THREE.MeshBasicMaterial({ color: Math.random()>.4?0xffff88:0x888800, transparent:true, opacity:.9 }));
        win.position.set(X, Y-h/2, d/2+.01); g.add(win);
      }}
      building.add(g);
    }

    function add3DLabel(text,x,y,z,type,locationData){
      const el=document.createElement('div'); el.className='label-3d'; el.textContent=text;
      if (type==='villain') el.classList.add('villain-label'); else if (type==='hero') el.classList.add('hero-label');
      el.addEventListener('click',(e)=>{ e.stopPropagation(); showLocationCard(locationData, e.pageX, e.pageY); });
      el.style.left='50%'; el.style.top='50%';
      document.getElementById('container').appendChild(el);
      labels.push({ element: el, position: new THREE.Vector3(x,y,z), locationData });
    }
    function showLocationCard(location,x,y){
      hideAllLocationCards();
      const card=document.createElement('div'); card.className=\`location-card \${location.type}\`;
      card.innerHTML=\`
        <div class="card-close" onclick="hideAllLocationCards()">×</div>
        <div class="card-header"><span class="card-icon">\${location.icon||'📍'}</span>\${location.name}
          <span class="card-threat threat-\${location.threat}">\${(location.threat||'low').toUpperCase()}</span></div>
        <div class="card-description">\${location.description||''}</div>
        <div class="card-details">\${(location.details||'').replace(/\\n/g,'<br>')}</div>
        <div style="margin-top:10px;font-size:10px;color:#999;">Click anywhere outside to close • Move with WASD to explore</div>\`;
      card.style.left=Math.min(x,window.innerWidth-320)+'px'; card.style.top=Math.min(y,window.innerHeight-200)+'px'; card.style.display='block';
      card.addEventListener('click',(e)=>e.stopPropagation());
      document.getElementById('container').appendChild(card);
      setTimeout(()=>{ if(card.parentNode) card.remove(); }, 15000);
    }
    function hideAllLocationCards(){ document.querySelectorAll('.location-card').forEach(c=>c.remove()); }
    window.hideAllLocationCards = hideAllLocationCards;

    function addStreetLabels(){
      streets.forEach(st=>{
        const el=document.createElement('div'); el.className='street-label'; el.textContent=st.name; document.getElementById('container').appendChild(el);
        const pos = st.direction==='horizontal' ? new THREE.Vector3(-200,2,st.position) : new THREE.Vector3(st.position,2,-200);
        labels.push({ element: el, position: pos, isStreet:true });
      });
    }

    function setupLighting(){
      scene.add(new THREE.AmbientLight(0x404060, .45));
      const moonLight=new THREE.DirectionalLight(0x99aaff, .7);
      moonLight.position.set(-250,260,-200); moonLight.castShadow=true;
      moonLight.shadow.camera.left=-300; moonLight.shadow.camera.right=300; moonLight.shadow.camera.top=300; moonLight.shadow.camera.bottom=-300;
      scene.add(moonLight);

      locations.forEach(loc=>{
        const pl=new THREE.PointLight(loc.color, .45, 100);
        pl.position.set(loc.pos[0], (loc.pos[1]||10)+20, loc.pos[2]); scene.add(pl);
      });
    }

    // ===== Bat-Signal (origin: GCPD rooftop) =====
    function createBatSignal(){
      const gcpd = locations.find(l=>l.name==='GCPD Headquarters');
      if (!gcpd) return;
      const origin = new THREE.Vector3(gcpd.pos[0], 42, gcpd.pos[2]); // rooftop-ish
      const targetPos = origin.clone().add(new THREE.Vector3(220, 320, -220)); // aim up to the sky

      // Spotlight
      batLight = new THREE.SpotLight(0xfff2a8, 2, 900, THREE.MathUtils.degToRad(22), 0.5, 0.9);
      batLight.position.copy(origin);
      batLight.castShadow = true;
      batLight.shadow.mapSize.set(1024,1024);
      batLight.target = new THREE.Object3D();
      batLight.target.position.copy(targetPos);
      scene.add(batLight); scene.add(batLight.target);

      // Volumetric-ish beam (transparent cylinder)
      const length = origin.distanceTo(targetPos);
      const beamGeo = new THREE.CylinderGeometry(32, 1.2, length, 24, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({ color:0xfff2a8, transparent:true, opacity:0.15, depthWrite:false, blending:THREE.AdditiveBlending });
      batBeam = new THREE.Mesh(beamGeo, beamMat);

      const dir = new THREE.Vector3().subVectors(targetPos, origin).normalize();
      const mid = origin.clone().add(targetPos).multiplyScalar(0.5);
      batBeam.position.copy(mid);
      // Align Y-axis of cylinder to dir
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), dir);
      batBeam.quaternion.copy(q);
      scene.add(batBeam);

      // Projected bat sprite in the sky (simple canvas with 🦇)
      const tex = makeBatSpriteTexture();
      batSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent:true, opacity:0.9 }));
      batSprite.scale.set(90, 90, 1);
      batSprite.position.copy(targetPos);
      scene.add(batSprite);

      // Initial state
      setBatSignal(true);

      // Hook button
      const btn = document.getElementById('toggle-batsignal');
      if (btn){
        btn.addEventListener('click', ()=>{
          setBatSignal(!batSignalOn);
        });
      }
    }
    function makeBatSpriteTexture(){
      const s=256; const c=document.createElement('canvas'); c.width=s; c.height=s; const ctx=c.getContext('2d');
      // glow circle
      const grad=ctx.createRadialGradient(s/2,s/2,10,s/2,s/2,s/2);
      grad.addColorStop(0,'rgba(255,250,200,1)'); grad.addColorStop(.8,'rgba(255,240,150,.8)'); grad.addColorStop(1,'rgba(255,240,150,0)');
      ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(s/2,s/2,s/2-4,0,Math.PI*2); ctx.fill();
      // bat glyph (emoji fallback)
      ctx.fillStyle='#000'; ctx.font='bold 150px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('🦇', s/2, s/2+8);
      const tex=new THREE.CanvasTexture(c);
      tex.anisotropy = 8;
      return tex;
    }
    function setBatSignal(on){
      batSignalOn = !!on;
      if (batLight) batLight.visible = batSignalOn;
      if (batBeam) batBeam.visible = batSignalOn;
      if (batSprite) batSprite.visible = batSignalOn;
      const btn = document.getElementById('toggle-batsignal');
      if (btn) btn.textContent = batSignalOn ? '🔦 Bat-Signal: ON' : '🔦 Bat-Signal: OFF';
    }

    // —— Controls / UI
    function setupControls(){
      document.addEventListener('keydown', (e)=>{
        switch(e.code){
          case 'KeyW': moveForward=true; break;
          case 'KeyS': moveBackward=true; break;
          case 'KeyA': moveLeft=true; break;
          case 'KeyD': moveRight=true; break;
          case 'KeyL': toggleLabels(); break;
          case 'KeyM': toggleMinimap(); break;
        }
      });
      document.addEventListener('keyup', (e)=>{
        switch(e.code){
          case 'KeyW': moveForward=false; break;
          case 'KeyS': moveBackward=false; break;
          case 'KeyA': moveLeft=false; break;
          case 'KeyD': moveRight=false; break;
        }
      });
      renderer.domElement.addEventListener('mousedown', ()=>{ isMouseDown=true; });
      renderer.domElement.addEventListener('mouseup', ()=>{ isMouseDown=false; });
      renderer.domElement.addEventListener('mousemove', (e)=>{
        if (isMouseDown){
          const dx=e.clientX-mouseX, dy=e.clientY-mouseY;
          camera.rotation.y -= dx*0.005; camera.rotation.x -= dy*0.005;
          camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
        }
        mouseX=e.clientX; mouseY=e.clientY;
      });
      renderer.domElement.addEventListener('wheel', (e)=>{
        const factor = 1 + (e.deltaY>0 ? .1 : -.1);
        camera.position.multiplyScalar(factor);
      });
      document.getElementById('container').addEventListener('click', ()=>hideAllLocationCards());
      document.querySelectorAll('.location').forEach(el=>{
        el.addEventListener('click', (ev)=>{
          ev.stopPropagation();
          const pos = el.dataset.pos.split(',').map(Number);
          camera.position.set(pos[0], pos[1]+30, pos[2]+50);
          camera.lookAt(pos[0], pos[1], pos[2]);
        });
      });
      window.addEventListener('resize', ()=>{
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    }

    function setupMinimap(){
      const minimap=document.getElementById('minimap');
      // include ALL for the map (so Wayne Manor appears)
      locations.forEach(location=>{
        const dot=document.createElement('div');
        if (location.type==='villain'){ dot.className='villain-dot'; dot.style.backgroundColor = \`#\${location.color.toString(16).padStart(6,'0')}\`; }
        else { dot.className='district-dot'; dot.style.backgroundColor = \`#\${location.color.toString(16).padStart(6,'0')}\`; }
        const mapX=((location.pos[0]+250)/500)*180, mapZ=((location.pos[2]+250)/500)*180;
        dot.style.left=mapX+'px'; dot.style.top=mapZ+'px'; dot.title=location.name; minimap.appendChild(dot);
      });
    }

    function toggleLabels(){ showLabels=!showLabels; labels.forEach(l=>l.element.style.display = showLabels?'block':'none'); }
    function toggleMinimap(){ const mm=document.getElementById('minimap'); mm.style.display = mm.style.display==='none' ? 'block' : 'none'; }

    function updateUI(){
      document.getElementById('coord-x').textContent=Math.round(camera.position.x);
      document.getElementById('coord-y').textContent=Math.round(camera.position.y);
      document.getElementById('coord-z').textContent=Math.round(camera.position.z);

      cloudSprites.forEach(sp=>{ sp.position.x += sp.userData.speed; if (sp.position.x>420) sp.position.x=-420; });

      const playerDot=document.getElementById('player-dot');
      const mapX=((camera.position.x+250)/500)*180, mapZ=((camera.position.z+250)/500)*180;
      playerDot.style.left=mapX+'px'; playerDot.style.top=mapZ+'px';

      let nearest='Unknown', minDist=Infinity, currentThreat='low';
      locations.forEach(loc=>{
        const d=Math.hypot(camera.position.x-loc.pos[0], camera.position.z-loc.pos[2]);
        if (d<minDist && d<100){ minDist=d; nearest=loc.name; currentThreat=loc.threat; }
      });

      let currentStreet='Unknown Street', streetDist=Infinity;
      streets.forEach(st=>{
        const d = st.direction==='horizontal' ? Math.abs(camera.position.z-st.position) : Math.abs(camera.position.x-st.position);
        if (d<streetDist && d<25){ streetDist=d; currentStreet=st.name; }
      });

      document.getElementById('current-location').textContent = \`Location: \${nearest}\`;
      document.getElementById('current-street').textContent = currentStreet;
      const threatEl=document.getElementById('threat-level');
      threatEl.textContent = \`Threat Level: \${currentThreat.toUpperCase()}\`;
      const colors={low:'#00ff00',medium:'#ffff00',high:'#ff8800',extreme:'#ff0000'}; threatEl.style.color=colors[currentThreat]||'#00ff00';
      threatEl.style.fontWeight = currentThreat==='extreme' ? 'bold' : 'normal';

      // project labels
      labels.forEach(l=>{
        const v=l.position.clone(); v.project(camera);
        const x=(v.x*.5+.5)*window.innerWidth, y=(v.y*-.5+.5)*window.innerHeight;
        const dist=camera.position.distanceTo(l.position); const visible = v.z<1 && dist<250;
        if (visible && showLabels){
          l.element.style.left=x+'px'; l.element.style.top=y+'px'; l.element.style.display='block';
          const op=Math.max(.3, 1-(dist/250)); l.element.style.opacity= op; if (l.isStreet){ l.element.style.fontSize='8px'; l.element.style.opacity=op*.6; }
        } else { l.element.style.display='none'; }
      });
    }

    function animate(){
      requestAnimationFrame(animate);
      const speed=2; const dir=new THREE.Vector3();
      dir.z = Number(moveForward)-Number(moveBackward);
      dir.x = Number(moveRight)-Number(moveLeft);
      dir.normalize();
      if (dir.length()>0){
        const e=new THREE.Euler(0,camera.rotation.y,0);
        dir.applyEuler(e); camera.position.add(dir.multiplyScalar(speed));
        camera.position.y = Math.max(5, camera.position.y);
      }

      if (Math.random()>.98){
        buildings.forEach(b=>{
          if (b.children[0] && b.children[0].children.length>0){
            const wins=b.children[0].children; const w=wins[Math.floor(Math.random()*wins.length)]; if (w.material) w.material.opacity = Math.random()*.8+.2;
          }
        });
      }

      updateUI();
      renderer.render(scene,camera);
    }

    // PostMessage listener for parent communication
    console.log('🔧 PostMessage listener setup complete');
    window.addEventListener('message', (event) => {
      console.log('🗺️ Map received ANY message:', event);
      console.log('🗺️ Message data:', event.data);
      console.log('🗺️ Message origin:', event.origin);
      
      if (event.data && event.data.type === 'TEST_MESSAGE') {
        console.log('🧪 Received test message from parent:', event.data.message);
      } else if (event.data && event.data.type === 'HIGHLIGHT_LOCATION') {
        console.log('🎯 Processing HIGHLIGHT_LOCATION for:', event.data.location);
        // Wait for map to be fully initialized
        if (camera && scene && renderer) {
          highlightLocationOnMap(event.data.location);
        } else {
          console.log('⏳ Map not ready yet, waiting...');
          setTimeout(() => {
            if (camera && scene && renderer) {
              highlightLocationOnMap(event.data.location);
            } else {
              console.error('❌ Map components still not ready after delay');
            }
          }, 1000);
        }
      } else {
        console.log('🤷 Message was not HIGHLIGHT_LOCATION type:', event.data?.type);
      }
    });
    
    // Test postMessage reception
    console.log('🧪 Map initialization complete, ready for messages!');

    function highlightLocationOnMap(locationName) {
      console.log('🔍 Searching for location:', locationName);
      console.log('📍 Available locations count:', locations.length);
      
      // Find location in the locations array
      const location = locations.find(loc => {
        const cleanName = loc.name.replace(/[🏰🦇🏥🏛️🌉🎭🏢⚖️🔬🏦🎪🌆🏪🏭]/g, '').trim();
        const cleanSearchName = locationName.replace(/[🏰🦇🏥🏛️🌉🎭🏢⚖️🔬🏦🎪🌆🏪🏭]/g, '').trim();
        
        // Remove common prefixes like "The" for better matching
        const simpleName = cleanName.replace(/^(The\s+)/i, '').toLowerCase();
        const simpleSearchName = cleanSearchName.replace(/^(The\s+)/i, '').toLowerCase();
        
        console.log('  🔍 Comparing:', simpleName, 'vs', simpleSearchName);
        
        return simpleName.includes(simpleSearchName) || 
               simpleSearchName.includes(simpleName) ||
               simpleName === simpleSearchName;
      });
      
      if (location) {
        console.log('✅ Found location:', location.name, 'at position:', location.pos);
        console.log('📷 Current camera position:', camera.position);
        
        // Get target position
        const [x, y, z] = location.pos;
        
        // Animate camera to location
        animateCameraToLocation(x, y, z, location);
      } else {
        console.error('❌ Location not found. Available locations:');
        locations.forEach(loc => console.log('  📍', loc.name));
      }
    }

    function animateCameraToLocation(x, y, z, locationData) {
      console.log('🎬 Starting camera animation to:', x, y, z);
      console.log('📷 Current camera position:', camera.position.x, camera.position.y, camera.position.z);
      
      // Store initial camera position
      const startPos = camera.position.clone();
      const targetPos = new THREE.Vector3(x + 50, y + 40, z + 50); // Closer positioning
      
      console.log('🎯 Target position:', targetPos.x, targetPos.y, targetPos.z);
      
      let progress = 0;
      const duration = 2.0; // 2 seconds
      const frameRate = 60;
      const increment = 1 / (duration * frameRate);
      
      function animateFrame() {
        progress += increment;
        
        if (progress <= 1) {
          // Smooth interpolation
          const t = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
          camera.position.lerpVectors(startPos, targetPos, t);
          
          // Look at the location
          const lookTarget = new THREE.Vector3(x, y, z);
          camera.lookAt(lookTarget);
          
          if (progress > 0.1 && progress < 0.2) {
            console.log('🎬 Animation progress:', Math.round(progress * 100) + '%');
          }
          
          requestAnimationFrame(animateFrame);
        } else {
          // Final position
          camera.position.copy(targetPos);
          camera.lookAt(x, y, z);
          
          console.log('✅ Animation complete! Camera at:', camera.position.x, camera.position.y, camera.position.z);
          
          // Show location card after animation
          setTimeout(() => {
            if (locationData) {
              console.log('📋 Showing location card for:', locationData.name);
              showLocationCard(locationData, window.innerWidth / 2, window.innerHeight / 2);
            }
          }, 500);
        }
      }
      
      animateFrame();
    }

    // Make functions available globally for debugging
    window.camera = camera;
    window.THREE = THREE;
    window.highlightLocationOnMap = highlightLocationOnMap;

    init();
  </script>
</body>
</html>
`;
