import type { DatabaseSync } from "node:sqlite";
import { seedTasks } from "./seed-tasks";

/**
 * Fictional Jamaican Geological Survey sample data.
 * Procurement task wording follows typical public-sector competitive
 * processes (need, SOW, NPP, RFP, Q&A, evaluation, award notice) and is
 * labeled as Jamaican public procurement policy only.
 */
export function seed(database: DatabaseSync) {
  database.exec(`
    INSERT INTO users (id, name, role) VALUES
      (1, 'Legend', 'Legendary Geologist'),
      (2, 'Horace', 'Chief Geologist'),
      (3, 'Marisol', 'Director of Jamaican Geology'),
      (4, 'Nadine', 'Manager of Jamaican Emerging Minerals'),
      (5, 'Fitzroy', 'Island Procurement Specialist'),
      (6, 'Amina', 'GIS Expert'),
      (7, 'Priya', 'Island Publications'),
      (8, 'Devon', 'Senior Field Geologist'),
      (9, 'Keisha', 'Survey Geophysicist'),
      (10, 'Omar', 'Laboratory Geochemist'),
      (11, 'Imani', 'Health, Safety and Environment Lead');

    INSERT INTO projects (id, name, owner_id, status, start_date, end_date) VALUES
      (1, 'Assessment of Critical Minerals in Jamaican Tailing Ponds', 1, 'on_track', '2026-05-01', '2027-03-31'),
      (2, 'Airborne Geophysical Survey of Jamaica (Magnetics and Gravity)', 1, 'at_risk', '2026-01-06', '2026-12-18'),
      (3, 'Geochemical Analysis of 10,000 Rocks Acquired by the Jamaican Bobsled Team', 1, 'on_track', '2026-03-02', '2026-11-27'),
      (4, 'Geothermal Potential Mapping of Jamaica', 1, 'at_risk', '2026-04-01', '2027-06-30'),
      (5, 'Assessment of Till and Alluvium Samples Across Jamaica', 1, 'off_track', '2026-02-02', '2027-01-29'),
      (6, 'Beach Fieldwork for Critical Mineral Potential in Jamaica', 1, 'on_track', '2026-09-01', '2027-08-31');
  `);
  seedTasks(database);
  database.exec(`
    INSERT INTO comments (id, task_id, raid_item_id, author_id, body, created_at, updated_at) VALUES
      (1, 109, NULL, 5, '@Nadine evaluation scores are in the shared folder. Two vendors are close; I need the technical panel notes from @Horace before I can lock the award recommendation under Jamaican public procurement policy.', '2026-08-18T09:10:00', '2026-08-18T09:10:00'),
      (2, 109, NULL, 4, '@Fitzroy I will have the execution-team notes to you tomorrow. Keep the file complete so we can defend the recommendation.', '2026-08-18T15:40:00', '2026-08-18T15:40:00'),
      (3, 212, NULL, 9, '@Legend weather windows over the Blue Mountains keep eating flight days. Magnetics are fine; gravity lines need a second pass on the north coast.', '2026-08-19T11:05:00', '2026-08-19T11:05:00'),
      (4, 212, NULL, 1, '@Keisha park the gravity infill until we have a clean weather week. @Imani please keep community notices current if we slip the Kingston block.', '2026-08-19T16:22:00', '2026-08-19T16:22:00'),
      (5, 304, NULL, 8, '@Legend all 10,000 bobsled-team boxes are on the racks. About 40 labels say “pushed by the team, 1988.” Sample integrity looks good; chain of custody is in the log.', '2026-05-14T13:00:00', '2026-05-14T13:00:00'),
      (6, 311, NULL, 10, '@Priya pulp IDs now match the bobsled catalogue. @Amina I will send the first assay batch as soon as QA/QC clears.', '2026-08-12T10:18:00', '2026-08-12T10:18:00'),
      (7, 411, NULL, 8, '@Amina Milk River and Bath have obvious thermal features. Access is fine. @Horace I would like a second opinion on the Clarendon warm seeps before we rank them.', '2026-08-17T14:33:00', '2026-08-17T14:33:00'),
      (8, 511, NULL, 10, '@Nadine the lab queue is the delay. Heavy-mineral concentrates are three weeks behind the plan. I will send a revised finish date this week.', '2026-08-20T08:45:00', '2026-08-20T08:45:00'),
      (9, 601, NULL, 1, '@Marisol beach charter draft is on your desk next month. @Fitzroy we will need an RFP for vessel and ATV support under Jamaican public procurement policy. @Priya please flag OFR/DIG/INF timing for a summer 2027 public drop.', '2026-08-15T09:00:00', '2026-08-15T09:00:00');

    INSERT INTO email_log (comment_id, to_user_id, subject, created_at) VALUES
      (1, 4, 'You were tagged on Evaluate proposals and recommend award under Jamaican public procurement policy', '2026-08-18T09:10:00'),
      (1, 2, 'You were tagged on Evaluate proposals and recommend award under Jamaican public procurement policy', '2026-08-18T09:10:00'),
      (2, 5, 'You were tagged on Evaluate proposals and recommend award under Jamaican public procurement policy', '2026-08-18T15:40:00'),
      (3, 1, 'You were tagged on Mobilization and airborne acquisition (magnetics and gravity)', '2026-08-19T11:05:00'),
      (4, 9, 'You were tagged on Mobilization and airborne acquisition (magnetics and gravity)', '2026-08-19T16:22:00'),
      (4, 11, 'You were tagged on Mobilization and airborne acquisition (magnetics and gravity)', '2026-08-19T16:22:00'),
      (5, 1, 'You were tagged on Inventory and QA of 10,000 bobsled-team rock samples', '2026-05-14T13:00:00'),
      (6, 7, 'You were tagged on Sample preparation (crush, split, and pulp)', '2026-08-12T10:18:00'),
      (6, 6, 'You were tagged on Sample preparation (crush, split, and pulp)', '2026-08-12T10:18:00'),
      (7, 6, 'You were tagged on Field reconnaissance of thermal features', '2026-08-17T14:33:00'),
      (7, 2, 'You were tagged on Field reconnaissance of thermal features', '2026-08-17T14:33:00'),
      (8, 4, 'You were tagged on Sample selection, reanalysis, and heavy-mineral concentrates', '2026-08-20T08:45:00'),
      (9, 3, 'You were tagged on Draft project charter', '2026-08-15T09:00:00'),
      (9, 5, 'You were tagged on Draft project charter', '2026-08-15T09:00:00'),
      (9, 7, 'You were tagged on Draft project charter', '2026-08-15T09:00:00');

    INSERT INTO raid_items (id, project_id, type, title, description, assigned_id, status) VALUES
      (1, 1, 'risk', 'Facility access delays', 'Some historic tailings sites need owner permission before cores can be collected.', 4, 'in_progress'),
      (2, 1, 'issue', 'Award recommendation still open', 'Proposal evaluation is not closed; award notice cannot be posted until the technical panel notes are filed.', 5, 'escalated'),
      (3, 2, 'risk', 'Weather windows for gravity lines', 'North-coast gravity infill is slipping because of persistent cloud and turbulence.', 9, 'open'),
      (4, 2, 'risk', 'Aircraft maintenance slot', 'Contractor flagged a possible unscheduled maintenance day in September.', 4, 'closed'),
      (5, 2, 'issue', 'Kingston block community notices aging', 'Notices need a refresh if acquisition slips past the posted dates.', 11, 'in_progress'),
      (6, 3, 'risk', 'Catalogue mismatches in bobsled boxes', 'A small set of 1988 labels do not match the modern sample IDs.', 8, 'closed'),
      (7, 3, 'issue', 'Assay batch waiting on QA/QC', 'First pulp batch cannot be released to GIS until blanks and duplicates clear.', 10, 'open'),
      (8, 4, 'risk', 'Incomplete historic heat-flow points', 'Several legacy wells have temperature data but no reliable coordinates.', 6, 'open'),
      (9, 4, 'issue', 'Clarendon warm seeps unclassified', 'Field team wants a chief geologist review before ranking those features.', 2, 'open'),
      (10, 5, 'risk', 'Lab throughput for heavy-mineral concentrates', 'Concentrate work is slower than the charter assumed.', 10, 'open'),
      (11, 5, 'issue', 'Three-week lab backlog', 'Reanalysis queue is behind plan and will push interpretation unless overtime is approved.', 4, 'open'),
      (12, 5, 'issue', 'Missing bag tags in parish 12', 'Twelve alluvium bags have no parish code; they are on hold.', 8, 'open'),
      (13, 6, 'risk', 'Seasonal swell on the south coast', 'Heavy-mineral sampling may miss the planned window if swell stays high.', 8, 'open'),
      (14, 6, 'risk', 'Vessel support still unprocured', 'Charter is not approved yet; RFP for vessel and ATV support cannot start.', 5, 'open');

    INSERT INTO comments (task_id, raid_item_id, author_id, body, created_at, updated_at) VALUES
      (NULL, 1, 4, '@Devon access letters are with the parish offices. If they stall, we will flag this at the next execution huddle.', '2026-08-16T09:20:00', '2026-08-16T09:20:00'),
      (NULL, 2, 5, '@Legend I cannot post the award notice until @Horace files the technical panel notes. Jamaican public procurement policy needs a complete evaluation file.', '2026-08-18T11:05:00', '2026-08-18T11:05:00'),
      (NULL, 3, 9, '@Nadine gravity infill on the north coast is the weather risk. Magnetics can keep flying.', '2026-08-19T10:00:00', '2026-08-19T10:00:00');
  `);
}
