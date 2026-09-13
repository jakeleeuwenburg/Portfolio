/* =====================================================================
   content.js — SINGLE SOURCE OF TRUTH for the whole site.
   Edit this file to change your name, projects, skills, resume, contact.
   Both the landing game and the portfolio page read from here.
   Everything marked PLACEHOLDER / REPLACE_ME should be replaced.
   ===================================================================== */

window.CONTENT = {
  name: "Jake Sleeuwenburg",
  title: "Mechanical Design Engineer",
  subtitle: "Medical Devices · R&D · Product Development",
  tagline:
    "I turn clinical needs into manufacturable mechanisms — from first sketch to verified, " +
    "documented hardware.",                        // PLACEHOLDER
  bio:
    "PLACEHOLDER — Two or three sentences about you: your focus areas, the kinds of problems you " +
    "love, and what you bring to an R&D team. Keep it specific and human.",
  location: "REPLACE_ME, USA",
  resumeUrl: "assets/resume.pdf",                  // drop your real PDF at this path

  contact: {
    email: "REPLACE_ME@example.com",
    linkedin: "https://www.linkedin.com/in/REPLACE_ME",
    github: "",                                    // optional — leave "" to hide
    phone: "",                                     // optional — leave "" to hide
  },

  /* ---------- PROJECTS ----------
     Each project becomes an obstacle in the game and a card in the portfolio.
     id:    short unique slug (used for #project-<id> links)
     icon:  one of "stapler", "pump", "bone", "rig", "bracket", "gear", "cad", "chip"
     image: path to an image (e.g. "assets/img/stapler.jpg"), or "" for an auto placeholder
  */
  projects: [
    {
      id: "stapler-reload",
      icon: "stapler",
      title: "Surgical Stapler Reload Mechanism",         // PLACEHOLDER
      role: "Lead Mechanical Engineer",
      period: "2025",
      blurb: "Redesigned a cartridge latch to cut misfire rate by 80% while holding cost neutral.",
      summary:
        "Owned the mechanical redesign of a single-use stapler reload latch. Root-caused intermittent " +
        "misfires to a tolerance stack in the sled path and replaced a four-part assembly with a " +
        "two-part molded snap fit.",
      problem: "Field reports showed a ~2% misfire rate traced to latch disengagement under load.",
      approach:
        "Tolerance stack analysis, DOE on latch geometry, FEA on snap-fit fatigue, 3D-printed and " +
        "molded prototypes, bench testing to 10× service life.",
      result:
        "Misfire rate reduced to <0.4%, part count down from 4 to 2, DHF and DFMEA updated for " +
        "design transfer.",
      tags: ["SolidWorks", "Tolerance Analysis", "FEA", "DFMEA", "ISO 13485", "Injection Molding"],
      image: "",
      links: [],                                   // e.g. [{label:"Write-up", url:"https://..."}]
    },
    {
      id: "infusion-enclosure",
      icon: "pump",
      title: "Infusion Pump Enclosure DFM",                // PLACEHOLDER
      role: "Mechanical Design Engineer",
      period: "2024",
      blurb: "Took an ambulatory pump housing from prototype to production tooling with IP54 sealing.",
      summary:
        "Matured a hand-built enclosure into a production design: draft, wall thickness, ribbing, " +
        "gasket path, and overmolded keypad, coordinating with the molder through T1–T3 tool trials.",
      problem: "The prototype housing leaked at the seam and could not be molded without sink marks.",
      approach:
        "Mold-flow review with the supplier, redesigned parting line and gasket groove, uniform " +
        "2.0 mm walls, drop and ingress testing per IEC 60601-1-11.",
      result: "Passed IP54 and 1 m drop on first tool shot; unit cost reduced 18%.",
      tags: ["DFM", "Injection Molding", "IEC 60601", "GD&T", "Supplier Management"],
      image: "",
      links: [],
    },
    {
      id: "ortho-fixture",
      icon: "bone",
      title: "Orthopedic Implant Test Fixture",            // PLACEHOLDER
      role: "R&D Engineer",
      period: "2024",
      blurb: "Designed an ASTM F1717 fixture and ran fatigue verification on a spinal rod system.",
      summary:
        "Built a modular fixture for static and dynamic testing of a pedicle-screw construct, then " +
        "executed the verification protocol on a servo-hydraulic frame.",
      problem: "Existing fixtures could not hold the required alignment across multiple rod diameters.",
      approach:
        "Kinematic-mount design, hardened inserts, alignment verified by CMM, protocol written to " +
        "ASTM F1717 with statistical sample sizing.",
      result: "All constructs exceeded 5M cycles; test report supported the 510(k) submission.",
      tags: ["Test Fixtures", "ASTM F1717", "Fatigue Testing", "CMM", "Verification & Validation"],
      image: "",
      links: [],
    },
    {
      id: "catheter-rig",
      icon: "rig",
      title: "Catheter Fatigue Test Rig",                  // PLACEHOLDER
      role: "Design Engineer",
      period: "2023",
      blurb: "Automated a 6-station tortuous-path rig with cycle counting and failure detection.",
      summary:
        "Designed and built a benchtop rig that flexes catheter shafts through anatomical paths " +
        "while logging cycles and pressure decay.",
      problem: "Manual testing took two technicians a full week per lot.",
      approach:
        "Stepper-driven cam stations, quick-change path plates, Arduino/Python data logging, " +
        "IQ/OQ documentation for lab use.",
      result: "Throughput up 6×, test variability cut in half, rig adopted across two product lines.",
      tags: ["Mechatronics", "Test Automation", "Python", "Rapid Prototyping", "IQ/OQ"],
      image: "",
      links: [],
    },
    {
      id: "bracket-opt",
      icon: "bracket",
      title: "Parametric Bracket Optimization",            // PLACEHOLDER
      role: "Personal / Academic Project",
      period: "2023",
      blurb: "Scripted a design-space sweep that found a 32% lighter bracket at equal stiffness.",
      summary:
        "Used parametric CAD and scripted FEA to explore a bracket's design space, then validated " +
        "the winning geometry with a printed and load-tested prototype.",
      problem: "Hand-iterating designs was slow and left performance on the table.",
      approach:
        "Parametric model with 6 driving dimensions, Python-driven batch simulation, Pareto " +
        "selection on mass vs. deflection, SLS-printed validation part.",
      result: "32% mass reduction, measured deflection within 5% of simulation.",
      tags: ["Parametric CAD", "FEA", "Python", "Additive Manufacturing", "Optimization"],
      image: "",
      links: [],
    },
  ],

  /* ---------- SKILLS (grouped) ---------- */
  skills: [
    { group: "CAD & Design", items: ["SolidWorks", "Fusion 360", "Creo", "GD&T (ASME Y14.5)", "Tolerance Analysis", "DFM / DFA"] },
    { group: "Analysis", items: ["FEA (static, fatigue)", "Mold-flow review", "Hand calcs", "DOE / Minitab"] },
    { group: "Manufacturing", items: ["Injection Molding", "CNC Machining", "Sheet Metal", "Additive (FDM/SLA/SLS)", "Overmolding"] },
    { group: "Quality & Regulatory", items: ["ISO 13485", "ISO 14971 / DFMEA", "IEC 60601", "Design Controls (DHF/DMR)", "V&V Protocols"] },
    { group: "Software & Tools", items: ["Python", "MATLAB", "Arduino", "Jira / Confluence", "PLM (Windchill/Arena)"] },
  ],

  /* ---------- EXPERIENCE ---------- */
  experience: [
    {
      company: "PLACEHOLDER Medical, Inc.",
      role: "Mechanical Design Engineer",
      period: "2024 – Present",
      location: "City, ST",
      bullets: [
        "Own mechanical design of disposable surgical instruments from concept through design transfer.",
        "Lead DFMEA and tolerance analysis; author V&V protocols and reports for 510(k) submissions.",
        "Coordinate with molders and machine shops on DFM, tooling trials, and first-article inspection.",
      ],
    },
    {
      company: "PLACEHOLDER Devices Co.",
      role: "R&D Engineering Intern",
      period: "2023",
      location: "City, ST",
      bullets: [
        "Designed and built automated test fixtures; wrote Python logging and analysis tools.",
        "Supported design verification testing and root-cause investigations.",
      ],
    },
  ],

  /* ---------- EDUCATION ---------- */
  education: [
    {
      school: "PLACEHOLDER University",
      degree: "B.S. Mechanical Engineering",
      period: "2019 – 2023",
      details: "Minor in Biomedical Engineering · Senior design: powered orthosis · GPA 3.8",
    },
  ],

  /* Optional certifications / awards (leave [] to hide the section) */
  extras: [
    "Certified SolidWorks Professional (CSWP)",
    "EIT / FE Exam passed",
  ],
};
