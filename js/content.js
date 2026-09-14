/* =====================================================================
   content.js — SINGLE SOURCE OF TRUTH for the whole site.
   Edit this file to change your name, projects, skills, resume, contact.
   Both the landing game and the portfolio page read from here.
   ===================================================================== */

window.CONTENT = {
  name: "Jake Leeuwenburg",
  title: "Mechanical Engineer",
  subtitle: "Medical Device R&D · Mechanical Design · Quality",
  tagline:
    "I design and verify medical device hardware — from concept and DFM through bench testing, " +
    "design controls, and first-in-human use.",
  bio:
    "R&D engineer at Innovative Drive Corporation, where I led mechanical design of a novel intravascular " +
    "lithotripsy (IVL) device from concept through design verification and first-in-human cases. " +
    "Previously a quality and manufacturing engineer at Inspire Products, qualifying processes and " +
    "building fixtures for medical device components. Cal Poly SLO mechanical engineering grad who " +
    "likes building test rigs, writing simulation tools, and closing the loop between data and design.",
  location: "Reno, NV",
  resumeUrl: "assets/Jake-Leeuwenburg-Resume.pdf",

  contact: {
    email: "jakesleeuwenburg@gmail.com",
    linkedin: "https://www.linkedin.com/in/jake-leeuwenburg",
    github: "https://github.com/jakeleeuwenburg",
    phone: "636-692-1964",
  },

  /* ---------- PROJECTS ----------
     Each project becomes an obstacle in the game and a card in the portfolio.
     id:    short unique slug (used for #project-<id> links)
     icon:  one of "catheter", "gear", "hammer", "wave", "chart", "fixture", "cad", "chip",
            "stapler", "pump", "bone", "rig", "bracket"
     image: path to an image (e.g. "assets/img/ivl.jpg"), or "" for an auto placeholder
  */
  projects: [
    {
      id: "ivl-device",
      icon: "catheter",
      title: "Intravascular Lithotripsy (IVL) Device",
      role: "Lead Mechanical Design · Innovative Drive Corporation",
      period: "2025 – Present",
      blurb: "Led mechanical design of a novel IVL device from concept through design verification and first-in-human cases.",
      summary:
        "Owned the mechanical design of a new intravascular lithotripsy device, taking it from early concept " +
        "through design verification, successful first-in-human cases, and the verification data package " +
        "for the FDA IDE submission.",
      problem:
        "A novel device concept needed to become a manufacturable, verified design under FDA deadlines, " +
        "with mechanical, electrical, software, quality, clinical, and regulatory teams all depending on it.",
      approach:
        "Designed injection-molded and machined components and drove DFM iterations with an international " +
        "molder. Integrated Hall effect sensors and magnets, IR optical sensors, and a fluid pressure sensor. " +
        "Built benchtop models of clinical and worst-case use conditions, instrumented with dynamic and " +
        "low-frequency pressure sensors and oscilloscope capture. Authored DHF/DMR documentation, drawings, " +
        "protocols, and reports per ISO 13485 / 21 CFR 820; ran design reviews, V&V, DFMEA, and PFMEA under " +
        "ISO 14971.",
      result:
        "Device advanced to successful first-in-human cases. Verification data delivered for the FDA IDE " +
        "submission. Design transfer prepared for a contract manufacturer via DFM/DFA, component " +
        "specifications, and assembly fixtures. Supported animal and cadaver studies, sterilization, " +
        "IEC 60601 safety/EMC, and packaging transit testing.",
      tags: ["SolidWorks", "Injection Molding", "DFM/DFA", "Design Controls", "ISO 14971", "DFMEA/PFMEA", "Sensor Integration", "FDA IDE"],
      image: "",
      links: [],
    },
    {
      id: "nitinol-fixtures",
      icon: "fixture",
      title: "Nitinol Shape-Setting Fixtures",
      role: "Quality & Manufacturing Engineer · Inspire Products",
      period: "2024 – 2025",
      blurb: "Redesigned shape-setting fixtures that cut heat-cycle time 56%, changeover 51%, and raised yield 29%.",
      summary:
        "Designed new nitinol shape-setting fixtures for medical device components and qualified the " +
        "updated process, delivering large gains in cycle time, changeover, and yield.",
      problem:
        "The existing shape-setting process was slow to heat-cycle, slow to change over between parts, " +
        "and produced too many out-of-spec components.",
      approach:
        "Redesigned the fixtures for faster thermal response and quick changeover, then authored and " +
        "executed OQ/PQ protocols to qualify the process under ISO 13485, backed by SPC and Cp/Cpk studies.",
      result: "Heat-cycle time reduced 56%, changeover time reduced 51%, and yield improved 29%.",
      tags: ["Fixture Design", "Nitinol", "Process Qualification", "OQ/PQ", "SPC / Cpk", "ISO 13485"],
      image: "",
      links: [],
    },
    {
      id: "hammer-simulator",
      icon: "hammer",
      title: "Cam-Driven Hammer & Die Spring Simulator",
      role: "Personal engineering tool",
      period: "2025",
      blurb: "Interactive 3D simulation that diagnosed spring rotation and seat scoring in a cam-driven hammer mechanism.",
      summary:
        "Built an interactive 3D simulation in JavaScript and Three.js (models in Blender) to study the " +
        "dynamics of a cam-driven hammer and die spring assembly.",
      problem:
        "A hammer mechanism showed spring rotation and seat scoring, and only a handful of test units " +
        "were available to investigate and verify a fix.",
      approach:
        "Modeled the cam, hammer, and spring interaction in a browser-based simulation and used it to " +
        "reproduce the failure mode and explore candidate design changes.",
      result:
        "Identified the root cause and vetted the design change in simulation before committing the " +
        "few available test units to physical verification.",
      tags: ["JavaScript", "Three.js", "Blender", "Mechanism Design", "Root Cause Analysis"],
      image: "",
      links: [],
    },
    {
      id: "acoustic-simulator",
      icon: "wave",
      title: "IVL Fluid-Path Acoustic Simulator",
      role: "Personal engineering tool",
      period: "2025",
      blurb: "1-D finite-difference acoustic solver that predicts pressure pulse transmission through the device fluid path.",
      summary:
        "Wrote a one-dimensional acoustic wave solver based on Webster's horn equation to predict how " +
        "pressure pulses propagate through the IVL fluid path.",
      problem:
        "Fluid-path geometry decisions were being made ahead of bench testing without a way to " +
        "estimate pulse transmission or cavitation risk.",
      approach:
        "Implemented a finite-difference solver in JavaScript and used it to evaluate fluid-path " +
        "geometry, wall compliance, and cavitation risk across design options.",
      result: "Guided fluid-path design decisions ahead of bench testing, reducing test iterations.",
      tags: ["JavaScript", "Numerical Methods", "Acoustics", "Finite Difference", "Simulation"],
      image: "",
      links: [],
    },
    {
      id: "dv-toolkit",
      icon: "chart",
      title: "Design Verification Data Analysis Toolkit",
      role: "Personal engineering tool",
      period: "2025",
      blurb: "Python GUI and batch tools that score leak, pressure, and hit-frequency tests and build an HTML dashboard.",
      summary:
        "Built a Python toolkit (pandas, SciPy, matplotlib) that scores design verification test data " +
        "and generates an HTML dashboard, plus a transient spectral analysis pipeline for device performance.",
      problem:
        "Verification testing produced large volumes of leak, pressure range, and hit-frequency data " +
        "that were slow and error-prone to score by hand.",
      approach:
        "Wrote GUI and batch tools to ingest and score each test type, and a spectral pipeline " +
        "(STFT, peak detection, calibration) to analyze transient device output.",
      result: "Automated scoring and an at-a-glance dashboard for verification results.",
      tags: ["Python", "pandas", "SciPy", "matplotlib", "Signal Processing", "Test Data Analysis"],
      image: "",
      links: [],
    },
    {
      id: "inspection-fixtures",
      icon: "gear",
      title: "Electro-Mechanical Inspection Fixtures",
      role: "Quality & Manufacturing Engineer · Inspire Products",
      period: "2024 – 2025",
      blurb: "Built and validated inspection fixtures and trained technicians, improving outgoing quality.",
      summary:
        "Designed, built, and validated electro-mechanical inspection fixtures for medical device " +
        "components, then trained technicians on their use.",
      problem: "Outgoing inspection needed more repeatable, faster checks on manufactured components.",
      approach:
        "Developed fixtures combining mechanical locating with electrical checks, validated them, and " +
        "wrote training for the production team. Supported CAPA investigations and root cause analyses " +
        "with the resulting data.",
      result: "Improved outgoing quality and gave the team validated, repeatable inspection tooling.",
      tags: ["Fixture Design", "Validation", "CAPA", "Root Cause Analysis", "Training"],
      image: "",
      links: [],
    },
  ],

  /* ---------- SKILLS (grouped) ---------- */
  skills: [
    { group: "Design & Manufacturing", items: ["SolidWorks", "GD&T", "DFM / DFA", "Injection Molding", "Machining", "Fixture Design", "3D Printing"] },
    { group: "Quality & Regulatory", items: ["Design Controls (DHF/DMR)", "ISO 13485 / 9001", "ISO 14971", "DFMEA / PFMEA", "V&V", "OQ / PQ", "CAPA", "SPC / Cpk", "21 CFR 820"] },
    { group: "Testing & Instrumentation", items: ["Benchtop Test Models", "Pressure Transducers", "Hall Effect & IR Sensors", "Oscilloscopes", "OMM", "IEC 60601"] },
    { group: "Materials & Processes", items: ["Nitinol Shape Setting", "Heat Staking", "Soldering", "Plastic & Metal Component Specification"] },
    { group: "Programming & Tools", items: ["Python (pandas, SciPy)", "JavaScript", "Three.js", "Arduino", "AI-assisted development (Claude Code)"] },
  ],

  /* ---------- EXPERIENCE ---------- */
  experience: [
    {
      company: "Innovative Drive Corporation",
      role: "Research and Development Engineer",
      period: "Jul 2025 – Present",
      location: "Reno, NV",
      bullets: [
        "Led mechanical design of a novel intravascular lithotripsy (IVL) device from concept through design verification.",
        "Advanced the device to successful first-in-human cases and delivered verification data for the FDA IDE submission.",
        "Designed injection-molded and machined components; drove DFM iterations with an international injection molder.",
        "Built benchtop test models of clinical and worst-case use conditions, generating data that drove design decisions.",
        "Authored DHF/DMR documentation, drawings, protocols, and reports per ISO 13485 / 21 CFR 820 design controls.",
        "Executed design reviews, design V&V, DFMEA, and PFMEA under ISO 14971 risk management processes.",
        "Integrated Hall effect sensors and magnets, IR optical sensors, and a fluid pressure sensor into the device design.",
        "Prepared design transfer to a contract manufacturer via DFM/DFA, component specifications, and assembly fixtures.",
      ],
    },
    {
      company: "Inspire Products Inc.",
      role: "Quality and Manufacturing Engineer",
      period: "Jan 2024 – Jul 2025",
      location: "Reno, NV",
      bullets: [
        "Designed nitinol shape-setting fixtures that cut heat-cycle time 56%, changeover time 51%, and raised yield 29%.",
        "Authored and executed OQ/PQ protocols to qualify manufacturing processes for medical device components.",
        "Built and validated electro-mechanical inspection fixtures and trained technicians, improving outgoing quality.",
        "Led CAPA investigations and root cause analyses; implemented corrective actions and authored reports.",
        "Maintained the ISO 13485 / ISO 9001 QMS, supported internal and supplier audits, and ran SPC and Cp/Cpk studies.",
      ],
    },
  ],

  /* ---------- EDUCATION ---------- */
  education: [
    {
      school: "California Polytechnic State University, San Luis Obispo",
      degree: "B.S. Mechanical Engineering",
      period: "Sep 2023",
      details: "San Luis Obispo, CA",
    },
  ],

  /* Optional certifications / awards (leave [] to hide the section) */
  extras: [
    "ASQ Certified Quality Improvement Associate (CQIA)",
  ],
};
