import { ControlledInput } from "@/components/Controlled";
import ItemStructure from "@/components/ItemStructure";
import { AdminMenu } from "@/components/Menu/AdminMenu/AdminMenu";
import { IUpdateUser, UpdateUserSchema } from "@/schemas/users/updateUser";
import { api } from "@/utils/api";
import { FindRole } from "@/utils/positionMap";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AppShell,
  Avatar,
  Burger,
  Button,
  Group,
  Modal,
  useComputedColorScheme,
  useMantineColorScheme
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Dropdown } from "antd";
import { LogOutIcon, Plus, UserIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { setColorScheme } = useMantineColorScheme({
    keepTransitions: true,
  });
  const computerColorSchema = useComputedColorScheme();
  const toggleColorSchema = () => {
    setColorScheme(computerColorSchema === "dark" ? "light" : "dark");
  };
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const updateUserApi = api.user.updateUser.useMutation();
  const getUserByIdApi = api.user.getUserById.useMutation();
  
  useEffect(() => {
    if (mobileOpened) {
      toggleMobile();
    }
  }, [pathname]);


  type FormUpdateUser = Omit<IUpdateUser, 'id'>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset,
  } = useForm<FormUpdateUser>({
    resolver: zodResolver(UpdateUserSchema.omit({ id: true })),
  });

  const onSubmit = (data: FormUpdateUser) => {
    try {
      const idToast = toast.loading("กำลังอัพเดตบัญชีผู้ใช้...");

      // Update operation
      const updateData: IUpdateUser = {
        ...data,
        id: session?.user.id!, // Add the ID for update
      };

      updateUserApi.mutate(updateData, {
        onSuccess: () => {
          toast.success("อัพเดตบัญชีผู้ใช้สำเร็จ", { id: idToast });
          close();
          reset();
        },
        onError: (error) => {
          toast.error("อัพเดตบัญชีผู้ใช้ไม่สำเร็จ", {
            id: idToast,
            description: error.message,
          });
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error("เกิดข้อผิดพลาด", { description: error.message });
      }
    }
  };

  const handleOnClickEdit = (userId: string) => {
    getUserByIdApi.mutate(userId, {
      onSuccess: (data) => {
        if (data) {
          // Populate form with existing equipment data
          setValue("firstName", data.first_name ?? "");
          setValue("lastName", data.last_name ?? "");
          setValue("password", data.password);
          setValue("tel", data.tel ?? "");
          open(); // Open drawer
        }
      },
    });
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        size={"70%"}
        title={"แก้ไขบัญชีผู้ใช้"}
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
          <ItemStructure title="รหัสผ่าน" mode="vertical">
            <ControlledInput
              // postfix="คน"
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
          <Button color="blue" leftSection={<Plus />} type="submit">
            บันทึก
          </Button>
        </form>
      </Modal>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
        }}
        padding="md"
      >
        <AppShell.Header className="flex items-center justify-between gap-2 px-3">
          <Group h="100%" px="md" w="100%">
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
            />
            <Burger
              opened={desktopOpened}
              onClick={toggleDesktop}
              visibleFrom="sm"
              size="sm"
            />
            <Link href={"/"}>
              {/* <div className="text-xl font-bold ">RUTS Online</div> */}
              <img src="/logo.jpg" width={100} alt="" />
            </Link>
          </Group>
          {status === "authenticated" ? (
            <Dropdown
              menu={{
                items: [
                  // ...(getOrganizationByUserIdApi?.data?.orgnameth
                  //   ? [
                  //       {
                  //         key: "1",
                  //         label: (
                  //           <div className="max-w-48 text-black text-wrap">
                  //             {getOrganizationByUserIdApi.data?.orgnameth}
                  //           </div>
                  //         ),
                  //         danger: false,
                  //         disabled: true,
                  //       },
                  //     ]
                  //   : []),
                  {
                    key: "1",
                    icon: <UserIcon />,
                    label: <div onClick={() => handleOnClickEdit(session.user.id)}>แก้ไขบัญชีผู้ใช้</div>,
                  },
                  {
                    key: "2",
                    icon: <LogOutIcon />,
                    label: (
                      <div
                        onClick={() =>
                          signOut({
                            callbackUrl: "/",
                          })
                        }
                      >
                        ออกจากระบบ
                      </div>
                    ),
                    danger: true,
                  },
                ],
              }}
            >
              <a
                onClick={(e) => e.preventDefault()}
                className="flex cursor-pointer items-center gap-2"
              >
                <Avatar className="">
                  {!session.user.firstName || !session.user.lastName
                    ? "N/A"
                    : session.user.firstName
                        .charAt(0)
                        .concat(session.user.lastName.charAt(0))}
                </Avatar>
                <div className="flex flex-col text-xs">
                  <div className="text-nowrap">{session.user.name}</div>
                  <div className="text-nowrap">
                    {FindRole(session.user.role ?? "NonePosition")?.description}
                  </div>
                </div>
              </a>
            </Dropdown>
          ) : (
            <div className="flex gap-2">
              {/* <ButtonSD to="/sign-in" color="secondary"> */}
              <Button
                onClick={() => {
                  router.push("/");
                }}
                color="blue"
              >
                ลงชื่อเข้าใช้
              </Button>
              {/* </ButtonSD> */}
            </div>
          )}
          {/* {colorScheme === "dark" ? (
          <ActionIcon variant="subtle" onClick={() => setColorScheme("light")}>
          <IconSun size={18} />
          </ActionIcon>
          ) : (
            <ActionIcon variant="subtle" onClick={() => setColorScheme("dark")}>
            <IconMoon size={18} />
            </ActionIcon>
          )} */}
        </AppShell.Header>
        <AppShell.Navbar p="sm">
          <AdminMenu />
        </AppShell.Navbar>
        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
    </>
  );
}
