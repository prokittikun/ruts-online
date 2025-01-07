import {
  IconLogout,
  IconLogin2,
  IconBriefcase,
  IconFileDescription,
  IconBox,
  IconPackage,
  IconHome,
} from "@tabler/icons-react";
import classes from "./AdminMenu.module.css";
import clsx from "clsx";
import { Button, useMantineColorScheme } from "@mantine/core";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

const prefix = "/ADMIN";

const data = [
  { link: "/announce", label: "หน้าหลัก", icon: IconHome },
  { link: "/equipment", label: "รายการครุภัณฑ์", icon: IconPackage },
  {
    link: "/equipment-history",
    label: "ประวัติการยืม",
    icon: IconFileDescription,
  },
];

export function AdminMenu() {
  const pathname = usePathname();
  const navigate = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const isCurrentPath = (link: string) => {
    return pathname === link;
  };

  const links = data.map((item, index) => {
    const variant = isCurrentPath(prefix + item.link) ? "gradient" : "subtle";

    return (
      <Button
        onClick={() => navigate.push(prefix + item.link)}
        justify="start"
        variant={isCurrentPath(prefix + item.link) ? "gradient" : "subtle"}
        gradient={{ from: "orange", to: "yellow", deg: 90 }}
        leftSection={<item.icon stroke={1.5} />}
        fullWidth
        key={index}
        style={{ color: "inherit" }}
        // className="dark"
      >
        {item.label}
      </Button>
    );
  });

  return (
    <nav>
      <div className={clsx("flex flex-col gap-2")}>
        {links}
        {sessionStatus == "authenticated" ? (
          <Button
            type="submit"
            justify="start"
            variant={"subtle"}
            color="red"
            fullWidth
            leftSection={<IconLogout stroke={1.5} />}
            onClick={() => signOut()}
          >
            ออกจากระบบ
          </Button>
        ) : (
          <Button
            onClick={() => navigate.push("/")}
            justify="start"
            variant={"subtle"}
            fullWidth
            leftSection={<IconLogin2 stroke={1.5} />}
          >
            เข้าสู่ระบบ
          </Button>
        )}
      </div>
    </nav>
  );
}
