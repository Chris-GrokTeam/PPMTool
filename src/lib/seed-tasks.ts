import type { DatabaseSync } from "node:sqlite";

type Child = [
  id: number,
  name: string,
  assigneeId: number,
  start: string,
  end: string,
  pct: number,
  status: string,
  milestone: number,
];

type Group = {
  parentId: number;
  parentName: string;
  assigneeId: number;
  sort: number;
  start: string;
  end: string;
  pct: number;
  status: string;
  children: Child[];
};

const GROUPS: Record<number, Group[]> = {
  1: [
    {
      parentId: 191,
      parentName: "Project charter",
      assigneeId: 1,
      sort: 100,
      start: "2026-05-01",
      end: "2026-05-25",
      pct: 100,
      status: "complete",
      children: [
        [101, "Draft project charter", 1, "2026-05-01", "2026-05-15", 100, "complete", 0],
        [102, "Technical review of project charter", 2, "2026-05-12", "2026-05-22", 100, "complete", 0],
        [103, "Approve project charter and budget", 3, "2026-05-25", "2026-05-25", 100, "milestone", 1],
      ],
    },
    {
      parentId: 192,
      parentName: "Jamaican public procurement (NPP and RFP)",
      assigneeId: 5,
      sort: 200,
      start: "2026-05-26",
      end: "2026-08-28",
      pct: 80,
      status: "in_progress",
      children: [
        [104, "Confirm Jamaican public procurement policy path (RFP or NPP)", 5, "2026-05-26", "2026-06-05", 100, "complete", 0],
        [105, "Draft statement of work and evaluation criteria under Jamaican public procurement policy", 5, "2026-06-06", "2026-06-20", 100, "complete", 0],
        [106, "Post Notice of Proposed Procurement (NPP) under Jamaican public procurement policy", 5, "2026-06-21", "2026-06-30", 100, "complete", 0],
        [107, "Issue Request for Proposals (RFP) under Jamaican public procurement policy", 5, "2026-07-01", "2026-07-15", 100, "complete", 0],
        [108, "Administer vendor question period under Jamaican public procurement policy", 5, "2026-07-16", "2026-07-31", 100, "complete", 0],
        [109, "Evaluate proposals and recommend award under Jamaican public procurement policy", 5, "2026-08-03", "2026-08-21", 80, "in_progress", 0],
        [110, "Contract award notice and vendor kickoff", 5, "2026-08-28", "2026-08-28", 0, "milestone", 1],
      ],
    },
    {
      parentId: 193,
      parentName: "Tailings sampling and laboratory characterization",
      assigneeId: 8,
      sort: 300,
      start: "2026-06-01",
      end: "2026-12-18",
      pct: 55,
      status: "in_progress",
      children: [
        [111, "Compile historic tailings inventory and site access", 8, "2026-06-01", "2026-07-17", 100, "complete", 0],
        [112, "HSE plan for tailings facility access", 11, "2026-06-08", "2026-07-03", 100, "complete", 0],
        [113, "Design sampling grid (cores, pits, and process water)", 1, "2026-07-06", "2026-08-14", 90, "in_progress", 0],
        [114, "Field sampling of tailing ponds", 8, "2026-09-01", "2026-10-30", 0, "not_started", 0],
        [115, "Laboratory characterization of critical minerals", 10, "2026-10-13", "2026-12-18", 0, "not_started", 0],
      ],
    },
    {
      parentId: 194,
      parentName: "GIS compilation and public products",
      assigneeId: 7,
      sort: 400,
      start: "2027-01-05",
      end: "2027-03-31",
      pct: 0,
      status: "not_started",
      children: [
        [116, "GIS compilation of tailings results", 6, "2027-01-05", "2027-02-19", 0, "not_started", 0],
        [117, "Prepare OFR, DIG, and INF public products", 7, "2027-02-01", "2027-03-20", 0, "not_started", 0],
        [118, "Public release of tailings assessment", 7, "2027-03-31", "2027-03-31", 0, "milestone", 1],
      ],
    },
  ],
  2: [
    {
      parentId: 291,
      parentName: "Project charter",
      assigneeId: 1,
      sort: 100,
      start: "2026-01-06",
      end: "2026-01-30",
      pct: 100,
      status: "complete",
      children: [
        [201, "Draft project charter", 1, "2026-01-06", "2026-01-20", 100, "complete", 0],
        [202, "Technical review of project charter", 2, "2026-01-15", "2026-01-27", 100, "complete", 0],
        [203, "Approve project charter and budget", 3, "2026-01-30", "2026-01-30", 100, "milestone", 1],
      ],
    },
    {
      parentId: 292,
      parentName: "Jamaican public procurement (NPP and RFP)",
      assigneeId: 5,
      sort: 200,
      start: "2026-02-02",
      end: "2026-05-15",
      pct: 100,
      status: "complete",
      children: [
        [204, "Confirm Jamaican public procurement policy path (RFP or NPP)", 5, "2026-02-02", "2026-02-13", 100, "complete", 0],
        [205, "Draft statement of work and evaluation criteria under Jamaican public procurement policy", 5, "2026-02-16", "2026-03-06", 100, "complete", 0],
        [206, "Post Notice of Proposed Procurement (NPP) under Jamaican public procurement policy", 5, "2026-03-09", "2026-03-20", 100, "complete", 0],
        [207, "Issue Request for Proposals (RFP) under Jamaican public procurement policy", 5, "2026-03-23", "2026-04-10", 100, "complete", 0],
        [208, "Evaluate proposals and recommend award under Jamaican public procurement policy", 5, "2026-04-13", "2026-05-08", 100, "complete", 0],
        [209, "Contract award notice and vendor kickoff", 5, "2026-05-15", "2026-05-15", 100, "milestone", 1],
      ],
    },
    {
      parentId: 293,
      parentName: "Airborne magnetics and gravity operations",
      assigneeId: 9,
      sort: 300,
      start: "2026-02-16",
      end: "2026-10-30",
      pct: 55,
      status: "in_progress",
      children: [
        [210, "Survey design: line spacing, altitude, magnetics and gravity specs", 9, "2026-02-16", "2026-04-03", 100, "complete", 0],
        [211, "Airspace coordination and community notices", 11, "2026-04-06", "2026-05-29", 100, "complete", 0],
        [212, "Mobilization and airborne acquisition (magnetics and gravity)", 9, "2026-06-01", "2026-09-11", 55, "in_progress", 0],
        [213, "Daily QC of magnetic and gravity data", 9, "2026-06-01", "2026-09-11", 50, "in_progress", 0],
        [214, "Processing, leveling, and grid generation", 9, "2026-09-14", "2026-10-30", 0, "not_started", 0],
      ],
    },
    {
      parentId: 294,
      parentName: "GIS compilation and public products",
      assigneeId: 7,
      sort: 400,
      start: "2026-10-19",
      end: "2026-12-18",
      pct: 0,
      status: "not_started",
      children: [
        [215, "GIS compilation of island-wide geophysical grids", 6, "2026-10-19", "2026-11-20", 0, "not_started", 0],
        [216, "Prepare OFR, DIG, and INF public products", 7, "2026-11-02", "2026-12-11", 0, "not_started", 0],
        [217, "Public release of airborne survey products", 7, "2026-12-18", "2026-12-18", 0, "milestone", 1],
      ],
    },
  ],
  3: [
    {
      parentId: 391,
      parentName: "Project charter",
      assigneeId: 1,
      sort: 100,
      start: "2026-03-02",
      end: "2026-03-24",
      pct: 100,
      status: "complete",
      children: [
        [301, "Draft project charter", 1, "2026-03-02", "2026-03-13", 100, "complete", 0],
        [302, "Technical review of project charter", 2, "2026-03-10", "2026-03-20", 100, "complete", 0],
        [303, "Approve project charter and budget", 3, "2026-03-24", "2026-03-24", 100, "milestone", 1],
      ],
    },
    {
      parentId: 392,
      parentName: "Jamaican public procurement (NPP and RFP)",
      assigneeId: 5,
      sort: 200,
      start: "2026-03-25",
      end: "2026-06-26",
      pct: 100,
      status: "complete",
      children: [
        [305, "Confirm Jamaican public procurement policy path (RFP or NPP)", 5, "2026-03-25", "2026-04-03", 100, "complete", 0],
        [306, "Draft statement of work and evaluation criteria under Jamaican public procurement policy", 5, "2026-04-06", "2026-04-24", 100, "complete", 0],
        [307, "Post Notice of Proposed Procurement (NPP) under Jamaican public procurement policy", 5, "2026-04-27", "2026-05-08", 100, "complete", 0],
        [308, "Issue Request for Proposals (RFP) under Jamaican public procurement policy", 5, "2026-05-11", "2026-05-29", 100, "complete", 0],
        [309, "Evaluate proposals and recommend award under Jamaican public procurement policy", 5, "2026-06-01", "2026-06-19", 100, "complete", 0],
        [310, "Contract award notice and vendor kickoff", 5, "2026-06-26", "2026-06-26", 100, "milestone", 1],
      ],
    },
    {
      parentId: 393,
      parentName: "Sample preparation and geochemical analysis",
      assigneeId: 10,
      sort: 300,
      start: "2026-03-25",
      end: "2026-10-23",
      pct: 50,
      status: "in_progress",
      children: [
        [304, "Inventory and QA of 10,000 bobsled-team rock samples", 8, "2026-03-25", "2026-05-15", 100, "complete", 0],
        [311, "Sample preparation (crush, split, and pulp)", 10, "2026-06-29", "2026-08-14", 70, "in_progress", 0],
        [312, "Multi-element assay and QA/QC", 10, "2026-08-03", "2026-09-25", 25, "in_progress", 0],
        [313, "Geochemical interpretation", 1, "2026-09-21", "2026-10-23", 0, "not_started", 0],
      ],
    },
    {
      parentId: 394,
      parentName: "GIS compilation and public products",
      assigneeId: 7,
      sort: 400,
      start: "2026-10-12",
      end: "2026-11-27",
      pct: 0,
      status: "not_started",
      children: [
        [314, "GIS compilation of geochemical results", 6, "2026-10-12", "2026-11-06", 0, "not_started", 0],
        [315, "Prepare OFR, DIG, and INF public products", 7, "2026-10-26", "2026-11-20", 0, "not_started", 0],
        [316, "Public release of bobsled-team geochemistry", 7, "2026-11-27", "2026-11-27", 0, "milestone", 1],
      ],
    },
  ],
  4: [
    {
      parentId: 491,
      parentName: "Project charter",
      assigneeId: 1,
      sort: 100,
      start: "2026-04-01",
      end: "2026-04-24",
      pct: 100,
      status: "complete",
      children: [
        [401, "Draft project charter", 1, "2026-04-01", "2026-04-15", 100, "complete", 0],
        [402, "Technical review of project charter", 2, "2026-04-10", "2026-04-22", 100, "complete", 0],
        [403, "Approve project charter and budget", 3, "2026-04-24", "2026-04-24", 100, "milestone", 1],
      ],
    },
    {
      parentId: 492,
      parentName: "Jamaican public procurement (NPP and RFP)",
      assigneeId: 5,
      sort: 200,
      start: "2026-04-27",
      end: "2026-07-31",
      pct: 100,
      status: "complete",
      children: [
        [404, "Confirm Jamaican public procurement policy path (RFP or NPP)", 5, "2026-04-27", "2026-05-08", 100, "complete", 0],
        [405, "Draft statement of work and evaluation criteria under Jamaican public procurement policy", 5, "2026-05-11", "2026-05-29", 100, "complete", 0],
        [406, "Post Notice of Proposed Procurement (NPP) under Jamaican public procurement policy", 5, "2026-06-01", "2026-06-12", 100, "complete", 0],
        [407, "Issue Request for Proposals (RFP) under Jamaican public procurement policy", 5, "2026-06-15", "2026-07-03", 100, "complete", 0],
        [408, "Evaluate proposals and recommend award under Jamaican public procurement policy", 5, "2026-07-06", "2026-07-24", 100, "complete", 0],
        [409, "Contract award notice and vendor kickoff", 5, "2026-07-31", "2026-07-31", 100, "milestone", 1],
      ],
    },
    {
      parentId: 493,
      parentName: "Geothermal field investigation",
      assigneeId: 8,
      sort: 300,
      start: "2026-05-04",
      end: "2026-09-25",
      pct: 70,
      status: "in_progress",
      children: [
        [410, "Compile existing wells, springs, and heat-flow data", 9, "2026-05-04", "2026-07-17", 100, "complete", 0],
        [411, "Field reconnaissance of thermal features", 8, "2026-08-03", "2026-09-25", 40, "in_progress", 0],
      ],
    },
    {
      parentId: 494,
      parentName: "GIS compilation and public products",
      assigneeId: 7,
      sort: 400,
      start: "2026-09-07",
      end: "2027-06-30",
      pct: 10,
      status: "in_progress",
      children: [
        [412, "GIS geothermal favourability mapping", 6, "2026-09-07", "2026-12-18", 15, "in_progress", 0],
        [413, "Build public web map of geothermal potential", 6, "2027-01-05", "2027-03-26", 0, "not_started", 0],
        [414, "Prepare OFR, DIG, and INF public products", 7, "2027-03-01", "2027-05-28", 0, "not_started", 0],
        [415, "Public release of geothermal potential map", 7, "2027-06-30", "2027-06-30", 0, "milestone", 1],
      ],
    },
  ],
  5: [
    {
      parentId: 591,
      parentName: "Project charter",
      assigneeId: 1,
      sort: 100,
      start: "2026-02-02",
      end: "2026-02-24",
      pct: 100,
      status: "complete",
      children: [
        [501, "Draft project charter", 1, "2026-02-02", "2026-02-13", 100, "complete", 0],
        [502, "Technical review of project charter", 2, "2026-02-10", "2026-02-20", 100, "complete", 0],
        [503, "Approve project charter and budget", 3, "2026-02-24", "2026-02-24", 100, "milestone", 1],
      ],
    },
    {
      parentId: 592,
      parentName: "Jamaican public procurement (NPP and RFP)",
      assigneeId: 5,
      sort: 200,
      start: "2026-02-25",
      end: "2026-05-29",
      pct: 100,
      status: "complete",
      children: [
        [504, "Confirm Jamaican public procurement policy path (RFP or NPP)", 5, "2026-02-25", "2026-03-06", 100, "complete", 0],
        [505, "Draft statement of work and evaluation criteria under Jamaican public procurement policy", 5, "2026-03-09", "2026-03-27", 100, "complete", 0],
        [506, "Post Notice of Proposed Procurement (NPP) under Jamaican public procurement policy", 5, "2026-03-30", "2026-04-10", 100, "complete", 0],
        [507, "Issue Request for Proposals (RFP) under Jamaican public procurement policy", 5, "2026-04-13", "2026-05-01", 100, "complete", 0],
        [508, "Evaluate proposals and recommend award under Jamaican public procurement policy", 5, "2026-05-04", "2026-05-22", 100, "complete", 0],
        [509, "Contract award notice and vendor kickoff", 5, "2026-05-29", "2026-05-29", 100, "milestone", 1],
      ],
    },
    {
      parentId: 593,
      parentName: "Till and alluvium analysis",
      assigneeId: 10,
      sort: 300,
      start: "2026-03-02",
      end: "2026-11-27",
      pct: 45,
      status: "in_progress",
      children: [
        [510, "Compile existing till and alluvium collections", 8, "2026-03-02", "2026-04-24", 100, "complete", 0],
        [511, "Sample selection, reanalysis, and heavy-mineral concentrates", 10, "2026-06-01", "2026-10-16", 35, "in_progress", 0],
        [512, "Interpret results against drainage and landscape setting", 1, "2026-10-05", "2026-11-27", 0, "not_started", 0],
      ],
    },
    {
      parentId: 594,
      parentName: "GIS compilation and public products",
      assigneeId: 7,
      sort: 400,
      start: "2026-11-09",
      end: "2027-01-29",
      pct: 0,
      status: "not_started",
      children: [
        [513, "GIS compilation of till and alluvium results", 6, "2026-11-09", "2026-12-18", 0, "not_started", 0],
        [514, "Prepare OFR, DIG, and INF public products", 7, "2026-12-07", "2027-01-22", 0, "not_started", 0],
        [515, "Public release of till and alluvium assessment", 7, "2027-01-29", "2027-01-29", 0, "milestone", 1],
      ],
    },
  ],
  6: [
    {
      parentId: 691,
      parentName: "Project charter",
      assigneeId: 1,
      sort: 100,
      start: "2026-09-01",
      end: "2026-09-25",
      pct: 0,
      status: "not_started",
      children: [
        [601, "Draft project charter", 1, "2026-09-01", "2026-09-15", 0, "not_started", 0],
        [602, "Technical review of project charter", 2, "2026-09-10", "2026-09-22", 0, "not_started", 0],
        [603, "Approve project charter and budget", 3, "2026-09-25", "2026-09-25", 0, "milestone", 1],
      ],
    },
    {
      parentId: 692,
      parentName: "Jamaican public procurement (NPP and RFP)",
      assigneeId: 5,
      sort: 200,
      start: "2026-09-28",
      end: "2027-01-08",
      pct: 0,
      status: "not_started",
      children: [
        [604, "Confirm Jamaican public procurement policy path (RFP or NPP)", 5, "2026-09-28", "2026-10-09", 0, "not_started", 0],
        [605, "Draft statement of work and evaluation criteria under Jamaican public procurement policy", 5, "2026-10-12", "2026-10-30", 0, "not_started", 0],
        [606, "Post Notice of Proposed Procurement (NPP) under Jamaican public procurement policy", 5, "2026-11-02", "2026-11-13", 0, "not_started", 0],
        [607, "Issue Request for Proposals (RFP) under Jamaican public procurement policy", 5, "2026-11-16", "2026-12-04", 0, "not_started", 0],
        [608, "Evaluate proposals and recommend award under Jamaican public procurement policy", 5, "2026-12-07", "2026-12-23", 0, "not_started", 0],
        [609, "Contract award notice and vendor kickoff", 5, "2027-01-08", "2027-01-08", 0, "milestone", 1],
      ],
    },
    {
      parentId: 693,
      parentName: "Beach sampling and laboratory characterization",
      assigneeId: 8,
      sort: 300,
      start: "2026-10-05",
      end: "2027-06-11",
      pct: 0,
      status: "not_started",
      children: [
        [610, "HSE plan for beach access, heat, and tides", 11, "2026-10-05", "2026-11-13", 0, "not_started", 0],
        [611, "Island-wide beach inventory and access permissions", 8, "2026-10-19", "2026-12-18", 0, "not_started", 0],
        [612, "Heavy-mineral sand sampling on Jamaican beaches", 8, "2027-01-11", "2027-04-30", 0, "not_started", 0],
        [613, "Laboratory characterization of beach concentrates", 10, "2027-03-15", "2027-06-11", 0, "not_started", 0],
      ],
    },
    {
      parentId: 694,
      parentName: "GIS compilation and public products",
      assigneeId: 7,
      sort: 400,
      start: "2027-05-17",
      end: "2027-08-31",
      pct: 0,
      status: "not_started",
      children: [
        [614, "GIS compilation of beach mineral potential", 6, "2027-05-17", "2027-07-09", 0, "not_started", 0],
        [615, "Prepare OFR, DIG, and INF public products", 7, "2027-06-14", "2027-08-13", 0, "not_started", 0],
        [616, "Public release of beach critical-mineral assessment", 7, "2027-08-31", "2027-08-31", 0, "milestone", 1],
      ],
    },
  ],
};

export function seedTasks(database: DatabaseSync) {
  const insert = database.prepare(
    `INSERT INTO tasks (
       id, project_id, name, assignee_id, start_date, end_date,
       percent_complete, status, is_milestone, parent_id, sort_order
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const [projectId, groups] of Object.entries(GROUPS)) {
    const pid = Number(projectId);
    for (const group of groups) {
      insert.run(
        group.parentId,
        pid,
        group.parentName,
        group.assigneeId,
        group.start,
        group.end,
        group.pct,
        group.status,
        0,
        null,
        group.sort
      );
      group.children.forEach((child, index) => {
        insert.run(
          child[0],
          pid,
          child[1],
          child[2],
          child[3],
          child[4],
          child[5],
          child[6],
          child[7],
          group.parentId,
          group.sort + 1 + index
        );
      });
    }
  }
}
