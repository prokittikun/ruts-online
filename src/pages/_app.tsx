import { GeistSans } from "geist/font/sans";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";

import { api } from "@/utils/api";

import {
  createTheme as createMantineTheme,
  MantineProvider,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Toaster } from "sonner";
import { ConfigProvider, theme as antdTheme } from "antd";

import "@/styles/globals.css";
import "@mantine/carousel/styles.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import AdminLayout from "@/layouts/AdminLayout";
import { useRouter } from "next/router";
import PersonnelLayout from "@/layouts/PersonnelLayout";

const themeMantine = createMantineTheme({
  colors: {
    primary: [
      "#a2d9ff",
      "#a2d9ff",
      "#a2d9ff",
      "#a2d9ff",
      "#a2d9ff",
      "#a2d9ff",
      "#a2d9ff",
      "#a2d9ff",
      "#a2d9ff",
      "#a2d9ff",
    ],
    secondary: [
      "#B2BB1C",
      "#B2BB1C",
      "#B2BB1C",
      "#B2BB1C",
      "#B2BB1C",
      "#B2BB1C",
      "#B2BB1C",
      "#B2BB1C",
      "#B2BB1C",
      "#B2BB1C",
    ],
    green: [
      "#14fd7e",
      "#14fd7e",
      "#14fd7e",
      "#14fd7e",
      "#14fd7e",
      "#14fd7e",
      "#14fd7e",
      "#14fd7e",
      "#14fd7e",
      "#14fd7e",
    ],
    // dark: [
    //   "#252425",
    //   "#252425",
    //   "#252425",
    //   "#252425",
    //   "#252425",
    //   "#252425",
    //   "#252425",
    //   "#252425",
    //   "#252425",
    //   "#252425",
    // ],
  },
  primaryColor: "primary",
  fontFamily: "Noto Sans Thai",
});

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const { asPath, pathname, back } = useRouter();
  const exceptGlobal = ["/login", "/404", "/error"];
  const RenderLayout = (path: string, children: JSX.Element) => {
    const mapLayout = [
      {
        startSlug: "/PERSONNEL",
        except: [...exceptGlobal],
        layout: (children: JSX.Element) => {
          return <PersonnelLayout>{children}</PersonnelLayout>;
        },
      },
      {
        startSlug: "/ADMIN",
        except: [...exceptGlobal],
        layout: (children: JSX.Element) => {
          return <AdminLayout>{children}</AdminLayout>;
        },
      },
      {
        startSlug: "/",
        except: [...exceptGlobal],
        layout: (children: JSX.Element) => {
          return <>{children}</>;
        },
      },
    ];

    for (const layout of mapLayout) {
      if (path.startsWith(layout.startSlug)) {
        let isRenderNull = false;

        if (layout.except) {
          for (const except of layout.except) {
            if (path.startsWith(except)) {
              isRenderNull = true;
              return <>{children}</>;
            }
          }
        }
        if (!isRenderNull) {
          return layout.layout(children);
        }

        return <>{children}</>;
      }
    }
  };

  return (
    <MantineProvider theme={themeMantine} defaultColorScheme="light">
      <ModalsProvider>
        <Toaster position="top-right" expand={true} richColors />
        <ConfigProvider>
          <SessionProvider session={session}>
            {RenderLayout(pathname, <Component {...pageProps} />)}
          </SessionProvider>
        </ConfigProvider>
      </ModalsProvider>
    </MantineProvider>
  );
};

export default api.withTRPC(MyApp);
