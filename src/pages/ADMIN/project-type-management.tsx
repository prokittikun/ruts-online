import React, { useState } from "react";

import { ControlledInput } from "@/components/Controlled";
import ControlledSelect from "@/components/ControlledSelect";
import ItemStructure from "@/components/ItemStructure";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge, Button, Input, Modal, Popover } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconEdit, IconSearch, IconTrash } from "@tabler/icons-react";
import { Table } from "antd";
import { type ColumnProps } from "antd/es/table";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useDebounceCallback } from "usehooks-ts";
import { IUpdateProjectType, UpdateProjectTypeSchema } from "@/schemas/projects/updateProject";
import { createProjectTypeSchema, ICreateProjectType } from "@/schemas/projects/createProject";
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
function ProjectTypeManagement() {
  const { data: session, status: sessionStatus } = useSession();
  const [opened, { open, close }] = useDisclosure(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProjectTypeId, setEditingProjectTypeId] = React.useState<
    string | null
  >(null);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const navigate = useRouter();
  const createProjectTypeApi = api.project.createProjectType.useMutation();
  const {
    data: getAllProjectTypeData,
    isLoading,
    refetch,
  } = api.project.getAllProjectTypePaginate.useQuery({
    currentPage: currentPage,
    perPages: perPage,
    keyword: searchValue,
  });

  const updateProjectTypeApi = api.project.updateProjectType.useMutation();
  const deleteProjectTypeApi = api.project.deleteProjectType.useMutation();
  const getProjectTypeByIdApi = api.project.getProjectTypeById.useMutation();

  const combinedSchema = createProjectTypeSchema.merge(
    UpdateProjectTypeSchema.partial(),
  );

  type ProjectTypeFormData = ICreateProjectType & Partial<IUpdateProjectType>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset,
  } = useForm<ProjectTypeFormData>({
    resolver: zodResolver(combinedSchema),
  });

  const onSubmit = (data: ProjectTypeFormData) => {
    try {
      const idToast = toast.loading(
        isEditMode ? "กำลังอัพเดตประเภทโครงการ..." : "กำลังสร้างประเภทโครงการ...",
      );

      if (isEditMode && editingProjectTypeId) {
        // Update operation
        const updateData: IUpdateProjectType = {
          ...data,
          id: editingProjectTypeId, // Add the ID for update
        };

        updateProjectTypeApi.mutate(updateData, {
          onSuccess: () => {
            toast.success("อัพเดตประเภทโครงการสำเร็จ", { id: idToast });
            close();
            reset();
            setIsEditMode(false);
            setEditingProjectTypeId(null);
            void refetch();
          },
          onError: (error) => {
            toast.error("อัพเดตประเภทโครงการไม่สำเร็จ", {
              id: idToast,
              description: error.message,
            });
          },
        });
      } else {
        // Create operation
        const createData: ICreateProjectType = data;

        createProjectTypeApi.mutate(createData, {
          onSuccess: () => {
            toast.success("สร้างประเภทโครงการสำเร็จ", { id: idToast });
            close();
            reset();
            void refetch();
          },
          onError: (error) => {
            toast.error("สร้างประเภทโครงการไม่สำเร็จ", {
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

  const handleOnClickEdit = (userId: string) => {
    setIsEditMode(true);
    setEditingProjectTypeId(userId);
    getProjectTypeByIdApi.mutate(userId, {
      onSuccess: (data) => {
        if (data) {
          // Populate form with existing equipment data
          setValue("name", data.name ?? "");
          open(); // Open drawer
        }
      },
    });
  };

  const onDelete = (userData: ColumnType) => {
    try {
      modals.openConfirmModal({
        title: (
          <span>
            ยินยันที่จะลบประเภทโครงการ <Badge color="blue">{userData.name}</Badge>{" "}
            ใช่หรือไม่ ?
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
          const idToast = toast.loading("กำลังลบประเภทโครงการ...");
          deleteProjectTypeApi.mutate(userData.id, {
            onSuccess: () => {
              toast.success("ลบประเภทโครงการสำเร็จ", { id: idToast });
              void refetch();
            },
            onError: (error) => {
              toast.error("ลบประเภทโครงการไม่สำเร็จ", {
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

  type ColumnType = NonNullable<typeof getAllProjectTypeData>["data"] extends
    | (infer T)[]
    | null
    | undefined
    ? T
    : never;
  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        size={"70%"}
        title={isEditMode ? "แก้ไขประเภทโครงการ" : "เพิ่มประเภทโครงการ"}
      >
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          <ItemStructure title="ชื่อประเภทโครงการ" mode="vertical" required>
            <ControlledInput
              // postfix="คน"
              required
              // type="string"
              // title="ชื่อครุภัณฑ์"
              placeholder="ระบุชื่อประเภทโครงการ"
              name="name"
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
          <span className="text-2xl font-bold">ประเภทโครงการทั้งหมด</span>
          <Button
            size="md"
            color="blue"
            leftSection={<Plus />}
            onClick={() => {
              setEditingProjectTypeId(null);
              setIsEditMode(false);
              reset();
              open();
            }}
          >
            เพิ่มประเภทโครงการ
          </Button>
        </div>
        <Input
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ค้นหา"
          leftSection={<IconSearch stroke={1.5} />}
        />

        <Table //<DataType>
          // rowSelection={rowSelection}
          loading={isLoading}
          pagination={{
            total: getAllProjectTypeData?.totalItems,
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
                title: "ประเภทโครงการ",
                dataIndex: "name",
                key: "name",
                width: "90%",
                render: (_, r) => (
                  <div className="whitespace-nowrap">{r.name}</div>
                ),
              },
              {
                title: "ดำเนินการ",
                render: (_, r) => (
                  <Popover width={200} position="bottom" withArrow shadow="md">
                    <Popover.Target>
                      <Button size="sm" color="blue">
                        ดำเนินการ
                      </Button>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="filled"
                          leftSection={<IconEdit size={"1rem"} stroke={1.5} />}
                          color="yellow"
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
                          disabled={r.id === session?.user.id}
                        >
                          ลบ
                        </Button>
                      </div>
                    </Popover.Dropdown>
                  </Popover>
                  // <Group align="center">

                  // </Group>
                ),
              },
            ] as ColumnProps<ColumnType>[]
          }
          dataSource={getAllProjectTypeData?.data}
          scroll={{ x: "max-content" }}
        />
      </div>
    </>
  );
}

export default ProjectTypeManagement;
