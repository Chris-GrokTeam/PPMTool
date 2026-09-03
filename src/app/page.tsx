import { AppHeader } from "@/components/AppHeader";
import { ganttRangeFrom } from "@/components/Gantt";
import { OpenRaidList } from "@/components/OpenRaidList";
import { PortfolioGantt } from "@/components/PortfolioGantt";
import { listOpenRaid, listProjects, listTasks } from "@/lib/queries";
import { toISORange } from "@/lib/timeline";

export default function PortfolioPage() {
  const projects = listProjects().map((project) => ({
    ...project,
    milestones: listTasks(project.id)
      .filter((task) => task.is_milestone)
      .map((task) => ({ date: task.start_date, title: task.name })),
  }));
  const range = ganttRangeFrom(
    projects.flatMap((project) => [project.start_date, project.end_date])
  );
  const openRaid = listOpenRaid({});

  return (
    <>
      <AppHeader active="home" />
      <main className="flex-1 p-4 pb-20">
        <PortfolioGantt projects={projects} rangeISO={toISORange(range)} />
        <OpenRaidList items={openRaid} />
      </main>
    </>
  );
}
