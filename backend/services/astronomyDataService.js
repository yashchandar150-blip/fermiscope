/**
 * FermiScope - Astronomy Data Service (OPTIONAL)
 * ----------------------------------------------
 * The whole app works WITHOUT this file doing anything. By default it returns
 * SIMULATED target stars only.
 *
 * Optional real data: if you set ENABLE_REAL_DATA=true in .env, the service tries to
 * read nearby exoplanet host stars from the public NASA Exoplanet Archive
 * TAP service (free, no API key):
 *     https://exoplanetarchive.ipac.caltech.edu/TAP/sync
 * These are star names and distances only. They are NOT radio signals.
 *
 * Real signal data (for example radio telescope recordings) is NOT integrated in this
 * version. To add it later, create another function here that returns data in the
 * same shape as the sample signals (see seed/sampleSignals.js).
 *
 * If the network call fails for any reason, we fall back to simulated data,
 * so the application never breaks because of an external service.
 */

const NASA_TAP_URL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync";

const SIMULATED_TARGETS = [
  { name: "Simulated Target Alpha", distanceParsecs: 4.2 },
  { name: "Simulated Target Beta", distanceParsecs: 11.9 },
  { name: "Simulated Target Gamma", distanceParsecs: 25.4 },
  { name: "Simulated Target Delta", distanceParsecs: 48.0 },
];

const isRealDataEnabled = () => String(process.env.ENABLE_REAL_DATA).toLowerCase() === "true";

const getSimulatedTargets = () => ({
  source: "Simulated educational targets",
  isSimulated: true,
  note: "The current version of FermiScope uses simulated data. Set ENABLE_REAL_DATA=true to try the optional NASA Exoplanet Archive lookup.",
  targets: SIMULATED_TARGETS,
});

const fetchExoplanetHostStars = async (limit = 10) => {
  const query =
    `select top ${Number(limit)} hostname, sy_dist ` +
    `from ps where default_flag = 1 and sy_dist is not null order by sy_dist asc`;
  const url = `${NASA_TAP_URL}?query=${encodeURIComponent(query)}&format=json`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000); // give up after 8 seconds

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`NASA service responded with status ${response.status}`);
    const rows = await response.json();

    // Remove duplicate star names (a star can have several planets)
    const seen = new Set();
    const targets = [];
    for (const row of rows) {
      if (!seen.has(row.hostname)) {
        seen.add(row.hostname);
        targets.push({ name: row.hostname, distanceParsecs: row.sy_dist });
      }
    }

    return {
      source: "NASA Exoplanet Archive (TAP service)",
      isSimulated: false,
      note: "Real star names and distances. These are targets only, not detected signals.",
      targets,
    };
  } finally {
    clearTimeout(timer);
  }
};

// Main function used by the controller: real data if enabled, simulated otherwise
const getTargets = async () => {
  if (!isRealDataEnabled()) return getSimulatedTargets();

  try {
    return await fetchExoplanetHostStars();
  } catch (error) {
    console.warn(`Real astronomy data unavailable (${error.message}). Using simulated data.`);
    return {
      ...getSimulatedTargets(),
      note: `Real data lookup failed (${error.message}). Showing simulated targets instead.`,
    };
  }
};

module.exports = { getTargets, getSimulatedTargets, isRealDataEnabled };
