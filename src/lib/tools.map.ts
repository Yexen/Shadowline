
'use server';

// This is the source of truth for map location information.
const LOCATION_INFO: Record<string, { title: string; content: string }> = {
    'uptown': { title: 'Uptown Island', content: `<h3>Geographic Overview</h3><p>The northernmost of Gotham's three main islands, separated from Midtown by the Sprang River. This is one of Gotham's roughest areas, containing some of the city's most dangerous neighborhoods.</p><h3>Key Districts</h3><p><strong>Crime Alley:</strong> Formerly Park Row, where the Wayne family was murdered. Now one of Gotham's most dangerous streets.<br><strong>Burnley:</strong> Home to the Burnley Town Massive gang, a working-class district north of Sprang River.<br><strong>Amusement Mile:</strong> Entertainment district with abandoned carnival rides, often used by villains as hideouts.</p>` },
    'midtown': { title: 'Midtown Island', content: `<h3>Central Hub</h3><p>The middle island of Gotham's three-island system, dominated by Robinson Park and containing Gotham University. A mix of residential, academic, and recreational areas.</p><h3>Key Districts</h3><p><strong>Robinson Park:</strong> Gotham's equivalent to Central Park, named after Joker co-creator Jerry Robinson. Often controlled by Poison Ivy.<br><strong>Coventry:</strong> Residential neighborhood with mix of housing types.<br><strong>Upper East Side:</strong> More affluent residential area with upscale apartments.</p>` },
    'downtown': { title: 'Downtown Island', content: `<h3>Commercial Heart</h3><p>The largest and southernmost island, containing Gotham's main business districts, government buildings, and financial centers. The true heart of Gotham's economy and politics.</p><h3>Major Districts</h3><p><strong>Financial District:</strong> Wall Street equivalent with Wayne Tower as centerpiece.<br><strong>Diamond District:</strong> Luxury shopping and jewelry stores.<br><strong>Fashion District:</strong> Garment and clothing industry center.<br><strong>Old Gotham:</strong> Historic district with gothic architecture.<br><strong>Chinatown:</strong> Asian cultural district with traditional architecture.</p>` },
    'arkham-island': { title: 'Arkham Island', content: `<h3>Arkham Asylum</h3><p>Small island in the Sprang River housing Gotham's infamous psychiatric hospital for the criminally insane. Connected to the mainland by the Trigate Bridge.</p><h3>Security</h3><p>Isolated, drawbridge lockdown, tunnels, multiple security tiers.</p>` },
    'blackgate-island': { title: 'Blackgate Island', content: `<h3>Blackgate Penitentiary</h3><p>Maximum security prison for non-insane criminals. Located on its own island to prevent escapes, housing regular criminals who don't qualify for Arkham Asylum.</p>` },
    'paris-island': { title: 'Paris Island', content: `<h3>Entertainment District</h3><p>Named in homage to creators; home to an abandoned funfair frequently used by the Joker.</p>` },
    'tricorner': { title: 'Tricorner Island', content: `<h3>Industrial & Residential</h3><p>Shipyards and working-class residences. Commissioner Gordon's home area.</p>` },
    'crime-alley': { title: 'Crime Alley (Park Row)', content: `<h3>Batman's Origin Point</h3><p>Where young Bruce Wayne witnessed his parents' murder. Leslie Thompkins' clinic operates here.</p>` },
    'burnley': { title: 'Burnley District', content: `<h3>Working Class Stronghold</h3><p>Home to Burnley Town Massive. Industrial + residential mix.</p>` },
    'robinson-park': { title: 'Robinson Park', content: `<h3>Gotham's Central Park</h3><p>Often under Poison Ivy's protection. Major green space.</p>` },
    'financial-district': { title: 'Financial District', content: `<h3>Economic Center</h3><p>Wayne Tower, exchanges, banks, law firms. Deco + modern skyline.</p>` },
    'wayne-tower': { title: 'Wayne Tower', content: `<h3>Wayne Enterprises HQ</h3><p>Corner of Finger & Broome Streets. Public face of Bruce Wayne's empire.</p>` },
    'gcpd': { title: 'GCPD Headquarters', content: `<h3>Gotham City Police Department</h3><p>Led by Commissioner Gordon. Major Crimes Unit, chronic resource strain.</p>` },
    'robert-kane-bridge': { title: 'Robert Kane Memorial Bridge', content: `<h3>Mainland Connection</h3><p>Primary bridge to the mainland (Wayne Manor side). Critical infrastructure.</p>` },
    'trigate-bridge': { title: 'Trigate Bridge', content: `<h3>Arkham Access</h3><p>Can be raised for lockdown. GCPD checkpoint + monitoring.</p>` },
    'ace-chemical': { title: 'Ace Chemical', content: `<h3>Ace Chemical Processing Plant</h3><p>Site of multiple Joker origin tellings. Industrial hazard zone.</p>` },
    'blackgate': { title: 'Blackgate Penitentiary', content: `<h3>Maximum Security Prison</h3><p>Houses mob bosses and high-risk offenders not committed to Arkham.</p>` },
    'iceberg': { title: 'The Iceberg Lounge', content: `<h3>Penguin's Club</h3><p>Front for arms deals and information brokerage. Neutral ground (sometimes).</p>` },
    'clocktower': { title: 'The Clock Tower', content: `<h3>Oracle's Former Base</h3><p>Barbara Gordon's iconic intel hub.</p>` },
    'city-hall': { title: 'Gotham City Hall', content: `<h3>Seat of Government</h3><p>Political power center, frequent target during crises.</p>` }
};

/**
 * Tool definition for the AI to get information about a map location.
 */
export const mapTools = [
  {
    type: "function" as const,
    function: {
      name: "get_location_info",
      description: "Return HTML/lore for a Gotham/DC location key.",
      parameters: { type: "object", properties: { key: {type:"string"} }, required:["key"] }
    }
  }
];

/**
 * The implementation of the get_location_info tool.
 * It retrieves information from the local LOCATION_INFO dictionary.
 * @param {object} args - The arguments for the function.
 * @param {string} args.key - The key for the location to look up.
 * @returns A promise that resolves to the location information or a default "not found" object.
 */
export async function get_location_info({key}:{key:string}) {
  const info = LOCATION_INFO[key];
  return info ? info : { title: "Unknown Location", content: "<p>No data found for this location.</p>" };
}
