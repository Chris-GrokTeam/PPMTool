import { redirect } from "next/navigation";

export default async function ProjectRisksRedirect({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/projects/${projectId}#risks-and-issues`);
}
