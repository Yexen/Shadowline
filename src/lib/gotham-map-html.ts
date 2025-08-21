
export const mapHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Canonical Gotham City Map - Complete Street Layout (v2)</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        /* THEME WRAPPER */
        body.theme-night {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%);
            color: #fff;
        }
        body.theme-day {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #e8eef5 0%, #dfe6ee 50%, #d3dbe6 100%);
            color: #0f172a;
        }

        body { overflow: hidden; height: 100vh; }
        .container { position: relative; width: 100vw; height: 100vh; overflow: hidden; }

        /* Subtle global day/night tint via filter on the city canvas */
        .theme-night .map-container { filter: saturate(1.05) contrast(1.0); }
        .theme-day .map-container { filter: brightness(1.08) contrast(0.95) saturate(0.85); }

        .map-container {
            position: relative;
            width: 100%; height: 100%;
            background: radial-gradient(ellipse at center, #2c3e50 0%, #1a252f 100%);
            overflow: hidden; cursor: grab; touch-action: none;
        }
        .map-container:active { cursor: grabbing; }

        .gotham-map { position: relative; width: 2000px; height: 1400px; transform-origin: center; transition: transform 0.3s ease; }

        /* ISLANDS */
        .island { position: absolute; border: 3px solid #34495e; background: rgba(44, 62, 80, 0.4); border-radius: 10px; }
        .uptown-island { top: 50px; left: 300px; width: 450px; height: 300px; background: rgba(52, 73, 94, 0.3); border-color: #5d6d7e; }
        .midtown-island { top: 400px; left: 200px; width: 600px; height: 350px; background: rgba(52, 73, 94, 0.3); border-color: #5d6d7e; }
        .downtown-island { top: 800px; left: 100px; width: 700px; height: 400px; background: rgba(52, 73, 94, 0.3); border-color: #5d6d7e; }
        .arkham-island { top: 250px; left: 900px; width: 120px; height: 80px; background: rgba(46, 204, 113, 0.4); border-color: #27ae60; }
        .blackgate-island { top: 150px; left: 1100px; width: 100px; height: 100px; background: rgba(149, 165, 166, 0.4); border-color: #95a5a6; }
        .paris-island { top: 300px; left: 1200px; width: 140px; height: 120px; background: rgba(155, 89, 182, 0.4); border-color: #9b59b6; }
        .tricorner-island { top: 950px; left: 950px; width: 180px; height: 140px; background: rgba(230, 126, 34, 0.4); border-color: #e67e22; }

        /* RIVERS */
        .river { position: absolute; background: linear-gradient(90deg, rgba(52,152,219,0.6), rgba(41,128,185,0.8)); border-radius: 15px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.3); }
        .gotham-river { top: 600px; left: 0; width: 2000px; height: 60px; }
        .sprang-river { top: 350px; left: 250px; width: 800px; height: 50px; transform: rotate(5deg); }
        .finger-river { top: 750px; left: 150px; width: 900px; height: 45px; transform: rotate(-3deg); }

        /* BRIDGES */
        .bridge { position: absolute; background: linear-gradient(90deg, #95a5a6, #7f8c8d); z-index: 15; border: 2px solid #566573; box-shadow: 0 4px 8px rgba(0,0,0,0.3); }
        .robert-kane-bridge { top: 580px; left: -50px; width: 200px; height: 15px; }
        .brown-bridge { top: 1180px; left: 50px; width: 150px; height: 12px; }
        .trigate-bridge { top: 275px; left: 850px; width: 80px; height: 10px; }
        .sprang-bridge { top: 365px; left: 400px; width: 120px; height: 12px; transform: rotate(5deg); }
        .westward-bridge { top: 765px; left: 300px; width: 140px; height: 12px; transform: rotate(-3deg); }

        /* STREETS */
        .street { position: absolute; background: rgba(149,165,166,0.6); border-radius: 2px; }
        .avenue { background: rgba(189,195,199,0.7); }
        .miller-avenue { top: 0; left: 350px; width: 8px; height: 1400px; }
        .oneill-avenue { top: 0; left: 450px; width: 8px; height: 1400px; }
        .finger-avenue { top: 0; left: 550px; width: 8px; height: 1400px; }
        .kane-avenue { top: 0; left: 650px; width: 8px; height: 1400px; }
        .aparo-street { top: 200px; left: 250px; width: 500px; height: 6px; }
        .dixon-street { top: 300px; left: 200px; width: 600px; height: 6px; }
        .grant-street { top: 500px; left: 150px; width: 650px; height: 6px; }
        .robinson-street { top: 600px; left: 100px; width: 700px; height: 6px; }
        .adams-street { top: 900px; left: 50px; width: 750px; height: 6px; }

        /* DISTRICTS */
        .district { position: absolute; border: 2px solid transparent; background: rgba(0,0,0,0.1); cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; text-align: center; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); backdrop-filter: blur(1px); font-size: 12px; border-radius: 8px; }
        .district:hover { background: rgba(241,196,15,0.3); border-color: #f1c40f; transform: scale(1.05); z-index: 20; box-shadow: 0 0 15px rgba(241,196,15,0.5); }
        .district.clicked { background: rgba(231,76,60,0.4); border-color: #e74c3c; box-shadow: 0 0 20px rgba(231,76,60,0.6); }

        /* UPTOWN DISTRICTS */
        .crime-alley { top: 70px; left: 320px; width: 100px; height: 60px; }
        .burnley { top: 80px; left: 450px; width: 120px; height: 80px; }
        .amusement-mile { top: 150px; left: 580px; width: 140px; height: 70px; }

        /* MIDTOWN DISTRICTS */
        .robinson-park { top: 420px; left: 400px; width: 180px; height: 120px; }
        .coventry { top: 450px; left: 220px; width: 100px; height: 80px; }
        .upper-east-side { top: 550px; left: 600px; width: 150px; height: 90px; }

        /* DOWNTOWN DISTRICTS */
        .old-gotham { top: 820px; left: 200px; width: 120px; height: 100px; }
        .diamond-district { top: 830px; left: 350px; width: 110px; height: 80px; }
        .fashion-district { top: 900px; left: 480px; width: 120px; height: 90px; }
        .chinatown { top: 1000px; left: 300px; width: 100px; height: 80px; }
        .financial-district { top: 1050px; left: 500px; width: 200px; height: 100px; }

        /* MAINLAND DISTRICTS */
        .wayne-manor { top: 450px; left: 50px; width: 120px; height: 80px; }
        .east-end { top: 700px; left: 1000px; width: 140px; height: 100px; }
        .bowery { top: 300px; left: 1400px; width: 120px; height: 80px; }

        /* LANDMARKS */
        .landmark { position: absolute; width: 16px; height: 16px; background: #f1c40f; border-radius: 50%; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 0 8px rgba(241,196,15,0.6); display: flex; align-items: center; justify-content: center; font-size: 10px; color: #000; font-weight: bold; z-index: 25; }
        .landmark:hover { transform: scale(1.8); background: #e67e22; box-shadow: 0 0 15px rgba(241,196,15,0.9); z-index: 30; }
        .wayne-tower { top: 1080px; left: 550px; background: #3498db; }
        .gcpd-hq { top: 850px; left: 220px; background: #2ecc71; }
        .arkham-asylum { top: 280px; left: 950px; background: #e74c3c; }
        .ace-chemical { top: 180px; left: 600px; background: #9b59b6; }
        .blackgate-prison { top: 190px; left: 1140px; background: #95a5a6; }
        .iceberg-lounge { top: 870px; left: 380px; background: #1abc9c; }
        .clocktower { top: 840px; left: 250px; background: #f39c12; }
        .city-hall { top: 920px; left: 420px; background: #34495e; }

        /* INFO PANEL */
        .info-panel { position: absolute; top: 20px; right: 20px; width: 380px; max-height: calc(100vh - 40px); background: rgba(44, 62, 80, 0.96); border: 2px solid #34495e; border-radius: 12px; padding: 20px; overflow-y: auto; backdrop-filter: blur(15px); box-shadow: 0 15px 35px rgba(0,0,0,0.6); transform: translateX(100%); transition: transform 0.4s ease; }
        .theme-day .info-panel { background: rgba(236, 244, 255, 0.96); border-color: #c7d2fe; }
        .info-panel.show { transform: translateX(0); }
        .info-panel h2 { color: #f1c40f; margin-bottom: 15px; border-bottom: 2px solid #f1c40f; padding-bottom: 8px; font-size: 1.3em; }
        .info-panel h3 { color: #3498db; margin-top: 15px; margin-bottom: 8px; font-size: 1.1em; }
        .info-panel p { line-height: 1.7; margin-bottom: 12px; font-size: 0.95em; }
        .close-btn { position: absolute; top: 12px; right: 18px; background: none; border: none; color: #e74c3c; font-size: 28px; cursor: pointer; transition: color 0.3s ease; }
        .close-btn:hover { color: #c0392b; }

        .controls { position: absolute; bottom: 20px; left: 20px; display: flex; gap: 12px; flex-wrap: wrap; z-index: 1000; }
        .control-btn { background: rgba(44,62,80,0.92); border: 2px solid #34495e; color: #fff; padding: 12px 18px; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; backdrop-filter: blur(8px); font-size: 0.9em; font-weight: bold; }
        .control-btn:hover { background: rgba(52,73,94,0.95); border-color: #f1c40f; transform: translateY(-2px); }
        .control-btn.active { border-color: #10b981; box-shadow: 0 0 0 2px rgba(16,185,129,0.25); }
        .theme-day .control-btn { background: rgba(233, 238, 246, 0.92); color: #0f172a; border-color: #cbd5e1; }
        .theme-day .control-btn:hover { background: rgba(246, 249, 255, 0.95); border-color: #64748b; }

        .title { position: absolute; top: 20px; left: 20px; z-index: 1000; }
        .title h1 { color: #f1c40f; font-size: 2.8em; text-shadow: 4px 4px 8px rgba(0,0,0,0.8); margin-bottom: 8px; font-weight: bold; }
        .title p { color: #bdc3c7; font-size: 1.2em; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); }
        .title .subtitle { color: #95a5a6; font-size: 0.9em; margin-top: 5px; }

        .street-label { position: absolute; color: #bdc3c7; font-size: 10px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); pointer-events: none; z-index: 5; }
        .theme-day .street-label { color: #334155; text-shadow: 1px 1px 0 rgba(255,255,255,0.6); }

        /* Effects */
        @keyframes pulse { 0% { box-shadow: 0 0 8px rgba(241,196,15,0.6); } 50% { box-shadow: 0 0 20px rgba(241,196,15,0.9); } 100% { box-shadow: 0 0 8px rgba(241,196,15,0.6); } }
        .landmark.pulse { animation: pulse 2.5s infinite; }

        .legend { position: absolute; bottom: 20px; right: 20px; background: rgba(44,62,80,0.9); padding: 15px; border-radius: 8px; font-size: 11px; border: 1px solid #34495e; z-index: 1000; }
        .legend h4 { color: #f1c40f; margin-bottom: 8px; }
        .legend-item { display: flex; align-items: center; margin-bottom: 4px; }
        .legend-color { width: 12px; height: 12px; margin-right: 8px; border-radius: 2px; }
        .theme-day .legend { background: rgba(236, 244, 255, 0.95); border-color: #c7d2fe; }

        /* === NEW: CHARACTERS LAYER === */
        .layer { position: absolute; inset: 0; pointer-events: none; z-index: 40; }
        .layer.hidden { display: none; }
        .character { position: absolute; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-size: 14px; color: #000; box-shadow: 0 0 10px rgba(0,0,0,0.35); pointer-events: auto; cursor: pointer; transition: transform 0.2s ease; }
        .character:hover { transform: scale(1.15); }
        .char-batman { background: #94a3b8; left: 560px; top: 1060px; } /* near Wayne Tower */
        .char-catwoman { background: #f472b6; left: 1010px; top: 720px; } /* East End */
        .char-penguin { background: #22d3ee; left: 390px; top: 865px; } /* Iceberg Lounge */
        .char-joker { background: #a78bfa; left: 610px; top: 160px; } /* Ace Chemicals */
        .char-ivy { background: #86efac; left: 470px; top: 460px; } /* Robinson Park */
        .char-gordon { background: #fde68a; left: 230px; top: 840px; } /* GCPD HQ */

        /* Tooltip for character dots */
        .character::after { content: attr(data-name); position: absolute; top: -26px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.7); color: #fff; font-size: 10px; padding: 3px 6px; border-radius: 4px; white-space: nowrap; opacity: 0; pointer-events: none; transition: opacity 0.2s ease; }
        .character:hover::after { opacity: 1; }

        /* Utility */
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
    </style>
</head>
<body class="theme-night">
    <div class="container">
        <div class="title">
            <h1>GOTHAM CITY</h1>
            <p>Complete Canonical Map with Street Layout</p>
            <p class="subtitle">Based on Eliot R. Brown's Official No Man's Land Map</p>
        </div>

        <div class="map-container" id="mapContainer">
            <div class="gotham-map" id="gothamMap">
                <!-- ISLANDS -->
                <div class="island uptown-island" data-info="uptown"><div style="color:#ecf0f1;font-weight:bold;font-size:14px;">UPTOWN ISLAND</div></div>
                <div class="island midtown-island" data-info="midtown"><div style="color:#ecf0f1;font-weight:bold;font-size:14px;">MIDTOWN ISLAND</div></div>
                <div class="island downtown-island" data-info="downtown"><div style="color:#ecf0f1;font-weight:bold;font-size:14px;">DOWNTOWN ISLAND</div></div>
                <div class="island arkham-island" data-info="arkham-island"><div style="color:#ecf0f1;font-size:10px;">ARKHAM</div></div>
                <div class="island blackgate-island" data-info="blackgate-island"><div style="color:#ecf0f1;font-size:10px;">BLACKGATE</div></div>
                <div class="island paris-island" data-info="paris-island"><div style="color:#ecf0f1;font-size:10px;">PARIS ISLAND</div></div>
                <div class="island tricorner-island" data-info="tricorner"><div style="color:#ecf0f1;font-size:11px;">TRICORNER</div></div>

                <!-- RIVERS -->
                <div class="river gotham-river"></div>
                <div class="river sprang-river"></div>
                <div class="river finger-river"></div>

                <!-- BRIDGES -->
                <div class="bridge robert-kane-bridge" data-info="robert-kane-bridge"></div>
                <div class="bridge brown-bridge" data-info="brown-bridge"></div>
                <div class="bridge trigate-bridge" data-info="trigate-bridge"></div>
                <div class="bridge sprang-bridge" data-info="sprang-bridge"></div>
                <div class="bridge westward-bridge" data-info="westward-bridge"></div>

                <!-- MAJOR AVENUES (North-South) -->
                <div class="street avenue miller-avenue"></div>
                <div class="street avenue oneill-avenue"></div>
                <div class="street avenue finger-avenue"></div>
                <div class="street avenue kane-avenue"></div>
                <div class="street avenue" style="top:0;left:750px;width:8px;height:1400px;"></div> <!-- Brubaker Ave -->
                <div class="street avenue" style="top:0;left:250px;width:8px;height:1400px;"></div> <!-- Moore Ave -->
                <div class="street avenue" style="top:0;left:850px;width:6px;height:1400px;"></div> <!-- Murphy Ave -->
                <div class="street avenue" style="top:0;left:950px;width:6px;height:1400px;"></div> <!-- Davis Ave -->

                <!-- MAJOR STREETS (East-West) -->
                <div class="street aparo-street"></div>
                <div class="street dixon-street"></div>
                <div class="street grant-street"></div>
                <div class="street robinson-street"></div>
                <div class="street adams-street"></div>
                <div class="street" style="top:400px;left:180px;width:620px;height:6px;"></div> <!-- Infantino Street -->
                <div class="street" style="top:700px;left:120px;width:680px;height:6px;"></div> <!-- Novick Street -->
                <div class="street" style="top:800px;left:80px;width:720px;height:6px;"></div> <!-- Sprang Street -->
                <div class="street" style="top:1000px;left:100px;width:700px;height:6px;"></div> <!-- Broome Street -->
                <div class="street" style="top:850px;left:300px;width:400px;height:5px;"></div> <!-- Salem Street -->
                <div class="street" style="top:180px;left:750px;width:200px;height:8px;transform:rotate(25deg);"></div> <!-- Schwartz Bypass -->
                <div class="street" style="top:1100px;left:50px;width:800px;height:7px;"></div> <!-- Hudson County Highway -->
                <div class="street" style="top:550px;left:0;width:2000px;height:12px;background:rgba(149,165,166,0.8);"></div> <!-- Aparo Expressway -->

                <!-- LABELS -->
                <div class="street-label" style="top:185px;left:345px;transform:rotate(90deg);">Miller Ave</div>
                <div class="street-label" style="top:185px;left:445px;transform:rotate(90deg);">O'Neill Ave</div>
                <div class="street-label" style="top:185px;left:545px;transform:rotate(90deg);">Finger Ave</div>
                <div class="street-label" style="top:185px;left:645px;transform:rotate(90deg);">Kane Ave</div>
                <div class="street-label" style="top:185px;left:745px;transform:rotate(90deg);">Brubaker Ave</div>
                <div class="street-label" style="top:185px;left:245px;transform:rotate(90deg);">Moore Ave</div>
                <div class="street-label" style="top:185px;left:845px;transform:rotate(90deg);">Murphy Ave</div>
                <div class="street-label" style="top:185px;left:945px;transform:rotate(90deg);">Davis Ave</div>
                <div class="street-label" style="top:215px;left:500px;">Aparo Street</div>
                <div class="street-label" style="top:315px;left:500px;">Dixon Street</div>
                <div class="street-label" style="top:415px;left:500px;">Infantino Street</div>
                <div class="street-label" style="top:515px;left:500px;">Grant Street</div>
                <div class="street-label" style="top:565px;left:1000px;">Aparo Expressway</div>
                <div class="street-label" style="top:615px;left:400px;">Robinson Street</div>
                <div class="street-label" style="top:715px;left:400px;">Novick Street</div>
                <div class="street-label" style="top:815px;left:400px;">Sprang Street</div>
                <div class="street-label" style="top:915px;left:400px;">Adams Street</div>
                <div class="street-label" style="top:1015px;left:400px;">Broome Street</div>
                <div class="street-label" style="top:1115px;left:400px;">Hudson County Hwy</div>
                <div class="street-label" style="top:115px;left:370px;font-size:8px;">Park Row<br>(Crime Alley)</div>
                <div class="street-label" style="top:865px;left:350px;font-size:8px;">Salem St</div>
                <div class="street-label" style="top:195px;left:850px;font-size:8px;transform:rotate(25deg);">Schwartz Bypass</div>

                <!-- DISTRICTS -->
                <div class="district crime-alley" data-info="crime-alley">Crime Alley</div>
                <div class="district burnley" data-info="burnley">Burnley</div>
                <div class="district amusement-mile" data-info="amusement-mile">Amusement Mile</div>
                <div class="district robinson-park" data-info="robinson-park">Robinson Park</div>
                <div class="district coventry" data-info="coventry">Coventry</div>
                <div class="district upper-east-side" data-info="upper-east-side">Upper East Side</div>
                <div class="district old-gotham" data-info="old-gotham">Old Gotham</div>
                <div class="district diamond-district" data-info="diamond-district">Diamond District</div>
                <div class="district fashion-district" data-info="fashion-district">Fashion District</div>
                <div class="district chinatown" data-info="chinatown">Chinatown</div>
                <div class="district financial-district" data-info="financial-district">Financial District</div>
                <div class="district wayne-manor" data-info="wayne-manor">Wayne Manor</div>
                <div class="district east-end" data-info="east-end">East End</div>
                <div class="district bowery" data-info="bowery">The Bowery</div>

                <!-- LANDMARKS -->
                <div class="landmark wayne-tower" data-info="wayne-tower">🏢</div>
                <div class="landmark gcpd-hq" data-info="gcpd">🚔</div>
                <div class="landmark arkham-asylum" data-info="arkham">🏥</div>
                <div class="landmark ace-chemical" data-info="ace-chemical">⚗️</div>
                <div class="landmark blackgate-prison" data-info="blackgate">⛓️</div>
                <div class="landmark iceberg-lounge" data-info="iceberg">🐧</div>
                <div class="landmark clocktower" data-info="clocktower">🕐</div>
                <div class="landmark city-hall" data-info="city-hall">🏛️</div>

                <!-- === NEW: CHARACTERS LAYER (togglable) === -->
                <div id="charactersLayer" class="layer hidden" aria-hidden="true">
                    <button class="character char-batman" data-name="Batman" title="Batman" data-info="wayne-tower">🦇<span class="sr-only">Batman</span></button>
                    <button class="character char-catwoman" data-name="Catwoman" title="Catwoman" data-info="east-end">🐱<span class="sr-only">Catwoman</span></button>
                    <button class="character char-penguin" data-name="Penguin" title="Penguin" data-info="iceberg">🐧<span class="sr-only">Penguin</span></button>
                    <button class="character char-joker" data-name="Joker" title="Joker" data-info="ace-chemical">🤡<span class="sr-only">Joker</span></button>
                    <button class="character char-ivy" data-name="Poison Ivy" title="Poison Ivy" data-info="robinson-park">🌿<span class="sr-only">Poison Ivy</span></button>
                    <button class="character char-gordon" data-name="Commissioner Gordon" title="Commissioner Gordon" data-info="gcpd">👮<span class="sr-only">Commissioner Gordon</span></button>
                </div>
            </div>
        </div>

        <div class="controls">
            <button class="control-btn" onclick="zoomIn()" title="Zoom In" aria-pressed="false">Zoom In</button>
            <button class="control-btn" onclick="zoomOut()" title="Zoom Out" aria-pressed="false">Zoom Out</button>
            <button class="control-btn" onclick="resetView()" title="Reset View" aria-pressed="false">Reset View</button>
            <button class="control-btn" id="streetsBtn" onclick="toggleStreets()" title="Toggle Streets" aria-pressed="true">Toggle Streets</button>
            <button class="control-btn" id="themeBtn" onclick="toggleTheme()" title="Toggle Day/Night" aria-pressed="false">🌙 / ☀️</button>
            <button class="control-btn" id="charactersBtn" onclick="toggleCharacters()" title="Toggle Characters" aria-pressed="false">Characters</button>
        </div>

        <div class="legend">
            <h4>Map Legend</h4>
            <div class="legend-item"><div class="legend-color" style="background:#3498db;"></div><span>Major Landmarks</span></div>
            <div class="legend-item"><div class="legend-color" style="background:rgba(52,152,219,0.6);"></div><span>Rivers</span></div>
            <div class="legend-item"><div class="legend-color" style="background:#95a5a6;"></div><span>Bridges</span></div>
            <div class="legend-item"><div class="legend-color" style="background:rgba(189,195,199,0.7);"></div><span>Streets/Avenues</span></div>
            <div class="legend-item"><div class="legend-color" style="background:#22d3ee;"></div><span>Characters (toggle)</span></div>
        </div>

        <div class="info-panel" id="infoPanel">
            <button class="close-btn" onclick="closePanel()" aria-label="Close info">&times;</button>
            <div id="infoContent">
                <h2>Canonical Gotham City</h2>
                <p>This is the official map layout created by Eliot R. Brown for DC Comics' "No Man's Land" (1998) lineage, establishing a canonical geography used across comics for decades.</p>
                <h3>Navigation</h3>
                <p>• <strong>Drag</strong> to pan • <strong>Zoom</strong> for details • Click <strong>districts/landmarks</strong> for lore • Toggle <strong>Streets</strong> & <strong>Characters</strong> • Switch <strong>Day/Night</strong></p>
            </div>
        </div>
    </div>

    <script>
        let currentZoom = 1;
        let isMouseDown = false;
        let lastMousePos = { x: 0, y: 0 };
        let currentOffset = { x: 0, y: 0 };
        let streetsVisible = true;

        const mapContainer = document.getElementById('mapContainer');
        const gothamMap = document.getElementById('gothamMap');
        const infoPanel = document.getElementById('infoPanel');
        const infoContent = document.getElementById('infoContent');
        const streetsBtn = document.getElementById('streetsBtn');
        const themeBtn = document.getElementById('themeBtn');
        const charactersBtn = document.getElementById('charactersBtn');
        const charactersLayer = document.getElementById('charactersLayer');

        /* ===== Pan (mouse) ===== */
        mapContainer.addEventListener('mousedown', (e) => {
            if (e.target.closest('.landmark, .district, .island, .bridge, .character')) return;
            isMouseDown = true;
            lastMousePos = { x: e.clientX, y: e.clientY };
            mapContainer.style.cursor = 'grabbing';
        });
        mapContainer.addEventListener('mousemove', (e) => {
            if (!isMouseDown) return;
            const deltaX = e.clientX - lastMousePos.x;
            const deltaY = e.clientY - lastMousePos.y;
            currentOffset.x += deltaX; currentOffset.y += deltaY;
            updateMapTransform();
            lastMousePos = { x: e.clientX, y: e.clientY };
        });
        ['mouseup','mouseleave'].forEach(type => mapContainer.addEventListener(type, () => { isMouseDown = false; mapContainer.style.cursor = 'grab'; }));

        /* ===== Pan (touch) ===== */
        mapContainer.addEventListener('touchstart', (e) => {
            if (e.target.closest('.landmark, .district, .island, .bridge, .character')) return;
            const t = e.touches[0];
            isMouseDown = true;
            lastMousePos = { x: t.clientX, y: t.clientY };
        }, { passive: false });
        mapContainer.addEventListener('touchmove', (e) => {
            if (!isMouseDown) return;
            const t = e.touches[0];
            const deltaX = t.clientX - lastMousePos.x;
            const deltaY = t.clientY - lastMousePos.y;
            currentOffset.x += deltaX; currentOffset.y += deltaY;
            updateMapTransform();
            lastMousePos = { x: t.clientX, y: t.clientY };
            e.preventDefault();
        }, { passive: false });
        mapContainer.addEventListener('touchend', () => { isMouseDown = false; }, { passive: true });

        function updateMapTransform() {
            gothamMap.style.transform = \`scale(\${currentZoom}) translate(\${currentOffset.x / currentZoom}px, \${currentOffset.y / currentZoom}px)\`;
        }
        function zoomIn() { currentZoom = Math.min(currentZoom * 1.4, 4); updateMapTransform(); }
        function zoomOut() { currentZoom = Math.max(currentZoom / 1.4, 0.4); updateMapTransform(); }
        function resetView() { currentZoom = 1; currentOffset = { x: 0, y: 0 }; updateMapTransform(); }

        function toggleStreets() {
            streetsVisible = !streetsVisible;
            const streets = document.querySelectorAll('.street, .street-label');
            streets.forEach(street => { street.style.display = streetsVisible ? 'block' : 'none'; });
            streetsBtn.classList.toggle('active', streetsVisible);
            streetsBtn.setAttribute('aria-pressed', String(streetsVisible));
        }

        /* ===== NEW: Day/Night Theme Toggle ===== */
        function toggleTheme() {
            const isDay = document.body.classList.toggle('theme-day');
            document.body.classList.toggle('theme-night', !isDay);
            themeBtn.classList.toggle('active', isDay);
            themeBtn.setAttribute('aria-pressed', String(isDay));
        }

        /* ===== NEW: Characters Layer Toggle ===== */
        function toggleCharacters() {
            const hidden = charactersLayer.classList.toggle('hidden');
            charactersLayer.setAttribute('aria-hidden', String(hidden));
            charactersBtn.classList.toggle('active', !hidden);
            charactersBtn.setAttribute('aria-pressed', String(!hidden));
        }

        // Clicking characters opens the same info as their landmark/district when available
        charactersLayer.addEventListener('click', (e) => {
            const btn = e.target.closest('.character');
            if (!btn) return;
            const infoKey = btn.getAttribute('data-info');
            showInfo(infoKey);
        });

        // Click handlers for all data-info elements
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
        function closePanel() { infoPanel.classList.remove('show'); document.querySelectorAll('.clicked').forEach(el => el.classList.remove('clicked')); }

        // Random landmark pulsing
        setInterval(() => {
            const landmarks = document.querySelectorAll('.landmark');
            landmarks.forEach(landmark => landmark.classList.remove('pulse'));
            const randomLandmark = landmarks[Math.floor(Math.random() * landmarks.length)];
            if (randomLandmark) randomLandmark.classList.add('pulse');
        }, 4000);

        // Prevent text selection while dragging
        mapContainer.addEventListener('selectstart', (e) => e.preventDefault());

        // Keyboard: ESC closes panel
        window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });

        // Initial view positioning
        setTimeout(() => { currentZoom = 0.7; updateMapTransform(); }, 100);

        // ===== Extended location info (unchanged + a few added) =====
        const locationInfo = {
            'uptown': { title: 'Uptown Island', content: \`<h3>Geographic Overview</h3><p>The northernmost of Gotham's three main islands, separated from Midtown by the Sprang River. This is one of Gotham's roughest areas, containing some of the city's most dangerous neighborhoods.</p><h3>Key Districts</h3><p><strong>Crime Alley:</strong> Formerly Park Row, where the Wayne family was murdered. Now one of Gotham's most dangerous streets.<br><strong>Burnley:</strong> Home to the Burnley Town Massive gang, a working-class district north of Sprang River.<br><strong>Amusement Mile:</strong> Entertainment district with abandoned carnival rides, often used by villains as hideouts.</p>\` },
            'midtown': { title: 'Midtown Island', content: \`<h3>Central Hub</h3><p>The middle island of Gotham's three-island system, dominated by Robinson Park and containing Gotham University. A mix of residential, academic, and recreational areas.</p><h3>Key Districts</h3><p><strong>Robinson Park:</strong> Gotham's equivalent to Central Park, named after Joker co-creator Jerry Robinson. Often controlled by Poison Ivy.<br><strong>Coventry:</strong> Residential neighborhood with mix of housing types.<br><strong>Upper East Side:</strong> More affluent residential area with upscale apartments.</p>\` },
            'downtown': { title: 'Downtown Island', content: \`<h3>Commercial Heart</h3><p>The largest and southernmost island, containing Gotham's main business districts, government buildings, and financial centers. The true heart of Gotham's economy and politics.</p><h3>Major Districts</h3><p><strong>Financial District:</strong> Wall Street equivalent with Wayne Tower as centerpiece.<br><strong>Diamond District:</strong> Luxury shopping and jewelry stores.<br><strong>Fashion District:</strong> Garment and clothing industry center.<br><strong>Old Gotham:</strong> Historic district with gothic architecture.<br><strong>Chinatown:</strong> Asian cultural district with traditional architecture.</p>\` },
            'arkham-island': { title: 'Arkham Island', content: \`<h3>Arkham Asylum</h3><p>Small island in the Sprang River housing Gotham's infamous psychiatric hospital for the criminally insane. Connected to the mainland by the Trigate Bridge.</p><h3>Security</h3><p>Isolated, drawbridge lockdown, tunnels, multiple security tiers.</p>\` },
            'blackgate-island': { title: 'Blackgate Island', content: \`<h3>Blackgate Penitentiary</h3><p>Maximum security prison for non-insane criminals. Located on its own island to prevent escapes, housing regular criminals who don't qualify for Arkham Asylum.</p>\` },
            'paris-island': { title: 'Paris Island', content: \`<h3>Entertainment District</h3><p>Named in homage to creators; home to an abandoned funfair frequently used by the Joker.</p>\` },
            'tricorner': { title: 'Tricorner Island', content: \`<h3>Industrial & Residential</h3><p>Shipyards and working-class residences. Commissioner Gordon's home area.</p>\` },
            'crime-alley': { title: 'Crime Alley (Park Row)', content: \`<h3>Batman's Origin Point</h3><p>Where young Bruce Wayne witnessed his parents' murder. Leslie Thompkins' clinic operates here.</p>\` },
            'burnley': { title: 'Burnley District', content: \`<h3>Working Class Stronghold</h3><p>Home to Burnley Town Massive. Industrial + residential mix.</p>\` },
            'robinson-park': { title: 'Robinson Park', content: \`<h3>Gotham's Central Park</h3><p>Often under Poison Ivy's protection. Major green space.</p>\` },
            'financial-district': { title: 'Financial District', content: \`<h3>Economic Center</h3><p>Wayne Tower, exchanges, banks, law firms. Deco + modern skyline.</p>\` },
            'wayne-tower': { title: 'Wayne Tower', content: \`<h3>Wayne Enterprises HQ</h3><p>Corner of Finger & Broome Streets. Public face of Bruce Wayne's empire.</p>\` },
            'gcpd': { title: 'GCPD Headquarters', content: \`<h3>Gotham City Police Department</h3><p>Led by Commissioner Gordon. Major Crimes Unit, chronic resource strain.</p>\` },
            'robert-kane-bridge': { title: 'Robert Kane Memorial Bridge', content: \`<h3>Mainland Connection</h3><p>Primary bridge to the mainland (Wayne Manor side). Critical infrastructure.</p>\` },
            'trigate-bridge': { title: 'Trigate Bridge', content: \`<h3>Arkham Access</h3><p>Can be raised for lockdown. GCPD checkpoint + monitoring.</p>\` },
            'ace-chemical': { title: 'Ace Chemical', content: \`<h3>Ace Chemical Processing Plant</h3><p>Site of multiple Joker origin tellings. Industrial hazard zone.</p>\` },
            'blackgate': { title: 'Blackgate Penitentiary', content: \`<h3>Maximum Security Prison</h3><p>Houses mob bosses and high-risk offenders not committed to Arkham.</p>\` },
            'iceberg': { title: 'The Iceberg Lounge', content: \`<h3>Penguin's Club</h3><p>Front for arms deals and information brokerage. Neutral ground (sometimes).</p>\` },
            'clocktower': { title: 'The Clock Tower', content: \`<h3>Oracle's Former Base</h3><p>Barbara Gordon's iconic intel hub.</p>\` },
            'city-hall': { title: 'Gotham City Hall', content: \`<h3>Seat of Government</h3><p>Political power center, frequent target during crises.</p>\` }
        };
    </script>
</body>
</html>
`;
