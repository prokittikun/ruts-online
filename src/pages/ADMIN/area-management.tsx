import React, { useState } from "react";

import { ControlledInput } from "@/components/Controlled";
import ControlledSelect from "@/components/ControlledSelect";
import ItemStructure from "@/components/ItemStructure";
import {
  CreateAreaSchema,
  type ICreateArea,
} from "@/schemas/area/createArea";
import {
  type IUpdateArea,
  UpdateAreaSchema,
} from "@/schemas/area/updateArea";
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
function AreaManagement() {
  const { data: session, status: sessionStatus } = useSession();
  const [opened, { open, close }] = useDisclosure(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAreaId, setEditingAreaId] = React.useState<string | null>(
    null,
  );
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const navigate = useRouter();
  const createAreaApi = api.area.createArea.useMutation();
  const {
    data: getAllAreaData,
    isLoading,
    refetch,
  } = api.area.getAllAreaPaginate.useQuery({
    currentPage: currentPage,
    perPages: perPage,
    keyword: searchValue,
  });

  const updateAreaApi = api.area.updateArea.useMutation();
  const deleteAreaApi = api.area.deleteArea.useMutation();
  const getAreaByIdApi = api.area.getAreaById.useMutation();

  const getAllDepartmentApi = api.department.getAllDepartment.useQuery(
    undefined,
    {
      enabled: !!opened,
    },
  );

  const departmentOptions = getAllDepartmentApi.data?.map((department) => ({
    label: department.name,
    value: department.id,
  }));

  const combinedSchema = CreateAreaSchema.merge(UpdateAreaSchema.partial());

  type AreaFormData = ICreateArea & Partial<IUpdateArea>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset,
  } = useForm<AreaFormData>({
    resolver: zodResolver(combinedSchema),
  });

  const onSubmit = (data: AreaFormData) => {
    try {
      const idToast = toast.loading(
        isEditMode ? "กำลังอัพเดตพื้นที่ดำเนินการ..." : "กำลังสร้างพื้นที่ดำเนินการ...",
      );

      if (isEditMode && editingAreaId) {
        // Update operation
        const updateData: IUpdateArea = {
          ...data,
          id: editingAreaId, // Add the ID for update
        };

        updateAreaApi.mutate(updateData, {
          onSuccess: () => {
            toast.success("อัพเดตพื้นที่ดำเนินการสำเร็จ", { id: idToast });
            close();
            reset();
            setIsEditMode(false);
            setEditingAreaId(null);
            void refetch();
          },
          onError: (error) => {
            toast.error("อัพเดตพื้นที่ดำเนินการไม่สำเร็จ", {
              id: idToast,
              description: error.message,
            });
          },
        });
      } else {
        // Create operation
        const createData: ICreateArea = data;

        createAreaApi.mutate(createData, {
          onSuccess: () => {
            toast.success("สร้างพื้นที่ดำเนินการสำเร็จ", { id: idToast });
            close();
            reset();
            void refetch();
          },
          onError: (error) => {
            toast.error("สร้างพื้นที่ดำเนินการไม่สำเร็จ", {
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
    setEditingAreaId(userId);
    getAreaByIdApi.mutate(userId, {
      onSuccess: (data) => {
        if (data) {
          // Populate form with existing equipment data
          setValue("name", data.name ?? "");
          setValue("tel", data.tel ?? "");
          setValue("address", data.address ?? "");
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
            ยินยันที่จะลบพื้นที่ดำเนินการ <Badge color="blue">{userData.name}</Badge>{" "}
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
          const idToast = toast.loading("กำลังลบพื้นที่ดำเนินการ...");
          deleteAreaApi.mutate(userData.id, {
            onSuccess: () => {
              toast.success("ลบพื้นที่ดำเนินการสำเร็จ", { id: idToast });
              void refetch();
            },
            onError: (error) => {
              toast.error("ลบพื้นที่ดำเนินการไม่สำเร็จ", {
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

  type ColumnType = NonNullable<typeof getAllAreaData>["data"] extends
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
        title={isEditMode ? "แก้ไขพื้นที่ดำเนินการ" : "เพิ่มพื้นที่ดำเนินการ"}
      >
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          <ItemStructure  required title="ชื่อ" mode="vertical">
            <ControlledInput
              // postfix="คน"
              required
              // type="string"
              // title="ชื่อครุภัณฑ์"
              placeholder="ระบุชื่อพื้นที่ดำเนินการ"
              name="name"
              control={control}
            />
          </ItemStructure>
          <ItemStructure required title="เบอร์ติดต่อ" mode="vertical">
            <ControlledInput
              // postfix="คน"
              // type="string"
              // title="ชื่อครุภัณฑ์"
              placeholder="ระบุเบอร์ติดต่อ"
              name="tel"
              control={control}
              required
            />
          </ItemStructure>
          <ItemStructure required title="ที่อยู่" mode="vertical">
            <ControlledInput
              // postfix="คน"
              // type="string"
              // title="ชื่อครุภัณฑ์"
              placeholder="ระบุที่อยู่"
              name="address"
              required
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
          <span className="text-2xl font-bold">พื้นที่ดำเนินการทั้งหมด</span>
          <Button
            size="md"
            color="blue"
            leftSection={<Plus />}
            onClick={() => {
              setEditingAreaId(null);
              setIsEditMode(false);
              reset();
              open();
            }}
          >
            เพิ่มพื้นที่ดำเนินการ
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
            total: getAllAreaData?.totalItems,
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
                title: "ชื่อพื้นที่ดำเนินการ",
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
                title: "เบอร์ติดต่อ",
                dataIndex: "tel",
                key: "tel",
                render: (_, r) => (
                  <div className="whitespace-nowrap">{r.tel}</div>
                ),
              },
              {
                title: "ที่อยู่",
                dataIndex: "address",
                key: "address",
                render: (_, r) => (
                  <div className="whitespace-nowrap">{r.address}</div>
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
          dataSource={getAllAreaData?.data}
          scroll={{ x: "max-content" }}
        />
      </div>
    </>
  );
}

export default AreaManagement;
