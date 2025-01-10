import {
  ActionIcon,
  AppShell,
  Avatar,
  Burger,
  Button,
  Group,
  Image,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { AdminMenu } from "@/components/Menu/AdminMenu/AdminMenu";
import classes from "@/styles/utils.module.css";
import cx from "clsx";
import { PersonnelMenu } from "@/components/Menu/PersonnelMenu/PersonnelMenu";
import { signOut, useSession } from "next-auth/react";
import { Dropdown } from "antd";
import { FindRole } from "@/utils/positionMap";
import { LogOutIcon } from "lucide-react";
export default function PersonnelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  useEffect(() => {
    if (mobileOpened) {
      toggleMobile();
    }
  }, [pathname]);

  return (
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
            <Button onClick={()=>{
              router.push("/");
            }} color="blue" >ลงชื่อเข้าใช้</Button>
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
        <PersonnelMenu />
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
