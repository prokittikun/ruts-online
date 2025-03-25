import React, { useState } from "react";

import { ControlledInput } from "@/components/Controlled";
import ControlledSelect from "@/components/ControlledSelect";
import ItemStructure from "@/components/ItemStructure";
import {
  CreateAgencySchema,
  type ICreateAgency,
} from "@/schemas/agency/createAgency";
import {
  type IUpdateAgency,
  UpdateAgencySchema,
} from "@/schemas/agency/updateAgency";
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
function AgencyManagement() {
  const { data: session, status: sessionStatus } = useSession();
  const [opened, { open, close }] = useDisclosure(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAgencyId, setEditingAgencyId] = React.useState<string | null>(
    null,
  );
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const navigate = useRouter();
  const createAgencyApi = api.agency.createAgency.useMutation();
  const {
    data: getAllAgencyData,
    isLoading,
    refetch,
  } = api.agency.getAllAgencyPaginate.useQuery({
    currentPage: currentPage,
    perPages: perPage,
    keyword: searchValue,
  });

  const updateAgencyApi = api.agency.updateAgency.useMutation();
  const deleteAgencyApi = api.agency.deleteAgency.useMutation();
  const getAgencyByIdApi = api.agency.getAgencyById.useMutation();

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

  const combinedSchema = CreateAgencySchema.merge(UpdateAgencySchema.partial());

  type AgencyFormData = ICreateAgency & Partial<IUpdateAgency>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset,
  } = useForm<AgencyFormData>({
    resolver: zodResolver(combinedSchema),
  });

  const onSubmit = (data: AgencyFormData) => {
    try {
      const idToast = toast.loading(
        isEditMode ? "กำลังอัพเดตหน่วยงาน..." : "กำลังสร้างหน่วยงาน...",
      );

      if (isEditMode && editingAgencyId) {
        // Update operation
        const updateData: IUpdateAgency = {
          ...data,
          id: editingAgencyId, // Add the ID for update
        };

        updateAgencyApi.mutate(updateData, {
          onSuccess: () => {
            toast.success("อัพเดตหน่วยงานสำเร็จ", { id: idToast });
            close();
            reset();
            setIsEditMode(false);
            setEditingAgencyId(null);
            void refetch();
          },
          onError: (error) => {
            toast.error("อัพเดตหน่วยงานไม่สำเร็จ", {
              id: idToast,
              description: error.message,
            });
          },
        });
      } else {
        // Create operation
        const createData: ICreateAgency = data;

        createAgencyApi.mutate(createData, {
          onSuccess: () => {
            toast.success("สร้างหน่วยงานสำเร็จ", { id: idToast });
            close();
            reset();
            void refetch();
          },
          onError: (error) => {
            toast.error("สร้างหน่วยงานไม่สำเร็จ", {
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
    setEditingAgencyId(userId);
    getAgencyByIdApi.mutate(userId, {
      onSuccess: (data) => {
        if (data) {
          // Populate form with existing equipment data
          setValue("name", data.name ?? "");
          setValue("email", data.email);
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
            ยินยันที่จะลบหน่วยงาน <Badge color="blue">{userData.name}</Badge>{" "}
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
          const idToast = toast.loading("กำลังลบหน่วยงาน...");
          deleteAgencyApi.mutate(userData.id, {
            onSuccess: () => {
              toast.success("ลบหน่วยงานสำเร็จ", { id: idToast });
              void refetch();
            },
            onError: (error) => {
              toast.error("ลบหน่วยงานไม่สำเร็จ", {
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

  type ColumnType = NonNullable<typeof getAllAgencyData>["data"] extends
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
        title={isEditMode ? "แก้ไขหน่วยงาน" : "เพิ่มหน่วยงาน"}
      >
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          <ItemStructure required title="ชื่อ" mode="vertical">
            <ControlledInput
              // postfix="คน"
              required
              // type="string"
              // title="ชื่อครุภัณฑ์"
              placeholder="ระบุชื่อ-นามสกุล"
              name="name"
              control={control}
            />
          </ItemStructure>
          <ItemStructure required title="ที่อยู่อีเมล" required mode="vertical">
            <ControlledInput
              // postfix="คน"
              required
              // type="string"
              // title="ชื่อครุภัณฑ์"
              placeholder="ระบุที่อยู่อีเมล"
              name="email"
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
            />
          </ItemStructure>
          <ItemStructure required title="ที่อยู่" mode="vertical">
            <ControlledInput
              // postfix="คน"
              // type="string"
              // title="ชื่อครุภัณฑ์"
              placeholder="ระบุที่อยู่"
              name="address"
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
          <span className="text-2xl font-bold">หน่วยงานทั้งหมด</span>
          <Button
            size="md"
            color="blue"
            leftSection={<Plus />}
            onClick={() => {
              setEditingAgencyId(null);
              setIsEditMode(false);
              reset();
              open();
            }}
          >
            เพิ่มหน่วยงาน
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
            total: getAllAgencyData?.totalItems,
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
                title: "ชื่อหน่วยงาน",
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
                title: "ที่อยู่อีเมล",
                dataIndex: "email",
                key: "email",
                render: (_, r) => (
                  <div className="whitespace-nowrap">{r.email}</div>
                ),
              },
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
          dataSource={getAllAgencyData?.data}
          scroll={{ x: "max-content" }}
        />
      </div>
    </>
  );
}

export default AgencyManagement;
