import React, { useState } from "react";

import { ControlledInput } from "@/components/Controlled";
import ControlledSelect from "@/components/ControlledSelect";
import ItemStructure from "@/components/ItemStructure";
import { CreateUserSchema, ICreateUser } from "@/schemas/users/createUser";
import { IUpdateUser, UpdateUserSchema } from "@/schemas/users/updateUser";
import { DateTimeFormatOptions } from "@/utils/DateTimeFormatOptions";
import { api } from "@/utils/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge, Button, Input, Modal, Popover } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { Role } from "@prisma/client";
import { IconEdit, IconSearch, IconTrash } from "@tabler/icons-react";
import { Table } from "antd";
import { type ColumnProps } from "antd/es/table";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { FindRole } from "@/utils/positionMap";
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
function UserManagement() {
  const { data: session, status: sessionStatus } = useSession();
  const [opened, { open, close }] = useDisclosure(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = React.useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const navigate = useRouter();
  const createUserApi = api.user.createUser.useMutation();
  const {
    data: getAllUserData,
    isLoading,
    refetch,
  } = api.user.getAllUser.useQuery({
    currentPage: currentPage,
    perPages: perPage,
    keyword: searchValue,
  });

  const updateUserApi = api.user.updateUser.useMutation();
  const deleteUserApi = api.user.deleteUser.useMutation();
  const getUserByIdApi = api.user.getUserById.useMutation();

  const combinedSchema = CreateUserSchema.merge(UpdateUserSchema.partial());

  type UserFormData = ICreateUser & Partial<IUpdateUser>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(combinedSchema),
  });

  const onSubmit = (data: UserFormData) => {
    try {
      console.log(data);

      const idToast = toast.loading(
        isEditMode ? "กำลังอัพเดตบัญชีผู้ใช้..." : "กำลังสร้างบัญชีผู้ใช้...",
      );

      if (isEditMode && editingUserId) {
        // Update operation
        const updateData: IUpdateUser = {
          ...data,
          id: editingUserId, // Add the ID for update
        };

        updateUserApi.mutate(updateData, {
          onSuccess: () => {
            toast.success("อัพเดตบัญชีผู้ใช้สำเร็จ", { id: idToast });
            close();
            reset();
            setIsEditMode(false);
            setEditingUserId(null);
            void refetch();
          },
          onError: (error) => {
            toast.error("อัพเดตบัญชีผู้ใช้ไม่สำเร็จ", {
              id: idToast,
              description: error.message,
            });
          },
        });
      } else {
        // Create operation
        const createData: ICreateUser = data;

        createUserApi.mutate(createData, {
          onSuccess: () => {
            toast.success("สร้างบัญชีผู้ใช้สำเร็จ", { id: idToast });
            close();
            reset();
            void refetch();
          },
          onError: (error) => {
            toast.error("สร้างบัญชีผู้ใช้ไม่สำเร็จ", {
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
    setEditingUserId(userId);
    getUserByIdApi.mutate(userId, {
      onSuccess: (data) => {
        if (data) {
          // Populate form with existing equipment data
          setValue("firstName", data.first_name ?? "");
          setValue("lastName", data.last_name ?? "");
          setValue("email", data.email);
          setValue("password", data.password);
          setValue("tel", data.tel ?? "");
          setValue("role", data.role);
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
            ยินยันที่จะลบบัญชีผู้ใช้{" "}
            <Badge color="blue">
              {userData.first_name} {userData.last_name}
            </Badge>{" "}
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
          const idToast = toast.loading("กำลังลบบัญชีผู้ใช้...");
          deleteUserApi.mutate(userData.id, {
            onSuccess: () => {
              toast.success("ลบบัญชีผู้ใช้สำเร็จ", { id: idToast });
              void refetch();
            },
            onError: (error) => {
              toast.error("ลบบัญชีผู้ใช้ไม่สำเร็จ", {
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

  type ColumnType = NonNullable<typeof getAllUserData>["data"] extends
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
        title={isEditMode ? "แก้ไขบัญชีผู้ใช้" : "เพิ่มบัญชีผู้ใช้"}
      >
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          <ItemStructure title="ชื่อ" mode="vertical">
            <ControlledInput
              // postfix="คน"
              required
              // type="string"
              // title="ชื่อครุภัณฑ์"
              placeholder="ระบุชื่อ"
              name="firstName"
              control={control}
            />
          </ItemStructure>
          <ItemStructure title="นามสกุล" mode="vertical">
            <ControlledInput
              // postfix="คน"
              // type="string"
              // title="ชื่อครุภัณฑ์"
              placeholder="ระบุนามสกุล"
              name="lastName"
              control={control}
            />
          </ItemStructure>
          <ItemStructure title="ที่อยู่อีเมล" required mode="vertical">
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
          <ItemStructure title="รหัสผ่าน" required mode="vertical">
            <ControlledInput
              // postfix="คน"
              required
              // type="string"
              // title="ชื่อครุภัณฑ์"
              placeholder="ระบุรหัสผ่าน"
              name="password"
              control={control}
            />
          </ItemStructure>
          <ItemStructure title="เบอร์ติดต่อ" mode="vertical">
            <ControlledInput
              // postfix="คน"
              // type="string"
              // title="ชื่อครุภัณฑ์"
              placeholder="ระบุเบอร์ติดต่อ"
              name="tel"
              control={control}
            />
          </ItemStructure>
          <ItemStructure title="ตำแหน่ง" required mode="vertical">
            <ControlledSelect
              required
              className="w-full"
              placeholder="เลือกตำแหน่ง"
              option={[
                {
                  label: "ผู้ดูแลระบบ",
                  value: "ADMIN",
                },
                {
                  label: "บุคลากร",
                  value: "PERSONNEL",
                },
              ]}
              // checkIconPosition="right"
              // searchable
              control={control}
              name="role"
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
          <Button color="blue" leftSection={<Plus />} type="submit">
            บันทึก
          </Button>
        </form>
      </Modal>
      <div className="flex flex-col gap-5">
        <div className="flex w-full items-center justify-between">
          <span className="text-2xl font-bold">ผู้ใช้งานทั้งหมด</span>
          <Button
            size="md"
            color="blue"
            leftSection={<Plus />}
            onClick={() => {
              setEditingUserId(null);
              setIsEditMode(false);
              reset();
              open();
            }}
          >
            เพิ่มผู้ใช้งาน
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
            total: getAllUserData?.totalItems,
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
                title: "ชื่อ",
                dataIndex: "name",
                key: "name",
                render: (_, r) => (
                  <div className="whitespace-nowrap">{r.first_name}</div>
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
                title: "นามสกุล",
                dataIndex: "lastName",
                key: "lastName",
                render: (_, r) => (
                  <div className="whitespace-nowrap">{r.last_name}</div>
                ),
              },
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
                title: "ตำแหน่ง",
                dataIndex: "role",
                key: "role",
                render: (_, r) => (
                  <Badge color={r.role === Role.ADMIN ? "red" : "blue"}>
                    <div className="whitespace-nowrap">
                      {FindRole(r.role ?? "NonePosition")?.description}
                    </div>
                  </Badge>
                ),
              },
              {
                title: "วันที่สร้าง",
                dataIndex: "createdAt",
                key: "createdAt",
                render: (_, r) => (
                  <div className="whitespace-nowrap">
                    {r.createdAt?.toLocaleDateString("th-TH", {
                      ...DateTimeFormatOptions,
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
          dataSource={getAllUserData?.data}
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

export default UserManagement;
