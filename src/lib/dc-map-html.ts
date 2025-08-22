
export const dcMapHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DC Universe - Interactive Map of Major Cities</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        /* THEME WRAPPER */
        body.theme-night {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 30%, #16213e 70%, #0f3460 100%);
            color: #fff;
        }
        body.theme-day {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #e8f4fd 0%, #b8e6ff 30%, #87ceeb 70%, #4a90e2 100%);
            color: #0f172a;
        }

        body { overflow: hidden; height: 100vh; }
        .container { position: relative; width: 100vw; height: 100vh; overflow: hidden; }

        .theme-night .map-container { filter: saturate(1.1) contrast(1.05); }
        .theme-day .map-container { filter: brightness(1.1) contrast(0.95) saturate(0.9); }

        .map-container {
            position: relative;
            width: 100%; height: 100%;
            background: radial-gradient(ellipse at center, #2c5f7e 0%, #1a3a52 50%, #0d1f2d 100%);
            overflow: hidden; cursor: grab; touch-action: none;
        }
        .map-container:active { cursor: grabbing; }

        .dc-map { 
            position: relative; 
            width: 2800px; 
            height: 2000px; 
            transform-origin: center; 
            transition: transform 0.3s ease;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2800 2000"><defs><pattern id="water" patternUnits="userSpaceOnUse" width="40" height="40"><rect width="40" height="40" fill="%23236B8E"/><circle cx="20" cy="20" r="2" fill="%23268BD2" opacity="0.3"/></pattern></defs><rect width="2800" height="2000" fill="url(%23water)"/></svg>') repeat;
        }

        /* CONTINENTS/LANDMASSES */
        .continent { 
            position: absolute; 
            background: linear-gradient(45deg, #2d4a22, #3e5c2e, #4a6b35);
            border: 2px solid #5a7c42;
            border-radius: 15px;
            box-shadow: inset 0 0 20px rgba(0,0,0,0.3), 0 5px 15px rgba(0,0,0,0.4);
        }
        .north-america { 
            top: 200px; left: 300px; 
            width: 1200px; height: 800px;
            clip-path: polygon(20% 0%, 80% 0%, 95% 30%, 90% 60%, 85% 80%, 70% 95%, 30% 90%, 10% 70%, 5% 40%);
        }
        .south-america { 
            top: 900px; left: 600px; 
            width: 400px; height: 600px;
            clip-path: polygon(30% 0%, 70% 0%, 85% 40%, 90% 70%, 70% 100%, 30% 95%, 15% 60%, 20% 20%);
        }
        .europe { 
            top: 150px; left: 1600px; 
            width: 350px; height: 300px;
            clip-path: polygon(0% 50%, 20% 0%, 80% 10%, 100% 40%, 90% 80%, 60% 100%, 10% 90%);
        }
        .africa { 
            top: 400px; left: 1550px; 
            width: 400px; height: 700px;
            clip-path: polygon(40% 0%, 60% 0%, 80% 30%, 85% 70%, 70% 100%, 30% 95%, 15% 60%, 25% 20%);
        }
        .asia { 
            top: 100px; left: 1900px; 
            width: 600px; height: 500px;
            clip-path: polygon(0% 40%, 30% 0%, 70% 5%, 100% 30%, 95% 70%, 70% 100%, 20% 90%, 5% 60%);
        }

        /* ISLANDS */
        .island { 
            position: absolute; 
            background: radial-gradient(circle, #4a6b35, #3e5c2e);
            border: 2px solid #5a7c42;
            border-radius: 50%;
            box-shadow: 0 3px 8px rgba(0,0,0,0.4);
        }
        .themyscira { top: 600px; left: 1300px; width: 80px; height: 60px; background: radial-gradient(circle, #8e44ad, #9b59b6); border-color: #a569bd; }
        .atlantis { top: 800px; left: 900px; width: 100px; height: 70px; background: radial-gradient(circle, #1abc9c, #16a085); border-color: #17a2b8; }
        .dinosaur-island { top: 1100px; left: 1100px; width: 60px; height: 50px; background: radial-gradient(circle, #27ae60, #2ecc71); border-color: #58d68d; }

        /* CITIES */
        .city { 
            position: absolute; 
            width: 25px; height: 25px; 
            border-radius: 50%; 
            cursor: pointer; 
            transition: all 0.3s ease; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 14px; 
            color: #000; 
            font-weight: bold;
            box-shadow: 0 0 10px rgba(0,0,0,0.4), 0 0 20px rgba(255,255,255,0.1);
            border: 2px solid rgba(255,255,255,0.3);
        }
        .city:hover { 
            transform: scale(1.5); 
            z-index: 50;
            box-shadow: 0 0 15px rgba(241,196,15,0.8), 0 0 30px rgba(255,255,255,0.3);
        }

        /* City-specific colors */
        .metropolis { background: linear-gradient(45deg, #3498db, #5dade2); top: 450px; left: 800px; }
        .gotham { background: linear-gradient(45deg, #2c3e50, #34495e); top: 400px; left: 750px; }
        .central-city { background: linear-gradient(45deg, #e74c3c, #f39c12); top: 500px; left: 900px; }
        .star-city { background: linear-gradient(45deg, #27ae60, #58d68d); top: 350px; left: 650px; }
        .coast-city { background: linear-gradient(45deg, #9b59b6, #bb8fce); top: 380px; left: 550px; }
        .smallville { background: linear-gradient(45deg, #f1c40f, #f4d03f); top: 550px; left: 850px; }
        .keystone { background: linear-gradient(45deg, #e67e22, #f0b27a); top: 520px; left: 920px; }
        .bludhaven { background: linear-gradient(45deg, #17a2b8, #5dade2); top: 420px; left: 770px; }
        .hub-city { background: linear-gradient(45deg, #6c757d, #adb5bd); top: 480px; left: 820px; }
        .fawcett-city { background: linear-gradient(45deg, #dc3545, #f8d7da); top: 600px; left: 700px; }
        .steel-city { background: linear-gradient(45deg, #495057, #6c757d); top: 460px; left: 880px; }
        .national-city { background: linear-gradient(45deg, #007bff, #6db3f2); top: 400px; left: 600px; }

        /* LANDMARKS */
        .landmark { 
            position: absolute; 
            width: 18px; height: 18px; 
            background: #f1c40f; 
            border-radius: 50%; 
            cursor: pointer; 
            transition: all 0.3s ease; 
            box-shadow: 0 0 8px rgba(241,196,15,0.6);
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 10px; 
            color: #000; 
            font-weight: bold; 
            z-index: 25;
        }
        .landmark:hover { 
            transform: scale(1.8); 
            background: #e67e22; 
            box-shadow: 0 0 15px rgba(241,196,15,0.9); 
            z-index: 30; 
        }

        .daily-planet { top: 440px; left: 810px; background: #3498db; }
        .wayne-enterprises { top: 390px; left: 760px; background: #2c3e50; }
        .star-labs { top: 490px; left: 910px; background: #e74c3c; }
        .lexcorp { top: 460px; left: 790px; background: #8e44ad; }
        .queen-industries { top: 340px; left: 660px; background: #27ae60; }
        .mount-justice { top: 550px; left: 950px; background: #f39c12; }
        .watchtower { top: 200px; left: 1000px; background: #17a2b8; }
        .fortress-solitude { top: 50px; left: 1200px; background: #e8f8f5; color: #000; }

        /* CHARACTERS LAYER */
        .layer { position: absolute; inset: 0; pointer-events: none; z-index: 40; }
        .layer.hidden { display: none; }
        .character { 
            position: absolute; 
            width: 22px; height: 22px; 
            border-radius: 50%; 
            display: grid; 
            place-items: center; 
            font-size: 14px; 
            color: #000; 
            box-shadow: 0 0 10px rgba(0,0,0,0.35); 
            pointer-events: auto; 
            cursor: pointer; 
            transition: transform 0.2s ease;
            border: 2px solid rgba(255,255,255,0.5);
        }
        .character:hover { transform: scale(1.15); }

        .char-superman { background: #dc143c; top: 440px; left: 810px; }
        .char-batman { background: #2c3e50; top: 390px; left: 760px; }
        .char-flash { background: #ffd700; top: 490px; left: 910px; }
        .char-green-arrow { background: #228b22; top: 340px; left: 660px; }
        .char-green-lantern { background: #00ff00; top: 370px; left: 560px; }
        .char-wonder-woman { background: #ff69b4; top: 590px; left: 1310px; }
        .char-aquaman { background: #00ced1; top: 790px; left: 910px; }
        .char-cyborg { background: #c0c0c0; top: 540px; left: 960px; }

        /* Tooltip for characters */
        .character::after { 
            content: attr(data-name); 
            position: absolute; 
            top: -26px; 
            left: 50%; 
            transform: translateX(-50%); 
            background: rgba(0,0,0,0.8); 
            color: #fff; 
            font-size: 10px; 
            padding: 3px 6px; 
            border-radius: 4px; 
            white-space: nowrap; 
            opacity: 0; 
            pointer-events: none; 
            transition: opacity 0.2s ease; 
        }
        .character:hover::after { opacity: 1; }

        /* INFO PANEL */
        .info-panel { 
            position: absolute; 
            top: 20px; 
            right: 20px; 
            width: 400px; 
            max-height: calc(100vh - 40px); 
            background: rgba(20, 30, 48, 0.96); 
            border: 2px solid #34495e; 
            border-radius: 12px; 
            padding: 20px; 
            overflow-y: auto; 
            backdrop-filter: blur(15px); 
            box-shadow: 0 15px 35px rgba(0,0,0,0.6); 
            transform: translateX(100%); 
            transition: transform 0.4s ease; 
        }
        .theme-day .info-panel { 
            background: rgba(236, 244, 255, 0.96); 
            border-color: #c7d2fe; 
            color: #0f172a;
        }
        .info-panel.show { transform: translateX(0); }
        .info-panel h2 { 
            color: #f1c40f; 
            margin-bottom: 15px; 
            border-bottom: 2px solid #f1c40f; 
            padding-bottom: 8px; 
            font-size: 1.4em; 
        }
        .info-panel h3 { 
            color: #3498db; 
            margin-top: 15px; 
            margin-bottom: 8px; 
            font-size: 1.1em; 
        }
        .info-panel p { 
            line-height: 1.7; 
            margin-bottom: 12px; 
            font-size: 0.95em; 
        }
        .close-btn { 
            position: absolute; 
            top: 12px; 
            right: 18px; 
            background: none; 
            border: none; 
            color: #e74c3c; 
            font-size: 28px; 
            cursor: pointer; 
            transition: color 0.3s ease; 
        }
        .close-btn:hover { color: #c0392b; }

        .controls { 
            position: absolute; 
            bottom: 20px; 
            left: 20px; 
            display: flex; 
            gap: 12px; 
            flex-wrap: wrap; 
            z-index: 1000; 
        }
        .control-btn { 
            background: rgba(20,30,48,0.92); 
            border: 2px solid #34495e; 
            color: #fff; 
            padding: 12px 18px; 
            border-radius: 8px; 
            cursor: pointer; 
            transition: all 0.3s ease; 
            backdrop-filter: blur(8px); 
            font-size: 0.9em; 
            font-weight: bold; 
        }
        .control-btn:hover { 
            background: rgba(52,73,94,0.95); 
            border-color: #f1c40f; 
            transform: translateY(-2px); 
        }
        .control-btn.active { 
            border-color: #10b981; 
            box-shadow: 0 0 0 2px rgba(16,185,129,0.25); 
        }
        .theme-day .control-btn { 
            background: rgba(233, 238, 246, 0.92); 
            color: #0f172a; 
            border-color: #cbd5e1; 
        }
        .theme-day .control-btn:hover { 
            background: rgba(246, 249, 255, 0.95); 
            border-color: #64748b; 
        }

        .title { 
            position: absolute; 
            top: 20px; 
            left: 20px; 
            z-index: 1000; 
        }
        .title h1 { 
            color: #f1c40f; 
            font-size: 3em; 
            text-shadow: 4px 4px 8px rgba(0,0,0,0.8); 
            margin-bottom: 8px; 
            font-weight: bold; 
        }
        .title p { 
            color: #bdc3c7; 
            font-size: 1.3em; 
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8); 
        }
        .title .subtitle { 
            color: #95a5a6; 
            font-size: 1em; 
            margin-top: 5px; 
        }

        .legend { 
            position: absolute; 
            bottom: 20px; 
            right: 20px; 
            background: rgba(20,30,48,0.9); 
            padding: 15px; 
            border-radius: 8px; 
            font-size: 11px; 
            border: 1px solid #34495e; 
            z-index: 1000; 
        }
        .legend h4 { 
            color: #f1c40f; 
            margin-bottom: 8px; 
        }
        .legend-item { 
            display: flex; 
            align-items: center; 
            margin-bottom: 4px; 
        }
        .legend-color { 
            width: 12px; 
            height: 12px; 
            margin-right: 8px; 
            border-radius: 2px; 
        }
        .theme-day .legend { 
            background: rgba(236, 244, 255, 0.95); 
            border-color: #c7d2fe; 
            color: #0f172a;
        }

        /* Effects */
        @keyframes pulse { 
            0% { box-shadow: 0 0 8px rgba(241,196,15,0.6); } 
            50% { box-shadow: 0 0 20px rgba(241,196,15,0.9); } 
            100% { box-shadow: 0 0 8px rgba(241,196,15,0.6); } 
        }
        .landmark.pulse { animation: pulse 2.5s infinite; }

        @keyframes heroGlow {
            0% { box-shadow: 0 0 10px rgba(0,0,0,0.35); }
            50% { box-shadow: 0 0 20px rgba(241,196,15,0.7); }
            100% { box-shadow: 0 0 10px rgba(0,0,0,0.35); }
        }
        .character.pulse { animation: heroGlow 3s infinite; }

        .city-label { 
            position: absolute; 
            color: #f1c40f; 
            font-size: 11px; 
            font-weight: bold; 
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8); 
            pointer-events: none; 
            z-index: 15; 
            white-space: nowrap;
        }
        .theme-day .city-label { 
            color: #0f172a; 
            text-shadow: 1px 1px 0 rgba(255,255,255,0.8); 
        }

        /* Utility */
        .sr-only { 
            position: absolute; 
            width: 1px; 
            height: 1px; 
            padding: 0; 
            margin: -1px; 
            overflow: hidden; 
            clip: rect(0,0,0,0); 
            white-space: nowrap; 
            border: 0; 
        }
    </style>
</head>
<body class="theme-night">
    <div class="container">
        <div class="title">
            <h1>DC UNIVERSE</h1>
            <p>Interactive Map of Major Cities & Locations</p>
            <p class="subtitle">Explore the World of DC Comics</p>
        </div>

        <div class="map-container" id="mapContainer">
            <div class="dc-map" id="dcMap">
                <!-- CONTINENTS -->
                <div class="continent north-america"></div>
                <div class="continent south-america"></div>
                <div class="continent europe"></div>
                <div class="continent africa"></div>
                <div class="continent asia"></div>

                <!-- SPECIAL ISLANDS -->
                <div class="island themyscira" data-info="themyscira">
                    <div style="color:#ecf0f1;font-size:9px;text-align:center;margin-top:20px;">THEMYSCIRA</div>
                </div>
                <div class="island atlantis" data-info="atlantis">
                    <div style="color:#ecf0f1;font-size:9px;text-align:center;margin-top:25px;">ATLANTIS</div>
                </div>
                <div class="island dinosaur-island" data-info="dinosaur-island">
                    <div style="color:#ecf0f1;font-size:8px;text-align:center;margin-top:18px;">DINOSAUR IS.</div>
                </div>

                <!-- MAJOR CITIES -->
                <div class="city metropolis" data-info="metropolis" title="Metropolis">🏙️</div>
                <div class="city gotham" data-info="gotham" title="Gotham City">🦇</div>
                <div class="city central-city" data-info="central-city" title="Central City">⚡</div>
                <div class="city star-city" data-info="star-city" title="Star City">🏹</div>
                <div class="city coast-city" data-info="coast-city" title="Coast City">💚</div>
                <div class="city smallville" data-info="smallville" title="Smallville">🌾</div>
                <div class="city keystone" data-info="keystone" title="Keystone City">🔥</div>
                <div class="city bludhaven" data-info="bludhaven" title="Blüdhaven">🌃</div>
                <div class="city hub-city" data-info="hub-city" title="Hub City">❓</div>
                <div class="city fawcett-city" data-info="fawcett-city" title="Fawcett City">⚡</div>
                <div class="city steel-city" data-info="steel-city" title="Steel City">🏭</div>
                <div class="city national-city" data-info="national-city" title="National City">💫</div>

                <!-- CITY LABELS -->
                <div class="city-label" style="top:430px;left:825px;">Metropolis</div>
                <div class="city-label" style="top:380px;left:775px;">Gotham</div>
                <div class="city-label" style="top:480px;left:925px;">Central City</div>
                <div class="city-label" style="top:330px;left:675px;">Star City</div>
                <div class="city-label" style="top:360px;left:575px;">Coast City</div>
                <div class="city-label" style="top:570px;left:875px;">Smallville</div>
                <div class="city-label" style="top:540px;left:945px;">Keystone</div>
                <div class="city-label" style="top:440px;left:795px;">Blüdhaven</div>
                <div class="city-label" style="top:500px;left:845px;">Hub City</div>
                <div class="city-label" style="top:620px;left:725px;">Fawcett City</div>
                <div class="city-label" style="top:440px;left:905px;">Steel City</div>
                <div class="city-label" style="top:380px;left:625px;">National City</div>

                <!-- MAJOR LANDMARKS -->
                <div class="landmark daily-planet" data-info="daily-planet" title="Daily Planet">📰</div>
                <div class="landmark wayne-enterprises" data-info="wayne-enterprises" title="Wayne Enterprises">🏢</div>
                <div class="landmark star-labs" data-info="star-labs" title="S.T.A.R. Labs">🔬</div>
                <div class="landmark lexcorp" data-info="lexcorp" title="LexCorp">🏗️</div>
                <div class="landmark queen-industries" data-info="queen-industries" title="Queen Industries">🏭</div>
                <div class="landmark mount-justice" data-info="mount-justice" title="Mount Justice">⛰️</div>
                <div class="landmark watchtower" data-info="watchtower" title="Watchtower">🛰️</div>
                <div class="landmark fortress-solitude" data-info="fortress-solitude" title="Fortress of Solitude">🏔️</div>

                <!-- CHARACTERS LAYER -->
                <div id="charactersLayer" class="layer hidden" aria-hidden="true">
                    <button class="character char-superman" data-name="Superman" title="Superman" data-info="superman">S<span class="sr-only">Superman</span></button>
                    <button class="character char-batman" data-name="Batman" title="Batman" data-info="batman">🦇<span class="sr-only">Batman</span></button>
                    <button class="character char-flash" data-name="The Flash" title="The Flash" data-info="flash">⚡<span class="sr-only">The Flash</span></button>
                    <button class="character char-green-arrow" data-name="Green Arrow" title="Green Arrow" data-info="green-arrow">🏹<span class="sr-only">Green Arrow</span></button>
                    <button class="character char-green-lantern" data-name="Green Lantern" title="Green Lantern" data-info="green-lantern">💚<span class="sr-only">Green Lantern</span></button>
                    <button class="character char-wonder-woman" data-name="Wonder Woman" title="Wonder Woman" data-info="wonder-woman">⭐<span class="sr-only">Wonder Woman</span></button>
                    <button class="character char-aquaman" data-name="Aquaman" title="Aquaman" data-info="aquaman">🔱<span class="sr-only">Aquaman</span></button>
                    <button class="character char-cyborg" data-name="Cyborg" title="Cyborg" data-info="cyborg">🤖<span class="sr-only">Cyborg</span></button>
                </div>
            </div>
        </div>

        <div class="controls">
            <button class="control-btn" onclick="zoomIn()" title="Zoom In">Zoom In</button>
            <button class="control-btn" onclick="zoomOut()" title="Zoom Out">Zoom Out</button>
            <button class="control-btn" onclick="resetView()" title="Reset View">Reset View</button>
            <button class="control-btn" onclick="focusAmerica()" title="Focus America">Focus America</button>
            <button class="control-btn" id="themeBtn" onclick="toggleTheme()" title="Toggle Day/Night">🌙 / ☀️</button>
            <button class="control-btn" id="charactersBtn" onclick="toggleCharacters()" title="Toggle Heroes">Heroes</button>
        </div>

        <div class="legend">
            <h4>DC Universe Legend</h4>
            <div class="legend-item"><div class="legend-color" style="background:#3498db;"></div><span>Major Cities</span></div>
            <div class="legend-item"><div class="legend-color" style="background:#f1c40f;"></div><span>Key Landmarks</span></div>
            <div class="legend-item"><div class="legend-color" style="background:#27ae60;"></div><span>Landmasses</span></div>
            <div class="legend-item"><div class="legend-color" style="background:#8e44ad;"></div><span>Special Islands</span></div>
            <div class="legend-item"><div class="legend-color" style="background:#e74c3c;"></div><span>Heroes (toggle)</span></div>
        </div>

        <div class="info-panel" id="infoPanel">
            <button class="close-btn" onclick="closePanel()" aria-label="Close info">&times;</button>
            <div id="infoContent">
                <h2>DC Universe</h2>
                <p>Welcome to the interactive map of the DC Universe! Explore the major cities where your favorite heroes protect innocent civilians and battle legendary villains.</p>
                <h3>Navigation</h3>
                <p>• <strong>Drag</strong> to explore • <strong>Zoom</strong> for details • Click <strong>cities/landmarks</strong> for information • Toggle <strong>Heroes</strong> layer • Switch <strong>Day/Night</strong> themes</p>
                <h3>Featured Locations</h3>
                <p><strong>Metropolis:</strong> Superman's city of tomorrow<br><strong>Gotham:</strong> Batman's dark urban landscape<br><strong>Central City:</strong> The Flash's speed-force nexus<br><strong>Themyscira:</strong> Wonder Woman's paradise island</p>
            </div>
        </div>
    </div>

    <script>
        let currentZoom = 1;
        let isMouseDown = false;
        let lastMousePos = { x: 0, y: 0 };
        let currentOffset = { x: 0, y: 0 };

        const mapContainer = document.getElementById('mapContainer');
        const dcMap = document.getElementById('dcMap');
        const infoPanel = document.getElementById('infoPanel');
        const infoContent = document.getElementById('infoContent');
        const themeBtn = document.getElementById('themeBtn');
        const charactersBtn = document.getElementById('charactersBtn');
        const charactersLayer = document.getElementById('charactersLayer');

        /* ===== Pan Controls (Mouse) ===== */
        mapContainer.addEventListener('mousedown', (e) => {
            if (e.target.closest('.city, .landmark, .island, .character')) return;
            isMouseDown = true;
            lastMousePos = { x: e.clientX, y: e.clientY };
            mapContainer.style.cursor = 'grabbing';
        });
        mapContainer.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            const deltaX = e.clientX - lastMousePos.x;
            const deltaY = e.clientY - lastMousePos.y;
            currentOffset.x += deltaX; 
            currentOffset.y += deltaY;
            updateMapTransform();
            lastMousePos = { x: e.clientX, y: e.clientY };
        });
        ['mouseup','mouseleave'].forEach(type => 
            mapContainer.addEventListener(type, () => { 
                isMouseDown = false; 
                mapContainer.style.cursor = 'grab'; 
            })
        );

        /* ===== Pan Controls (Touch) ===== */
        mapContainer.addEventListener('touchstart', (e) => {
            if (e.target.closest('.city, .landmark, .island, .character')) return;
            const t = e.touches[0];
            isMouseDown = true;
            lastMousePos = { x: t.clientX, y: t.clientY };
        }, { passive: false });
        mapContainer.addEventListener('touchmove', (e) => {
            if (!isMouseDown) return;
            const t = e.touches[0];
            const deltaX = t.clientX - lastMousePos.x;
            const deltaY = t.clientY - lastMousePos.y;
            currentOffset.x += deltaX; 
            currentOffset.y += deltaY;
            updateMapTransform();
            lastMousePos = { x: t.clientX, y: t.clientY };
            e.preventDefault();
        }, { passive: false });
        mapContainer.addEventListener('touchend', () => { 
            isMouseDown = false; 
        }, { passive: true });

        function updateMapTransform() {
            dcMap.style.transform = \`scale(\${currentZoom}) translate(\${currentOffset.x / currentZoom}px, \${currentOffset.y / currentZoom}px)\`;
        }

        function zoomIn() { 
            currentZoom = Math.min(currentZoom * 1.4, 4); 
            updateMapTransform(); 
        }
        function zoomOut() { 
            currentZoom = Math.max(currentZoom / 1.4, 0.3); 
            updateMapTransform(); 
        }
        function resetView() { 
            currentZoom = 0.6; 
            currentOffset = { x: 0, y: 0 }; 
            updateMapTransform(); 
        }
        function focusAmerica() {
            currentZoom = 1.2;
            currentOffset = { x: -200, y: 50 };
            updateMapTransform();
        }

        /* ===== Theme Toggle ===== */
        function toggleTheme() {
            const isDay = document.body.classList.toggle('theme-day');
            document.body.classList.toggle('theme-night', !isDay);
            themeBtn.classList.toggle('active', isDay);
            themeBtn.setAttribute('aria-pressed', String(isDay));
        }

        /* ===== Characters Layer Toggle ===== */
        function toggleCharacters() {
            const hidden = charactersLayer.classList.toggle('hidden');
            charactersLayer.setAttribute('aria-hidden', String(hidden));
            charactersBtn.classList.toggle('active', !hidden);
            charactersBtn.setAttribute('aria-pressed', String(!hidden));
        }

        // Click handlers for all interactive elements
        document.querySelectorAll('[data-info]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                const infoKey = element.getAttribute('data-info');
                showInfo(infoKey);
                document.querySelectorAll('.clicked').forEach(el => el.classList.remove('clicked'));
                element.classList.add('clicked');
            });
        });

        function showInfo(key) {
            const info = locationInfo[key];
            if (info) {
                infoContent.innerHTML = \`<h2>\${info.title}</h2>\${info.content}\`;
                infoPanel.classList.add('show');
            }
        }

        function closePanel() { 
            infoPanel.classList.remove('show'); 
            document.querySelectorAll('.clicked').forEach(el => el.classList.remove('clicked')); 
        }

        // Random landmark pulsing effect
        setInterval(() => {
            document.querySelectorAll('.pulse').forEach(el => el.classList.remove('pulse'));
            
            // Alternate between landmarks and characters
            const shouldPulseCharacter = Math.random() > 0.6 && !charactersLayer.classList.contains('hidden');
            
            if (shouldPulseCharacter) {
                const characters = document.querySelectorAll('.character');
                const randomChar = characters[Math.floor(Math.random() * characters.length)];
                if (randomChar) randomChar.classList.add('pulse');
            } else {
                const landmarks = document.querySelectorAll('.landmark');
                const randomLandmark = landmarks[Math.floor(Math.random() * landmarks.length)];
                if (randomLandmark) randomLandmark.classList.add('pulse');
            }
        }, 3500);

        // Prevent text selection while dragging
        mapContainer.addEventListener('selectstart', (e) => e.preventDefault());

        // Keyboard controls
        window.addEventListener('keydown', (e) => { 
            if (e.key === 'Escape') closePanel(); 
            if (e.key === ' ') { e.preventDefault(); focusAmerica(); }
        });

        // Initial view
        setTimeout(() => { resetView(); }, 100);

        // ===== Location Information Database =====
        const locationInfo = {
            'metropolis': {
                title: 'Metropolis - The City of Tomorrow',
                content: \`<h3>Superman's Home</h3>
                <p>Metropolis stands as a beacon of hope and progress, known as "The City of Tomorrow." This gleaming metropolis represents the best of human achievement and serves as home to the Daily Planet and Superman.</p>
                <h3>Key Features</h3>
                <p><strong>Daily Planet:</strong> Premier newspaper where Clark Kent works as a reporter alongside Lois Lane<br>
                <strong>LexCorp Tower:</strong> Lex Luthor's corporate headquarters and symbol of his power<br>
                <strong>Centennial Park:</strong> Large green space in the heart of the city<br>
                <strong>S.T.A.R. Labs:</strong> Scientific research facility</p>
                <h3>Notable Residents</h3>
                <p>Clark Kent/Superman, Lois Lane, Lex Luthor, Perry White, Jimmy Olsen</p>\`
            },
            'gotham': {
                title: 'Gotham City - The Dark Knight\\'s Domain',
                content: \`<h3>Batman's Vigilant Watch</h3>
                <p>Gotham City is a dark, gothic metropolis plagued by crime and corruption. Protected by Batman, this city has spawned some of the most notorious villains in the DC Universe.</p>
                <h3>Major Districts</h3>
                <p><strong>Crime Alley:</strong> Where Bruce Wayne's parents were murdered<br>
                <strong>Robinson Park:</strong> Central park often controlled by Poison Ivy<br>
                <strong>Financial District:</strong> Home to Wayne Enterprises<br>
                <strong>Arkham Island:</strong> Location of Arkham Asylum</p>
                <h3>Notable Residents</h3>
                <p>Bruce Wayne/Batman, Alfred Pennyworth, Commissioner Gordon, The Joker, Penguin, Catwoman</p>\`
            },
            'central-city': {
                title: 'Central City - Speed Force Nexus',
                content: \`<h3>The Flash's Territory</h3>
                <p>Central City is the home of Barry Allen, The Flash, and serves as a nexus point for Speed Force energy. This modern American city has become a hotspot for metahuman activity.</p>
                <h3>Key Locations</h3>
                <p><strong>S.T.A.R. Labs:</strong> Scientific research facility where Barry Allen works<br>
                <strong>Central City Police Department:</strong> Where Barry works as a forensic scientist<br>
                <strong>Flash Museum:</strong> Dedicated to The Flash's heroic legacy</p>
                <h3>Notable Residents</h3>
                <p>Barry Allen/The Flash, Iris West, Cisco Ramon, Dr. Caitlin Snow, Captain Cold</p>\`
            },
            'star-city': {
                title: 'Star City - Emerald Archer\\'s Home',
                content: \`<h3>Green Arrow's Base</h3>
                <p>Star City is a major Pacific Northwest metropolis protected by Oliver Queen, the Green Arrow. Known for its blend of urban development and natural beauty.</p>
                <h3>Key Features</h3>
                <p><strong>Queen Industries:</strong> Oliver Queen's family business headquarters<br>
                <strong>The Glades:</strong> Low-income district that Oliver works to improve<br>
                <strong>Arrow Cave:</strong> Green Arrow's secret base of operations</p>
                <h3>Notable Residents</h3>
                <p>Oliver Queen/Green Arrow, Dinah Lance/Black Canary, John Diggle, Felicity Smoak</p>\`
            },
            'coast-city': {
                title: 'Coast City - Green Lantern\\'s Sector',
                content: \`<h3>Hal Jordan's Home</h3>
                <p>Coast City is a California coastal metropolis and the home base of Green Lantern Hal Jordan. The city was completely destroyed by Mongul and rebuilt by Hal Jordan using his power ring.</p>
                <h3>History</h3>
                <p>Once destroyed in the "Reign of the Supermen" storyline, Coast City was rebuilt as a monument to the power of will and the Green Lantern Corps' protection of Earth.</p>
                <h3>Notable Residents</h3>
                <p>Hal Jordan/Green Lantern, Carol Ferris, Tom Kalmaku</p>\`
            },
            'smallville': {
                title: 'Smallville - Where It All Began',
                content: \`<h3>Superman's Childhood Home</h3>
                <p>Smallville, Kansas, is the small farming town where Clark Kent grew up with his adoptive parents, Martha and Jonathan Kent. This humble beginning shaped the values that would make Superman a symbol of hope.</p>
                <h3>Key Locations</h3>
                <p><strong>Kent Farm:</strong> Where Clark was raised and learned his values<br>
                <strong>Smallville High School:</strong> Where Clark attended school with Pete Ross and Lana Lang<br>
                <strong>Luthor Mansion:</strong> Lex Luthor's childhood home</p>
                <h3>Notable Residents</h3>
                <p>Martha Kent, Jonathan Kent, Pete Ross, Lana Lang (formerly Lex Luthor)</p>\`
            },
            'themyscira': {
                title: 'Themyscira - Paradise Island',
                content: \`<h3>Wonder Woman's Homeland</h3>
                <p>Themyscira, also known as Paradise Island, is the hidden island home of the Amazons. Protected by the gods and hidden from the world of men, it serves as a sanctuary of peace and warrior training.</p>
                <h3>Amazon Society</h3>
                <p>Led by Queen Hippolyta, the Amazons of Themyscira are immortal warriors dedicated to protecting the innocent and upholding justice. The island exists in a pocket dimension, protected from the outside world.</p>
                <h3>Notable Residents</h3>
                <p>Queen Hippolyta, Princess Diana/Wonder Woman, General Antiope, Artemis</p>\`
            },
            'atlantis': {
                title: 'Atlantis - Underwater Kingdom',
                content: \`<h3>Aquaman's Realm</h3>
                <p>Atlantis is an ancient underwater civilization and the kingdom ruled by Arthur Curry, known as Aquaman. This technologically advanced society exists beneath the ocean waves, hidden from surface dwellers.</p>
                <h3>Atlantean Society</h3>
                <p>The Atlanteans are an advanced aquatic people with incredible technology and the ability to breathe underwater. The kingdom is protected by powerful magical barriers and defended by Aquaman.</p>
                <h3>Notable Residents</h3>
                <p>Arthur Curry/Aquaman, Queen Mera, Vulko, Ocean Master</p>\`
            },
            'keystone': {
                title: 'Keystone City - Twin City of Central City',
                content: \`<h3>Jay Garrick's Territory</h3>
                <p>Keystone City is the twin city of Central City, separated by a river. It's the home of Jay Garrick, the original Flash, and has its own rich history of heroism and metahuman activity.</p>
                <h3>The Flash Legacy</h3>
                <p>While Central City is home to Barry Allen, Keystone City is protected by Jay Garrick, the Golden Age Flash, creating a unique dynamic between the two cities and two generations of speedsters.</p>\`
            },
            'bludhaven': {
                title: 'Blüdhaven - Nightwing\\'s Beat',
                content: \`<h3>Dick Grayson's City</h3>
                <p>Blüdhaven is a city near Gotham, known for being even more corrupt than its neighbor. It serves as the base of operations for Dick Grayson in his role as Nightwing, having moved from Gotham to establish his own heroic identity.</p>
                <h3>Crime and Corruption</h3>
                <p>Often called "Gotham's uglier sister city," Blüdhaven suffers from endemic corruption in its police force, government, and business sector, making it a perfect place for Nightwing to make a difference.</p>\`
            },
            'fawcett-city': {
                title: 'Fawcett City - Home of Shazam',
                content: \`<h3>Billy Batson's Territory</h3>
                <p>Fawcett City is the home of Billy Batson, who transforms into the hero Shazam. This city has a more classic, nostalgic American feel and serves as the base for the Marvel Family's adventures.</p>
                <h3>Magic and Wonder</h3>
                <p>Fawcett City often finds itself at the center of magical threats and mystical adventures, befitting its status as the home of Earth's Mightiest Mortal.</p>\`
            },
            'hub-city': {
                title: 'Hub City - The Question\\'s Domain',
                content: \`<h3>Vic Sage's Investigation Ground</h3>
                <p>Hub City is a decaying urban center plagued by corruption, crime, and urban decay. It serves as the base of operations for The Question, a faceless vigilante detective who seeks truth in a city built on lies.</p>
                <h3>Urban Decay</h3>
                <p>Often described as one of the most corrupt cities in America, Hub City provides the perfect backdrop for The Question's investigations into conspiracy and corruption.</p>\`
            },
            'daily-planet': {
                title: 'Daily Planet - Great Metropolitan Newspaper',
                content: \`<h3>Metropolis\\'s Premier News Source</h3>
                <p>The Daily Planet is Metropolis's most respected newspaper, known for its investigative journalism and high ethical standards. The iconic globe on top of the building serves as a landmark visible throughout the city.</p>
                <h3>Notable Staff</h3>
                <p><strong>Perry White:</strong> Editor-in-Chief known for his integrity<br>
                <strong>Lois Lane:</strong> Star investigative reporter<br>
                <strong>Clark Kent:</strong> Mild-mannered reporter (secretly Superman)<br>
                <strong>Jimmy Olsen:</strong> Photographer and Superman's pal</p>\`
            },
            'wayne-enterprises': {
                title: 'Wayne Enterprises - Corporate Empire',
                content: \`<h3>Bruce Wayne's Business Empire</h3>
                <p>Wayne Enterprises is one of the largest and most successful companies in the world, serving as both Bruce Wayne's public persona and a source of funding and technology for his Batman activities.</p>
                <h3>Divisions</h3>
                <p><strong>Wayne Tech:</strong> Advanced technology division<br>
                <strong>Wayne Biotech:</strong> Medical and pharmaceutical research<br>
                <strong>Wayne Aerospace:</strong> Aircraft and aerospace technology<br>
                <strong>Wayne Foundation:</strong> Charitable organization</p>\`
            },
            'star-labs': {
                title: 'S.T.A.R. Labs - Scientific Research',
                content: \`<h3>Scientific and Technological Advanced Research Laboratories</h3>
                <p>S.T.A.R. Labs is a major scientific research organization with facilities in multiple cities. They specialize in cutting-edge research, often involving metahuman studies and advanced technology.</p>
                <h3>Research Focus</h3>
                <p>Metahuman studies, particle physics, advanced materials, and experimental technology. Often assists heroes with scientific challenges and threats.</p>\`
            },
            'lexcorp': {
                title: 'LexCorp - Luthor\\'s Empire',
                content: \`<h3>Lex Luthor's Corporate Kingdom</h3>
                <p>LexCorp is the massive multinational corporation owned and operated by Lex Luthor. It serves as both a legitimate business empire and a front for Luthor's schemes against Superman.</p>
                <h3>Business Interests</h3>
                <p>Technology, defense contracts, real estate, media, and virtually every major industry. The LexCorp building dominates Metropolis's skyline as a symbol of Luthor's power.</p>\`
            },
            'fortress-solitude': {
                title: 'Fortress of Solitude - Superman\\'s Sanctuary',
                content: \`<h3>Superman's Arctic Retreat</h3>
                <p>The Fortress of Solitude is Superman's secret sanctuary located in the Arctic. Built from Kryptonian crystal technology, it serves as both a memorial to his lost home world and a place of solitude and reflection.</p>
                <h3>Kryptonian Heritage</h3>
                <p>Contains artifacts from Krypton, advanced alien technology, the Phantom Zone portal, and serves as Superman's connection to his Kryptonian heritage through AI constructs of his parents.</p>\`
            },
            'watchtower': {
                title: 'Watchtower - Justice League Headquarters',
                content: \`<h3>Justice League's Orbital Base</h3>
                <p>The Watchtower is the Justice League's orbital headquarters, monitoring Earth from space. This advanced satellite serves as a meeting place, communications hub, and strategic command center for the world's greatest heroes.</p>
                <h3>Advanced Technology</h3>
                <p>Teleportation systems, global monitoring equipment, meeting facilities, and living quarters for League members. Can monitor threats worldwide and coordinate hero responses.</p>\`
            },
            'superman': {
                title: 'Superman - The Last Son of Krypton',
                content: \`<h3>Clark Kent / Kal-El</h3>
                <p>Superman is Earth's greatest hero, born on the dying planet Krypton and raised in Smallville, Kansas. His incredible powers include super strength, flight, heat vision, and invulnerability.</p>
                <h3>The Symbol of Hope</h3>
                <p>As both Clark Kent and Superman, he represents the best of both worlds - human compassion and Kryptonian power. Based in Metropolis, he protects not just the city but the entire world.</p>\`
            },
            'batman': {
                title: 'Batman - The Dark Knight',
                content: \`<h3>Bruce Wayne</h3>
                <p>After witnessing his parents' murder as a child, Bruce Wayne dedicated his life to fighting crime. Using his wealth, intellect, and extensive training, he became Batman, Gotham's dark protector.</p>
                <h3>The World's Greatest Detective</h3>
                <p>Master of martial arts, detective work, and strategic planning. Though he has no superpowers, his preparation and determination make him one of the most formidable heroes in the DC Universe.</p>\`
            },
            'flash': {
                title: 'The Flash - Fastest Man Alive',
                content: \`<h3>Barry Allen</h3>
                <p>Barry Allen gained super-speed powers after being struck by lightning in his lab. As The Flash, he can run faster than light, travel through time, and access the Speed Force dimension.</p>
                <h3>Speed Force Champion</h3>
                <p>Based in Central City, The Flash protects not just his city but the entire timeline itself. His connection to the Speed Force makes him one of the most powerful heroes in existence.</p>\`
            },
            'wonder-woman': {
                title: 'Wonder Woman - Amazon Princess',
                content: \`<h3>Princess Diana of Themyscira</h3>
                <p>Wonder Woman is an Amazon warrior princess, gifted with powers by the Greek gods. She serves as an ambassador from Themyscira to the world of man, fighting for peace, love, and justice.</p>
                <h3>Divine Warrior</h3>
                <p>Possesses superhuman strength, the Lasso of Truth, indestructible bracelets, and the ability to fly. She bridges the gap between the mystical and modern worlds.</p>\`
            },
            'green-arrow': {
                title: 'Green Arrow - The Emerald Archer',
                content: \`<h3>Oliver Queen</h3>
                <p>Oliver Queen is a billionaire who became a master archer after being stranded on a desert island. As Green Arrow, he fights crime using trick arrows and serves as Star City's protector.</p>
                <h3>Social Justice Warrior</h3>
                <p>Unlike many heroes, Green Arrow is actively political, fighting not just crime but also social injustice and corruption. His partnership with Black Canary makes them one of DC's premier heroic couples.</p>\`
            },
            'green-lantern': {
                title: 'Green Lantern - Will Made Manifest',
                content: \`<h3>Hal Jordan</h3>
                <p>Hal Jordan is a test pilot who became Earth's Green Lantern when he inherited the power ring from dying alien Abin Sur. His ring is powered by willpower and can create anything he can imagine.</p>
                <h3>Space Cop</h3>
                <p>As a member of the Green Lantern Corps, Hal protects not just Earth but his entire space sector. His constructs are limited only by his imagination and willpower.</p>\`
            },
            'aquaman': {
                title: 'Aquaman - King of the Seven Seas',
                content: \`<h3>Arthur Curry</h3>
                <p>Arthur Curry is the half-human, half-Atlantean king of Atlantis. As Aquaman, he possesses superhuman strength, can breathe underwater, and communicate with all sea life.</p>
                <h3>Ruler of the Oceans</h3>
                <p>Aquaman serves as both a superhero and a king, protecting both the surface world and the underwater kingdom of Atlantis. He bridges two worlds that often conflict.</p>\`
            },
            'cyborg': {
                title: 'Cyborg - Half Man, Half Machine',
                content: \`<h3>Victor Stone</h3>
                <p>Victor Stone became Cyborg after a near-fatal accident led to his father replacing most of his body with advanced technology. He possesses incredible strength and can interface with any computer system.</p>
                <h3>Living Computer</h3>
                <p>Cyborg serves as the Justice League's technical specialist, able to hack into any system and coordinate team communications. His technology is constantly evolving and upgrading.</p>\`
            }
        };
    </script>
</body>
</html>
`;
