import React, { useEffect, useState } from "react";

import { ControlledInput } from "@/components/Controlled";
import ControlledDatePicker from "@/components/ControlledDatePicker";
import ControlledInputNumber from "@/components/ControlledInputNumber";
import ControlledSelect from "@/components/ControlledSelect";
import ItemStructure from "@/components/ItemStructure";
import {
  CreateProjectSchema,
  type ICreateProject,
} from "@/schemas/projects/createProject";
import {
  IUpdateProject,
  UpdateProjectSchema,
} from "@/schemas/projects/updateProject";
import { DateTimeFormatOptions } from "@/utils/DateTimeFormatOptions";
import { FindProjectStatus } from "@/utils/ProjectStatusMap";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge, Button, Checkbox, Input, Modal, Popover } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { ProjectStatus } from "@prisma/client";
import {
  IconCheckbox,
  IconEdit,
  IconFilter,
  IconReload,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { Table } from "antd";
import { type ColumnProps } from "antd/es/table";
import { FilePlus2, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";
import CreateProjectModal from "@/components/CreateProjectModal";
// export const getServerSideProps: GetServerSideProps = async (ctx) => {
//   // const token = await getToken({
//   //     req: ctx.req,
//   //     secret: env.NEXTAUTH_SECRET,
//   // })
//   // if (token?.role) {
//   return {
//     redirect: {
//       permanent: false,
//       destination: `/ADMIN/announce`,
//     },
//     props: {},
//   };
//   // }
//   // return {
//   //   props: {},
//   // };
// };
function Index() {
  const { data: session, status } = useSession();
  const [opened, { open, close }] = useDisclosure(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProjectId, setEditingProjectId] = React.useState<number | null>(
    null,
  );
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const navigate = useRouter();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedStatuses, setSelectedStatuses] = useState<ProjectStatus[]>(
    () => {
      const statusParam = searchParams.get("status");
      return statusParam ? (statusParam.split(",") as ProjectStatus[]) : [];
    },
  );

  const [showStatusFilter, setShowStatusFilter] = useState(false);

  const statusOptions = [
    { label: "รออนุมัติ", value: ProjectStatus.PENDING },
    { label: "กำลังดำเนินการ", value: ProjectStatus.IN_PROGRESS },
    { label: "เสร็จสิ้น", value: ProjectStatus.COMPLETED },
    { label: "ยกเลิก", value: ProjectStatus.CANCELED },
    { label: "ปฏิเสธ", value: ProjectStatus.REJECT },
  ];

  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam) {
      setSelectedStatuses(statusParam.split(",") as ProjectStatus[]);
    }
  }, [searchParams]);

  const {
    data: getAllProjectData,
    isLoading,
    refetch,
  } = api.project.getAllProject.useQuery({
    currentPage: currentPage,
    perPages: perPage,
    keyword: searchValue,
    status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    personnelId: session?.user.id,
  });
  const deleteProjectApi = api.project.deleteProject.useMutation();
  const resentProjectApi = api.project.resentProject.useMutation();
  const cancelProjectApi = api.project.cancelProject.useMutation();
  const completedProjectApi = api.project.completedProject.useMutation();

  const handleStatusChange = (statusValue: ProjectStatus) => {
    const newSelectedStatuses = selectedStatuses.includes(statusValue)
      ? selectedStatuses.filter((s) => s !== statusValue)
      : [...selectedStatuses, statusValue];

    setSelectedStatuses(newSelectedStatuses);

    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    if (newSelectedStatuses.length > 0) {
      params.set("status", newSelectedStatuses.join(","));
    } else {
      params.delete("status");
    }

    router.push(`?${params.toString()}`);
    setCurrentPage(1);
    void refetch();
  };

  const StatusFilterDropdown = () => (
    <div className="rounded-md bg-white p-4 shadow-lg">
      <div className="flex flex-col gap-2">
        {statusOptions.map((status) => (
          <Checkbox
            key={status.value}
            label={status.label}
            checked={selectedStatuses.includes(status.value)}
            onChange={() => handleStatusChange(status.value)}
          />
        ))}
      </div>
    </div>
  );

  const onDownload = async (url: string, name: string) => {
    const link = document.createElement("a");
    link.href = url ?? "";
    link.target = "_blank";
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onDelete = (projectData: ColumnType) => {
    try {
      modals.openConfirmModal({
        title: (
          <span>
            ยินยันที่จะ<span className="font-bold text-red-700">ลบ</span>โครงการ{" "}
            <Badge color="blue">{projectData.name}</Badge> ใช่หรือไม่ ?
          </span>
        ),
        children: (
          <span className="text-sm">
            การดำเนินการนี้จะทำการลบข้อมูลสำคัญอย่างถาวร
            และไม่สามารถนำกลับมาได้อีก
          </span>
        ),
        labels: { confirm: "ยืนยัน", cancel: "ยกเลิก" },
        confirmProps: { color: "red" },
        onCancel: () => console.log("Cancel"),
        onConfirm: () => {
          const idToast = toast.loading("กำลังลบโครงการ...");
          deleteProjectApi.mutate(projectData.id, {
            onSuccess: () => {
              toast.success("ลบโครงการสำเร็จ", { id: idToast });
              void refetch();
            },
            onError: (error) => {
              toast.error("ลบโครงการไม่สำเร็จ", {
                id: idToast,
                description: error.message,
              });
            },
          });
        },
      });
    } catch (error) {}
  };

  const onResentProject = (projectData: ColumnType) => {
    try {
      modals.openConfirmModal({
        title: (
          <span>
            ยินยันที่จะเสนอโครงการ{" "}
            <Badge color="blue">{projectData.name}</Badge> อีกครั้งใช่หรือไม่ ?
          </span>
        ),
        // children: (
        //   <span className="text-sm">
        //     การดำเนินการนี้จะทำการลบข้อมูลสำคัญอย่างถาวร
        //     และไม่สามารถนำกลับมาได้อีก
        //   </span>
        // ),
        labels: { confirm: "ยืนยัน", cancel: "ยกเลิก" },
        confirmProps: { color: "green" },
        onCancel: () => console.log("Cancel"),
        onConfirm: () => {
          const idToast = toast.loading("กำลังดำเนินการ...");
          resentProjectApi.mutate(projectData.id, {
            onSuccess: () => {
              toast.success("ดำเนินการสำเร็จ", { id: idToast });
              void refetch();
            },
            onError: (error) => {
              toast.error("ดำเนินการไม่สำเร็จ", {
                id: idToast,
                description: error.message,
              });
            },
          });
        },
      });
    } catch (error) {}
  };
  const onCancelProject = (projectData: ColumnType) => {
    try {
      modals.openConfirmModal({
        title: (
          <span>
            ยินยันที่จะยกเลิกโครงการ{" "}
            <Badge color="blue">{projectData.name}</Badge> ใช่หรือไม่ ?
          </span>
        ),
        // children: (
        //   <span className="text-sm">
        //     การดำเนินการนี้จะทำการลบข้อมูลสำคัญอย่างถาวร
        //     และไม่สามารถนำกลับมาได้อีก
        //   </span>
        // ),
        labels: { confirm: "ยืนยัน", cancel: "ยกเลิก" },
        confirmProps: { color: "red" },
        onCancel: () => console.log("Cancel"),
        onConfirm: () => {
          const idToast = toast.loading("กำลังดำเนินการ...");
          cancelProjectApi.mutate(projectData.id, {
            onSuccess: () => {
              toast.success("ดำเนินการสำเร็จ", { id: idToast });
              void refetch();
            },
            onError: (error) => {
              toast.error("ดำเนินการไม่สำเร็จ", {
                id: idToast,
                description: error.message,
              });
            },
          });
        },
      });
    } catch (error) {}
  };
  const onCompletedProject = (projectData: ColumnType) => {
    try {
      modals.openConfirmModal({
        title: (
          <span>
            ยินยันที่จะเสร็จสิ้นโครงการ{" "}
            <Badge color="blue">{projectData.name}</Badge> ใช่หรือไม่ ?
          </span>
        ),
        // children: (
        //   <span className="text-sm">
        //     การดำเนินการนี้จะทำการลบข้อมูลสำคัญอย่างถาวร
        //     และไม่สามารถนำกลับมาได้อีก
        //   </span>
        // ),
        labels: { confirm: "ยืนยัน", cancel: "ยกเลิก" },
        confirmProps: { color: "green" },
        onCancel: () => console.log("Cancel"),
        onConfirm: () => {
          const idToast = toast.loading("กำลังดำเนินการ...");
          completedProjectApi.mutate(projectData.id, {
            onSuccess: () => {
              toast.success("ดำเนินการสำเร็จ", { id: idToast });
              void refetch();
            },
            onError: (error) => {
              toast.error("ดำเนินการไม่สำเร็จ", {
                id: idToast,
                description: error.message,
              });
            },
          });
        },
      });
    } catch (error) {}
  };

  const onSearchChange = useDebounceCallback((value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
    void refetch();
  }, 500);

  type ColumnType = NonNullable<typeof getAllProjectData>["data"] extends
    | (infer T)[]
    | null
    | undefined
    ? T
    : never;
  return (
    <>
      <CreateProjectModal
        opened={opened}
        close={close}
        refetch={refetch}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        editingProjectId={editingProjectId}
        setEditingProjectId={setEditingProjectId}
      />
      <div className="flex flex-col gap-5">
        <div className="flex w-full items-center justify-between">
          <span className="text-2xl font-bold">โครงการทั้งหมด</span>
          {status === "authenticated" ? (
            <div className="flex gap-2">
              {/* <Button
                size="md"
                color="blue"
                leftSection={<FilePlus2 />}
                onClick={() => {
                  // setEditingEquipmentId(null);
                  // setIsEditMode(false);
                  // reset();
                  // open();
                  // navigate.push("/PERSONNEL/approve-docx");
                  onDownload(
                    `${process.env.NEXTAUTH_URL}/webviewer/1.docx`,
                    "แบบเสนอขออนุมัติโครงการ.docx",
                  );
                }}
              >
                ดาวน์โหลดแบบเสนอขออนุมัติโครงการ
              </Button>
              <Button
                size="md"
                color="blue"
                leftSection={<FilePlus2 />}
                onClick={() => {
                  // setEditingEquipmentId(null);
                  // setIsEditMode(false);
                  // reset();
                  // open();
                  onDownload(
                    `${process.env.NEXTAUTH_URL}/webviewer/2.docx`,
                    "แบบเสนอขอเงินสนับสนุนโครงการ.docx",
                  );
                  // navigate.push("/PERSONNEL/support-budget-docx");
                }}
              >
                ดาวน์โหลดแบบเสนอขอเงินสนับสนุนโครงการ
              </Button> */}
              <Button
                size="md"
                color="blue"
                leftSection={<Plus />}
                onClick={() => {
                  setEditingProjectId(null);
                  setIsEditMode(false);
                  // reset();
                  open();
                }}
              >
                เพิ่มโครงการ
              </Button>
            </div>
          ) : null}
        </div>
        {/* <Input
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ค้นหา"
          leftSection={<IconSearch stroke={1.5} />}
        /> */}
        <div className="flex gap-4">
          <Input
            className="flex-1"
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ค้นหา"
            leftSection={<IconSearch stroke={1.5} />}
          />
          <Button
            variant="outline"
            leftSection={<IconFilter size="1rem" />}
            onClick={() => setShowStatusFilter(!showStatusFilter)}
          >
            ตัวกรอง{" "}
            {selectedStatuses.length > 0 && `(${selectedStatuses.length})`}
          </Button>
        </div>

        {showStatusFilter && <StatusFilterDropdown />}

        <Table //<DataType>
          // rowSelection={rowSelection}
          loading={isLoading}
          pagination={{
            total: getAllProjectData?.totalItems,
            current: currentPage,
            showSizeChanger: true,
            pageSizeOptions: ["10", "50", "100"],
            defaultPageSize: 10,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              setPerPage(pageSize);
              void refetch();
            },
          }}
          columns={
            [
              {
                title: "#",
                dataIndex: "id",
                key: "id",
                render: (_, r) => (
                  <div className="whitespace-nowrap">{r.id}</div>
                ),
              },
              {
                title: "ชื่อโครงการ",
                dataIndex: "name",
                key: "name",
                render: (_, r) => (
                  <div className="whitespace-nowrap">{r.name}</div>
                ),
              },
              // {
              //   title: "รายละเอียด",
              //   dataIndex: "e_description",
              //   key: "e_description",
              //   render: (_, r) => (
              //     <div className="whitespace-nowrap">{r.e_description}</div>
              //   ),
              // },
              {
                title: "สถานที่จัดโครงการ",
                dataIndex: "location",
                key: "location",
                render: (_, r) => (
                  <div className="whitespace-nowrap">{r.location}</div>
                ),
              },
              {
                title: "งบประมาณโครงการ",
                dataIndex: "project_budget",
                key: "project_budget",
                render: (_, r) => (
                  <div className="whitespace-nowrap">{r.project_budget}</div>
                ),
              },
              {
                title: "สถานะโครงการ",
                dataIndex: "project_status",
                key: "project_status",
                render: (_, r) => (
                  <Badge color={FindProjectStatus(r.project_status)?.color}>
                    <div className="whitespace-nowrap">
                      {FindProjectStatus(r.project_status)?.description}
                    </div>
                  </Badge>
                ),
              },
              {
                title: "ประเภทโครงการ",
                dataIndex: "e_available_qty",
                key: "e_available_qty",
                render: (_, r) => (
                  <div className="whitespace-nowrap">{r.project_type.name}</div>
                ),
              },
              {
                title: "วันที่เริ่มโครงการ",
                dataIndex: "date_start_the_project",
                key: "date_start_the_project",
                render: (_, r) => (
                  <div className="whitespace-nowrap">
                    {r.date_start_the_project?.toLocaleDateString("th-TH", {
                      ...DateTimeFormatOptions,
                      hour: undefined,
                      minute: undefined,
                    })}
                  </div>
                ),
              },
              {
                title: "วันสิ้นสุดโครงการ",
                dataIndex: "date_end_the_project",
                key: "date_end_the_project",
                render: (_, r) => (
                  <div className="whitespace-nowrap">
                    {r.date_end_the_project?.toLocaleDateString("th-TH", {
                      ...DateTimeFormatOptions,
                      hour: undefined,
                      minute: undefined,
                    })}
                  </div>
                ),
              },
              {
                title: "แก้ไขล่าสุดเมื่อ",
                dataIndex: "updatedAt",
                key: "updatedAt",
                render: (_, r) => (
                  <div className="whitespace-nowrap">
                    {r.updatedAt.toLocaleDateString(
                      "th-TH",
                      DateTimeFormatOptions,
                    )}
                  </div>
                ),
              },
              ...(status === "authenticated"
                ? [
                    {
                      title: "ดำเนินการ",
                      render: (_: any, r: ColumnType) => (
                        <Popover
                          width={200}
                          position="bottom"
                          withArrow
                          shadow="md"
                        >
                          <Popover.Target>
                            <Button size="sm" color="blue">
                              ดำเนินการ
                            </Button>
                          </Popover.Target>
                          <Popover.Dropdown>
                            <div className="flex flex-col gap-2">
                              {r.project_status === ProjectStatus.REJECT ||
                                (r.project_status ===
                                  ProjectStatus.CANCELED && (
                                  <>
                                    <Button
                                      variant="filled"
                                      leftSection={
                                        <IconReload
                                          size={"1rem"}
                                          stroke={1.5}
                                        />
                                      }
                                      color="blue"
                                      size="xs"
                                      onClick={() => onResentProject(r)}
                                    >
                                      เสนอโครงการอีกครั้ง
                                    </Button>
                                  </>
                                ))}
                              {r.project_status ===
                                ProjectStatus.IN_PROGRESS && (
                                <Button
                                  variant="filled"
                                  leftSection={
                                    <IconCheckbox size={"1rem"} stroke={1.5} />
                                  }
                                  color="green"
                                  size="xs"
                                  onClick={() => onCompletedProject(r)}
                                >
                                  โครงการเสร็จสิ้น
                                </Button>
                              )}
                              {r.project_status !== ProjectStatus.COMPLETED && (
                                <>
                                  {r.project_status !==
                                    ProjectStatus.CANCELED && (
                                    <Button
                                      variant="filled"
                                      leftSection={
                                        <IconX size={"1rem"} stroke={1.5} />
                                      }
                                      color="red"
                                      size="xs"
                                      onClick={() => onCancelProject(r)}
                                    >
                                      ยกเลิกโครงการ
                                    </Button>
                                  )}
                                  <Button
                                    variant="filled"
                                    leftSection={
                                      <IconEdit size={"1rem"} stroke={1.5} />
                                    }
                                    color="yellow"
                                    size="xs"
                                    onClick={() => {
                                      setEditingProjectId(r.id);
                                      setIsEditMode(true);
                                      open();
                                    }}
                                  >
                                    แก้ไข
                                  </Button>
                                  <Button
                                    variant="filled"
                                    leftSection={
                                      <IconTrash size={"1rem"} stroke={1.5} />
                                    }
                                    color="red"
                                    size="xs"
                                    onClick={() => onDelete(r)}
                                  >
                                    ลบ
                                  </Button>
                                </>
                              )}
                            </div>
                          </Popover.Dropdown>
                        </Popover>
                        // <Group align="center">
                        //   {}
                        //   <Button
                        //     variant="filled"
                        //     leftSection={
                        //       <IconEdit size={"1rem"} stroke={1.5} />
                        //     }
                        //     color="blue"
                        //     size="xs"
                        //     onClick={() => handleOnClickEdit(r.id)}
                        //   >
                        //     แก้ไข
                        //   </Button>
                        //   <Button
                        //     variant="filled"
                        //     leftSection={
                        //       <IconTrash size={"1rem"} stroke={1.5} />
                        //     }
                        //     color="red"
                        //     size="xs"
                        //     onClick={() => onDelete(r)}
                        //   >
                        //     ลบ
                        //   </Button>
                        // </Group>
                      ),
                    },
                  ]
                : []),
            ] as ColumnProps<ColumnType>[]
          }
          dataSource={getAllProjectData?.data}
          scroll={{ x: "max-content" }}
        />

        {/* <Table
    loading={applicantsApi.isLoading}
    dataSource={applicantsApi.data?.datas}
    pagination={{
      total: applicantsApi.data?.totalItems,
      current: applicantsApi.data?.currentPage,
      onChange: (page, pageSize) => {
        setCurrentPage(page);
        setPerPage(pageSize);
        refresh(page);
      },
    }}
    columns={
      [
        {
          title: "Name",
          dataIndex: "name",
          key: "name",
          render: (_, r) => (
            <div className="whitespace-nowrap">{r.fullName}</div>
          ),
        },
        {
          title: "Email",
          dataIndex: "email",
          key: "email",
        },
        {
          title: "University",
          dataIndex: "university",
          key: "university",
        },
        {
          title: "Status",
          dataIndex: "status",
          key: "status",
        },
        {
          title: "Faculty",
          dataIndex: "faculty",
          key: "faculty",
        },
        {
          title: "Department",
          dataIndex: "department",
          key: "department",
        },
        {
          title: "VIP",
          dataIndex: "isVIP",
          key: "isVIP",
          render: (_, r) =>
            r.isVIP ? (
              <Tag color="yellow">Yes</Tag>
            ) : (
              <Tag color="">No</Tag>
            ),
        },
        {
          title: "Scanned At",
          dataIndex: "scannedAt",
          key: "scannedAt",
          render: (_, r) => (
            <p className="whitespace-nowrap">{dayjs(r.scannedAt).format("DD/MM/YYYY HH:MM:ss")}</p>
          ),
        },
        {
          title: "Action",
          dataIndex: "action",
          key: "action",
          render: (_, r) => (
            <div className="flex gap-2">
              <Edit
                onEditFinish={() => refresh()}
                data={
                  r as {
                    topics: {
                      id: string;
                    }[];
                  } & Responses
                }
              />
            </div>
          ),
        },
      ] as ColumnsType<Responses>
    }
  /> */}
      </div>
    </>
  );
}

export default Index;
