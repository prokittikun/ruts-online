import { ProjectStatus } from "@prisma/client";

const ProjectStatusMap: {
  projectStatus: ProjectStatus;
  description: string;
  color?: string;
}[] = [
  {
    projectStatus: "PENDING",
    description: "รออนุมัติ",
    color: "yellow"
  },
  {
    projectStatus: "IN_PROGRESS",
    description: "อนุมัติโครงการสำเร็จ/กำลังดำเนินการ",
    color: "green"
  },
  {
    projectStatus: "REJECT",
    description: "ปฏิเสธ",
    color: "red"
  },
  {
    projectStatus: "CANCELED",
    description: "ยกเลิกโครงการ",
    color: "red"
  },
  {
    projectStatus: "COMPLETED",
    description: "โครงการเสร็จสิ้น",
    color: "green"
  },
];

export const FindProjectStatus = (status: ProjectStatus) => {
  return ProjectStatusMap.find((item) => item.projectStatus === status);
};
