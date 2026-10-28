// ALL DATA IN THIS FILE IS SIMULATED EDUCATIONAL DATA.
// Nothing here is a real astronomical discovery.

const demoUsers = [
  { name: "Dr. Admin (Demo)", email: "admin@fermiscope.com", password: "Admin@123", role: "admin" },
  { name: "Aarav Researcher (Demo)", email: "researcher@fermiscope.com", password: "Researcher@123", role: "researcher" },
  { name: "Meera Researcher (Demo)", email: "researcher2@fermiscope.com", password: "Researcher@123", role: "researcher" },
];

// ---------------------------------------------------------------------------
// Fermi Paradox hypotheses
// ---------------------------------------------------------------------------
const hypotheses = [
  {
    order: 1,
    name: "The Great Filter",
    explanation:
      "Proposed by economist Robin Hanson in 1996. The idea is that somewhere on the path from non-living matter to a civilization that spreads across space, there is at least one step that is extremely unlikely. Very few, or no, civilizations get past it.",
    supportingArguments: [
      "It can explain the silence without requiring any specific cause.",
      "Candidate hard steps include the origin of life, complex cells, intelligence and long-term survival.",
      "If the filter is behind us, humanity may be one of the lucky ones.",
    ],
    limitations: [
      "We do not know which step is the filter, or whether it exists at all.",
      "If the filter is ahead of us, it would be a serious warning, but we have no evidence for that.",
      "It is a framework for thinking, not a testable theory yet.",
    ],
    researchNotes:
      "Finding simple life on another world would suggest the filter is not at the origin of life. Many researchers use this as a motivation for biosignature searches.",
  },
  {
    order: 2,
    name: "Rare Earth Hypothesis",
    explanation:
      "Proposed by Peter Ward and Donald Brownlee in 2000. Simple life may be common, but complex animal life needs a rare combination of conditions: a stable star, a planet in the habitable zone and a safe place in the galaxy, plate tectonics, a large moon, and giant planets that shape the system.",
    supportingArguments: [
      "Earth has stayed habitable for billions of years, which required many stable conditions.",
      "Our location in the galaxy avoids the harshest radiation near the galactic centre.",
      "It predicts that microbes may be common while complex life is rare.",
    ],
    limitations: [
      "Some listed requirements, such as a large moon, may not be strictly necessary.",
      "We only know one example of life, so we cannot tell which conditions are truly essential.",
      "Exoplanet discoveries keep showing many different kinds of planetary systems.",
    ],
    researchNotes:
      "Compare with the Intelligent Life Is Rare hypothesis: Rare Earth is about complex life in general, while that one is about the step to intelligence.",
  },
  {
    order: 3,
    name: "The Zoo Hypothesis",
    explanation:
      "Suggested by John Ball in 1973. Advanced civilizations may exist but deliberately avoid contact with us, treating Earth like a nature reserve or a zoo, so that we can develop without interference.",
    supportingArguments: [
      "It explains why we see no visitors even if civilizations are common.",
      "Humans already create protected nature reserves, which shows the idea is plausible for a technological species.",
    ],
    limitations: [
      "It requires every civilization to agree on non-interference, which is hard to believe.",
      "It cannot be tested or disproved, because any lack of contact fits the idea.",
      "It may assume that alien motives are similar to human motives.",
    ],
    researchNotes:
      "This is difficult to use in a signal search. It is mainly a discussion topic about the limits of scientific testing.",
  },
  {
    order: 4,
    name: "The Dark Forest Hypothesis",
    explanation:
      "Popularized by Liu Cixin's 2008 novel The Dark Forest. If civilizations cannot be sure that others are friendly and may be much more powerful, the safest strategy is to stay quiet and hidden, because announcing your position could invite destruction.",
    supportingArguments: [
      "It is a possible explanation for why civilizations would choose silence.",
      "It matches the logic of caution under uncertainty used in game theory.",
      "It raises questions about the risks of sending messages into space.",
    ],
    limitations: [
      "It comes from science fiction, not from observation.",
      "It assumes that hostile civilizations are common and able to attack across interstellar distances.",
      "Unintentional radio and heat leakage would be difficult to hide completely.",
    ],
    researchNotes:
      "Useful for discussing the debate about active messaging (METI) versus passive listening (SETI).",
  },
  {
    order: 5,
    name: "The Great Silence",
    explanation:
      "The Great Silence is the observation that needs explaining: the galaxy is old and large, yet we have detected no confirmed signals or artifacts from other civilizations. This is the core of the Fermi Paradox, and the other hypotheses are attempts to explain it.",
    supportingArguments: [
      "The galaxy is billions of years older than human civilization, so some civilizations would have had a long head start.",
      "Estimates using the Drake equation can give a large number of civilizations if the inputs are optimistic.",
      "No confirmed technosignature has been found so far.",
    ],
    limitations: [
      "Our search has covered only a small fraction of the possible targets, frequencies and times. One study compared it with taking a hot tub of water from Earth's oceans.",
      "Absence of evidence is not evidence of absence when the search is this incomplete.",
      "Some researchers argue that the uncertainty in the Drake equation inputs makes an empty galaxy not very surprising.",
    ],
    researchNotes:
      "This is the right place to discuss how much of the 'search space' has actually been covered, and what a confirmed detection would have to prove.",
  },
  {
    order: 6,
    name: "Civilizations May Destroy Themselves",
    explanation:
      "Technological civilizations might regularly cause their own extinction or collapse, for example through nuclear war, runaway climate change, engineered pandemics or uncontrolled technology, before they can spread into space or send signals for long.",
    supportingArguments: [
      "Humanity already has technologies that could cause global catastrophe.",
      "A short civilization lifetime greatly reduces the chance that two civilizations are active at the same time.",
    ],
    limitations: [
      "It must apply to almost every civilization, with very few exceptions, to explain the silence.",
      "We have no data about other civilizations to compare with.",
      "Some civilizations might survive and spread even if many do not.",
    ],
    researchNotes:
      "This is the 'late Great Filter' version. It links the Fermi Paradox to discussions about existential risk.",
  },
  {
    order: 7,
    name: "Interstellar Travel May Be Difficult",
    explanation:
      "The distances between stars are enormous and the energy needed to cross them is huge. Civilizations may never build ships that can reach other stars, or may choose not to, so no one spreads across the galaxy.",
    supportingArguments: [
      "The nearest star is over four light years away, which is tens of thousands of years of travel with current spacecraft.",
      "Fast travel needs enormous amounts of energy, and dust and radiation are dangerous at high speed.",
    ],
    limitations: [
      "Even slow expansion could cover a galaxy in a few tens of millions of years, which is short compared with its age.",
      "It does not explain the lack of radio signals, which travel at light speed.",
      "Self-replicating robotic probes might make travel by living beings unnecessary.",
    ],
    researchNotes:
      "Helps explain why we see no visitors, but not why we see no signals. A good example of one idea covering only part of the paradox.",
  },
  {
    order: 8,
    name: "Civilizations May Exist but Be Too Far Away",
    explanation:
      "The Milky Way is about 100,000 light years across. Civilizations may exist, but they could be so far away, or so separated in time, that their signals are too weak to detect or have not reached us yet.",
    supportingArguments: [
      "Signals weaken with distance, so only very powerful transmitters could be detected over large distances.",
      "Light and radio waves take a very long time to cross the galaxy, so we might see only old signals or none at all.",
      "Civilizations may appear and vanish at different times and never overlap with us.",
    ],
    limitations: [
      "It does not explain the absence of nearby civilizations if they are common.",
      "Very long-lived civilizations would have time to spread or to be seen.",
      "It makes predictions that are hard to test.",
    ],
    researchNotes:
      "Connects to the choice of targets in SETI: nearby stars and galactic regions with many stars are common choices.",
  },
  {
    order: 9,
    name: "We May Be Searching Using the Wrong Technology",
    explanation:
      "Most searches so far look for narrowband radio signals. Other civilizations may communicate with lasers, neutrinos, gravitational waves or methods that we have not thought of, or their technology may be so advanced that it looks like nature to us.",
    supportingArguments: [
      "Human communication is moving away from powerful broadcast radio towards cables, fibre and tightly focused beams.",
      "Optical and infrared searches are newer and cover less of the sky.",
      "We have a short history of technology and may not guess what is possible.",
    ],
    limitations: [
      "It is hard to disprove, because any failed search can be explained by 'wrong method'.",
      "Some by-products of technology, such as heat or industrial pollution, might still be detectable.",
      "Researchers already search in optical, infrared and other ways, not only in radio.",
    ],
    researchNotes:
      "This is why FermiScope supports radio, optical and infrared observation types, even though the signal engine is designed for radio-style features.",
  },
  {
    order: 10,
    name: "Intelligent Life May Be Rare",
    explanation:
      "Even if microbial life is common, the evolution of intelligence and technology may need an unlikely chain of events. Life on Earth existed for billions of years before a species built radio telescopes, and this happened only once.",
    supportingArguments: [
      "Out of the huge number of species that have existed on Earth, only one developed advanced technology.",
      "Intelligence is expensive for a living body, so evolution does not always favour it.",
      "Uncertainty about the Drake equation parameters allows for a very low chance of intelligence.",
    ],
    limitations: [
      "We have only one example, so we cannot calculate how rare intelligence is.",
      "Other kinds of intelligence could exist that are not similar to ours.",
      "It is hard to separate from the Rare Earth Hypothesis without more data.",
    ],
    researchNotes:
      "If many biosignatures were found without any technosignatures, this hypothesis would gain support.",
  },
];

// ---------------------------------------------------------------------------
// Simulated observations. 'daysAgo' keeps the dashboard trends looking current.
// ---------------------------------------------------------------------------
const SIM = "SIMULATED EDUCATIONAL DATA. ";

const researcherOneObservations = [
  {
    title: "Hydrogen Line Survey - Galactic Plane Field (Simulated)",
    description: "Routine survey of the 21 cm hydrogen line along a simulated galactic plane field.",
    daysAgo: 150,
    source: "Simulated Radio Telescope A",
    celestialLocation: "Galactic Plane, l=45, b=0",
    frequency: 1420.405,
    signalStrength: 18,
    observationType: "Radio Signal",
    status: "Analyzed",
    researchNotes: SIM + "Expected natural emission, used as a calibration reference.",
  },
  {
    title: "Pulsar Timing Check (Simulated)",
    description: "Test of regular periodic pulses from a simulated pulsar field.",
    daysAgo: 128,
    source: "Simulated Radio Telescope B",
    celestialLocation: "Simulated pulsar field",
    frequency: 408,
    signalStrength: 12,
    observationType: "Radio Signal",
    status: "Analyzed",
    researchNotes: SIM + "Regular broadband pulses.",
  },
  {
    title: "Urban Interference Test (Simulated)",
    description: "Receiver test near a simulated city to record local interference.",
    daysAgo: 97,
    source: "Simulated Radio Telescope A",
    celestialLocation: "Ground test, no celestial target",
    frequency: 98.5,
    signalStrength: 35,
    observationType: "Radio Signal",
    status: "Analyzed",
    researchNotes: SIM + "Strong FM broadcast leakage, useful as a known-interference example.",
  },
  {
    title: "Short Burst Event (Simulated)",
    description: "A single short burst with incomplete measurements.",
    daysAgo: 71,
    source: "Simulated Radio Telescope C",
    celestialLocation: "Simulated target field",
    frequency: 3250,
    signalStrength: 6,
    observationType: "Radio Signal",
    status: "Analyzed",
    researchNotes: SIM + "Bandwidth was not recorded.",
  },
  {
    title: "Narrowband Follow-up on Simulated Target (Simulated)",
    description: "Follow-up observation of a narrowband signal seen only once.",
    daysAgo: 44,
    source: "Simulated Radio Telescope B",
    celestialLocation: "Simulated target field",
    frequency: 1650,
    signalStrength: 15,
    observationType: "Radio Signal",
    status: "Under Review",
    researchNotes: SIM + "Needs repeated observation.",
  },
  {
    title: "Repeating Narrowband Carrier (Simulated)",
    description: "A narrow drifting carrier that appeared on several nights in the simulated data.",
    daysAgo: 20,
    source: "Simulated Radio Telescope A",
    celestialLocation: "Simulated target star",
    frequency: 1452.31,
    signalStrength: 8.5,
    observationType: "Radio Signal",
    status: "Analyzed",
    researchNotes: SIM + "Used to demonstrate how an UNCONFIRMED CANDIDATE is labeled.",
  },
  {
    title: "Optical Pulse Search - Nearby Star (Simulated)",
    description: "Search for short optical flashes from a simulated nearby star.",
    daysAgo: 12,
    source: "Simulated Optical Telescope",
    celestialLocation: "Simulated nearby star",
    frequency: null,
    signalStrength: null,
    observationType: "Optical Signal",
    status: "Pending",
    researchNotes: SIM + "No pulses found yet.",
  },
  {
    title: "Infrared Excess Check (Simulated)",
    description: "Look for unusual infrared excess around a simulated star.",
    daysAgo: 6,
    source: "Simulated Infrared Survey",
    celestialLocation: "Simulated star field",
    frequency: null,
    signalStrength: null,
    observationType: "Infrared Signal",
    status: "Pending",
    researchNotes: SIM + "Infrared excess can have natural causes such as dust.",
  },
];

const researcherTwoObservations = [
  {
    title: "Water Hole Sweep (Simulated)",
    description: "Slow sweep of the 1420-1666 MHz region.",
    daysAgo: 85,
    source: "Simulated Radio Telescope B",
    celestialLocation: "Simulated sky region",
    frequency: 1500,
    signalStrength: 5,
    observationType: "Radio Signal",
    status: "Under Review",
    researchNotes: SIM + "Mostly noise.",
  },
  {
    title: "Satellite Pass Interference (Simulated)",
    description: "Interference recorded during a simulated satellite pass.",
    daysAgo: 33,
    source: "Simulated Radio Telescope A",
    celestialLocation: "Ground test, no celestial target",
    frequency: 1575.42,
    signalStrength: 22,
    observationType: "Radio Signal",
    status: "Archived",
    researchNotes: SIM + "Typical navigation satellite band.",
  },
  {
    title: "Other Instrument Test (Simulated)",
    description: "Test of a new receiver.",
    daysAgo: 9,
    source: "Simulated Test Bench",
    celestialLocation: "Lab",
    frequency: null,
    signalStrength: null,
    observationType: "Other",
    status: "Pending",
    researchNotes: SIM + "Receiver calibration test.",
  },
];

// Which sample signal (by code) becomes a saved analysis for which user,
// which observation (by title keyword) it is linked to, and its human-set verification status.
const analysisPlan = [
  { owner: 1, code: "SIM-NAT-001", obs: "Hydrogen Line Survey", status: "Verified as Natural", note: "Matches the expected hydrogen line profile." },
  { owner: 1, code: "SIM-NAT-002", obs: "Pulsar Timing", status: "Detected", note: "" },
  { owner: 1, code: "SIM-INT-001", obs: "Urban Interference", status: "Interference Suspected", note: "Matches local FM broadcast." },
  { owner: 1, code: "SIM-UNK-001", obs: "Short Burst", status: "Repeated Observation Required", note: "Only seen once, bandwidth missing." },
  { owner: 1, code: "SIM-UNK-002", obs: "Narrowband Follow-up", status: "Under Investigation", note: "Waiting for a second detection." },
  { owner: 1, code: "SIM-ART-001", obs: "Repeating Narrowband", status: "Unconfirmed Candidate", note: "Unconfirmed. Needs ON-OFF test and independent observation." },
  { owner: 2, code: "SIM-INT-001", obs: null, status: "Interference Suspected", note: "" },
  { owner: 2, code: "SIM-UNK-002", obs: null, status: "Under Investigation", note: "" },
];

module.exports = {
  demoUsers,
  hypotheses,
  researcherOneObservations,
  researcherTwoObservations,
  analysisPlan,
};
