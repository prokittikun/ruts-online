import React, { useState } from "react";

import { ControlledInput } from "@/components/Controlled";
import ControlledSelect from "@/components/ControlledSelect";
import ItemStructure from "@/components/ItemStructure";
import {
  CreateIndicatorSchema,
  type ICreateIndicator,
} from "@/schemas/indicator/createIndicator";
import {
  type IUpdateIndicator,
  UpdateIndicatorSchema,
} from "@/schemas/indicator/updateIndicator";
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
function IndicatorManagement() {
  const { data: session, status: sessionStatus } = useSession();
  const [opened, { open, close }] = useDisclosure(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingIndicatorId, setEditingIndicatorId] = React.useState<
    string | null
  >(null);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const navigate = useRouter();
  const createIndicatorApi = api.indicator.createIndicator.useMutation();
  const {
    data: getAllIndicatorData,
    isLoading,
    refetch,
  } = api.indicator.getAllIndicatorPaginate.useQuery({
    currentPage: currentPage,
    perPages: perPage,
    keyword: searchValue,
  });

  const updateIndicatorApi = api.indicator.updateIndicator.useMutation();
  const deleteIndicatorApi = api.indicator.deleteIndicator.useMutation();
  const getIndicatorByIdApi = api.indicator.getIndicatorById.useMutation();

  const combinedSchema = CreateIndicatorSchema.merge(
    UpdateIndicatorSchema.partial(),
  );

  type IndicatorFormData = ICreateIndicator & Partial<IUpdateIndicator>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset,
  } = useForm<IndicatorFormData>({
    resolver: zodResolver(combinedSchema),
  });

  const onSubmit = (data: IndicatorFormData) => {
    try {
      const idToast = toast.loading(
        isEditMode ? "กำลังอัพเดตข้อมูลตัวชี้วัด..." : "กำลังสร้างข้อมูลตัวชี้วัด...",
      );

      if (isEditMode && editingIndicatorId) {
        // Update operation
        const updateData: IUpdateIndicator = {
          ...data,
          id: editingIndicatorId, // Add the ID for update
        };

        updateIndicatorApi.mutate(updateData, {
          onSuccess: () => {
            toast.success("อัพเดตข้อมูลตัวชี้วัดสำเร็จ", { id: idToast });
            close();
            reset();
            setIsEditMode(false);
            setEditingIndicatorId(null);
            void refetch();
          },
          onError: (error) => {
            toast.error("อัพเดตข้อมูลตัวชี้วัดไม่สำเร็จ", {
              id: idToast,
              description: error.message,
            });
          },
        });
      } else {
        // Create operation
        const createData: ICreateIndicator = data;

        createIndicatorApi.mutate(createData, {
          onSuccess: () => {
            toast.success("สร้างข้อมูลตัวชี้วัดสำเร็จ", { id: idToast });
            close();
            reset();
            void refetch();
          },
          onError: (error) => {
            toast.error("สร้างข้อมูลตัวชี้วัดไม่สำเร็จ", {
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
    setEditingIndicatorId(userId);
    getIndicatorByIdApi.mutate(userId, {
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
            ยินยันที่จะลบข้อมูลตัวชี้วัด <Badge color="blue">{userData.name}</Badge>{" "}
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
          const idToast = toast.loading("กำลังลบข้อมูลตัวชี้วัด...");
          deleteIndicatorApi.mutate(userData.id, {
            onSuccess: () => {
              toast.success("ลบข้อมูลตัวชี้วัดสำเร็จ", { id: idToast });
              void refetch();
            },
            onError: (error) => {
              toast.error("ลบข้อมูลตัวชี้วัดไม่สำเร็จ", {
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

  type ColumnType = NonNullable<typeof getAllIndicatorData>["data"] extends
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
        title={isEditMode ? "แก้ไขข้อมูลตัวชี้วัด" : "เพิ่มข้อมูลตัวชี้วัด"}
      >
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          <ItemStructure required title="ชื่อตัวชี้วัด" mode="vertical">
            <ControlledInput
              // postfix="คน"
              required
              // type="string"
              // title="ชื่อครุภัณฑ์"
              placeholder="ระบุชื่อตัวชี้วัด"
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
          <span className="text-2xl font-bold">ข้อมูลตัวชี้วัดทั้งหมด</span>
          <Button
            size="md"
            color="blue"
            leftSection={<Plus />}
            onClick={() => {
              setEditingIndicatorId(null);
              setIsEditMode(false);
              reset();
              open();
            }}
          >
            เพิ่มข้อมูลตัวชี้วัด
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
            total: getAllIndicatorData?.totalItems,
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
                title: "ชื่อตัวชี้วัด",
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
          dataSource={getAllIndicatorData?.data}
          scroll={{ x: "max-content" }}
        />
      </div>
    </>
  );
}

export default IndicatorManagement;
