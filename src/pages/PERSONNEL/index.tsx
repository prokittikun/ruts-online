import React, { useState } from "react";

import { type GetServerSideProps } from "next";
import { Badge, Button, Group, Input, Modal, Select } from "@mantine/core";
import { IconEdit, IconSearch, IconTrash } from "@tabler/icons-react";
import { Table } from "antd";
import { FilePlus2, Plus } from "lucide-react";
import { type ColumnProps } from "antd/es/table";
import { useDisclosure } from "@mantine/hooks";
import ItemStructure from "@/components/ItemStructure";
import { ControlledInput } from "@/components/Controlled";
import { Path, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DateTimeFormatOptions } from "@/utils/DateTimeFormatOptions";
import {
  CreateProjectSchema,
  type ICreateProject,
} from "@/schemas/projects/createProject";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import ControlledInputNumber from "@/components/ControlledInputNumber";
import ControlledDatePicker from "@/components/ControlledDatePicker";
import { toast } from "sonner";
import ControlledSelect from "@/components/ControlledSelect";
import {
  IUpdateProject,
  UpdateProjectSchema,
} from "@/schemas/projects/updateProject";
import { modals } from "@mantine/modals";
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
  const [opened, { open, close }] = useDisclosure(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProjectId, setEditingProjectId] = React.useState<string | null>(
    null,
  );
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const navigate = useRouter();
  const createProjectApi = api.project.createProject.useMutation();
  const {
    data: getAllProjectData,
    isLoading,
    refetch,
  } = api.project.getAllProject.useQuery({
    currentPage: currentPage,
    perPages: perPage,
    keyword: searchValue,
  });

  const getProjectTypeApi = api.project.getProjectType.useQuery(undefined, {
    enabled: !!opened,
  });
  const projectTypeOptions = getProjectTypeApi.data?.map((type) => ({
    label: type.name,
    value: type.id,
  }));
  const updateProjectApi = api.project.updateProject.useMutation();
  const deleteProjectApi = api.project.deleteProject.useMutation();
  const getProjectByIdApi = api.project.getProjectById.useMutation();
  const combinedSchema = CreateProjectSchema.merge(
    UpdateProjectSchema.partial(),
  );

  type ProjectFormData = ICreateProject & Partial<IUpdateProject>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(combinedSchema),
  });

  const onSubmit = (data: ProjectFormData) => {
    try {
      console.log(data);

      const idToast = toast.loading(
        isEditMode ? "กำลังอัพเดตโครงการ..." : "กำลังสร้างโครงการ...",
      );

      if (isEditMode && editingProjectId) {
        // Update operation
        const updateData: IUpdateProject = {
          ...data,
          id: editingProjectId, // Add the ID for update
        };

        updateProjectApi.mutate(updateData, {
          onSuccess: () => {
            toast.success("อัพเดตโครงการสำเร็จ", { id: idToast });
            close();
            reset();
            setIsEditMode(false);
            setEditingProjectId(null);
            void refetch();
          },
          onError: (error) => {
            toast.error("อัพเดตโครงการไม่สำเร็จ", {
              id: idToast,
              description: error.message,
            });
          },
        });
      } else {
        // Create operation
        const createData: ICreateProject = data;

        createProjectApi.mutate(createData, {
          onSuccess: () => {
            toast.success("สร้างโครงการสำเร็จ", { id: idToast });
            close();
            reset();
            void refetch();
          },
          onError: (error) => {
            toast.error("สร้างโครงการไม่สำเร็จ", {
              id: idToast,
              description: error.message,
            });
          },
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error("เกิดข้อผิดพลาด", { description: error.message });
      }
    }
  };

  const handleOnClickEdit = (projectId: string) => {
    setIsEditMode(true);
    setEditingProjectId(projectId);
    //init form from getProjectByIdApi useQuery
    getProjectByIdApi.mutate(projectId, {
      onSuccess: (data) => {
        if (data) {
          // Populate form with existing equipment data
          setValue("name", data.name);
          setValue("detail", data.detail);
          setValue("location", data.location ?? "");
          setValue("project_budget", data.project_budget);
          setValue("typeId", data.project_type.id);
          setValue("date_start_the_project", data.date_start_the_project!);
          setValue("date_end_the_project", data.date_end_the_project!);
          open(); // Open drawer
        }
      },
    });
  };

  const onDelete = (projectData: ColumnType) => {
    try {
      modals.openConfirmModal({
        title: (
          <span>
            ยินยันที่จะโครงการ{" "}
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
          deleteProjectApi.mutate(
            projectData.id,
            {
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
            },
          );
        },
      });
    } catch (error) {}
  };
  
  type ColumnType = NonNullable<typeof getAllProjectData>["data"] extends
    | (infer T)[]
    | null
    | undefined
    ? T
    : never;
  return (
    <>
      <Modal opened={opened} onClose={close} size={"70%"} title="เพิ่มโครงการ">
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          <ItemStructure title="ชื่อโครงการ" required mode="vertical">
            <ControlledInput
              // postfix="คน"
              required
              // type="string"
              // title="ชื่อครุภัณฑ์"
              placeholder="ระบุชื่อโครงการ"
              name="name"
              control={control}
            />
          </ItemStructure>
          <ItemStructure title="รายละเอียดโครงการ" required mode="vertical">
            <ControlledInput
              // postfix="คน"
              required
              // type="string"
              // title="ชื่อครุภัณฑ์"
              placeholder="ระบุรายละเอียดของโครงการ"
              name="detail"
              control={control}
            />
          </ItemStructure>
          <ItemStructure title="สถานที่จัดโครงการ" required mode="vertical">
            <ControlledInput
              // postfix="คน"
              required
              // type="string"
              // title="ชื่อครุภัณฑ์"
              placeholder="ระบุสถานที่จัดโครงการ"
              name="location"
              control={control}
            />
          </ItemStructure>
          <ItemStructure title="งบประมาณโครงการ" required mode="vertical">
            <ControlledInputNumber
              // postfix="คน"
              required
              // type="string"
              // title="ชื่อครุภัณฑ์"
              placeholder="ระบุงบประมาณโครงการที่ต้องการ"
              name="project_budget"
              control={control}
            />
          </ItemStructure>
          <ItemStructure title="ประเภทโครงการ" required mode="vertical">
            {/* <Select
              placeholder="เลือกประเภทโครงการ"
              data={projectTypeOptions}
            /> */}
            <ControlledSelect
              className="w-full"
              placeholder="เลือกประเภทโครงการ"
              option={projectTypeOptions}
              // checkIconPosition="right"
              // searchable
              control={control}
              name="typeId"
            />
            {/* <ControlledInputNumber
              // postfix="คน"
              required
              // type="string"
              // title="ชื่อครุภัณฑ์"
              placeholder="เลือกประเภทโครงการ"
              name="typeId"
              control={control}
            /> */}
          </ItemStructure>
          <ItemStructure
            title="วันเดือนปีที่เริ่มโครงการ"
            required
            mode="vertical"
          >
            <ControlledDatePicker
              placeholder="กรุณาเลือกวันเดือนปีที่เริ่มโครงการ"
              name="date_start_the_project"
              control={control}
            />
          </ItemStructure>
          <ItemStructure
            title="วันเดือนปีที่สิ้นสุดโครงการ"
            required
            mode="vertical"
          >
            <ControlledDatePicker
              placeholder="กรุณาเลือกวันเดือนปีที่สิ้นสุดโครงการ"
              name="date_end_the_project"
              control={control}
            />
          </ItemStructure>
          <Button color="blue" leftSection={<Plus />} type="submit">
            บันทึก
          </Button>
        </form>
      </Modal>
      <div className="flex flex-col gap-5">
        <div className="flex w-full items-center justify-between">
          <span className="text-2xl font-bold">โครงการทั้งหมด</span>
          <div className="flex gap-2">
            <Button
              size="md"
              color="blue"
              leftSection={<FilePlus2 />}
              onClick={() => {
                // setEditingEquipmentId(null);
                // setIsEditMode(false);
                // reset();
                // open();
                navigate.push("/PERSONNEL/approve-docx");
              }}
            >
              สร้างแบบเสนอขออนุมัติโครงการ
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
                navigate.push("/PERSONNEL/support-budget-docx");
              }}
            >
              สร้างแบบเสนอขอเงินสนับสนุนโครงการ
            </Button>
            <Button
              size="md"
              color="blue"
              leftSection={<Plus />}
              onClick={() => {
                setEditingProjectId(null);
                setIsEditMode(false);
                reset();
                open();
              }}
            >
              เพิ่มโครงการ
            </Button>
          </div>
        </div>
        <Input
          // onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ค้นหา"
          leftSection={<IconSearch stroke={1.5} />}
        />

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
                  <div className="whitespace-nowrap">{r.project_status}</div>
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
              {
                title: "ดำเนินการ",
                render: (_, r) => (
                  <Group align="center">
                    <Button
                      variant="filled"
                      leftSection={<IconEdit size={"1rem"} stroke={1.5} />}
                      color="blue"
                      size="xs"
                      onClick={() => handleOnClickEdit(r.id)}
                    >
                      แก้ไข
                    </Button>
                    <Button
                      variant="filled"
                      leftSection={<IconTrash size={"1rem"} stroke={1.5} />}
                      color="red"
                      size="xs"
                      onClick={() => onDelete(r)}
                    >
                      ลบ
                    </Button>
                  </Group>
                ),
              },
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
