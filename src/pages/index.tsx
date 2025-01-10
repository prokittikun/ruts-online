import { getSession, signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import {
  IconCalendarCheck,
  IconClock,
  IconHourglass,
} from "@tabler/icons-react";
import { api } from "@/utils/api";
import { useDisclosure } from "@mantine/hooks";
import { Button, CloseButton, Input, Modal } from "@mantine/core";
import { type SubmitHandler, useForm } from "react-hook-form";
import { type ISignIn, SignInSchema } from "@/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import ItemStructure from "@/components/ItemStructure";
import { AtSign, LockKeyhole, User } from "lucide-react";
import { toast } from "sonner";
import { getToken } from "next-auth/jwt";
import { GetServerSideProps } from "next";
import { env } from "@/env";
import { useRouter } from "next/navigation";
// export const getServerSideProps: GetServerSideProps = async (ctx) => {
//   const token = await getToken({
//     req: {
//       headers: ctx.req.headers as Record<string, string>,
//     },
//     secret: env.AUTH_SECRET,
//   });
//   if (token?.role) {
//     return {
//       redirect: {
//         permanent: false,
//         destination: `/${token.role}`,
//       },
//       props: {},
//     };
//   }
//   return {
//     redirect: {
//       permanent: false,
//       destination: `/`,
//     },
//     props: {},
//   };
// };

export default function Home() {
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ISignIn>({
    resolver: zodResolver(SignInSchema),
  });

  const onHandleLogin: SubmitHandler<ISignIn> = async (data) => {
    const { email, password } = data;

    const response = await signIn("credentials", {
      email,
      password,
      redirect: false, // ใช้ redirect ด้วยมือ
    });

    if (response && !response.error) {
      const idToast = toast.loading("กำลังนำท่านเข้าสู่ระบบ...");
      try {
        console.log("seesionn");

        const session = await getSession();
        const userRole = session?.user?.role;

        switch (userRole) {
          case "ADMIN":
            router.push("/ADMIN");
            break;
          case "PERSONNEL":
            router.push("/PERSONNEL");
            break;
          default:
            router.push("/");
        }
      } catch (error) {
        console.log("error", error);

        toast.error("เข้าสู่ระบบไม่สำเร็จ", {
          description: "กรุณาลองใหม่อีกครั้ง",
        });
      } finally {
        toast.success("เข้าสู่ระบบสำเร็จ", { id: idToast });
      }
    } else {
      // จัดการ error
      console.log("response", response);

      toast.error("เข้าสู่ระบบไม่สำเร็จ", {
        description: "กรุณาลองใหม่อีกครั้ง",
      });
    }
  };
  return (
    <>
      <Modal opened={opened} onClose={close} title="เข้าสู่ระบบ">
        <form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit(onHandleLogin)}
        >
          <Input.Wrapper error={errors.email?.message}>
            <Input
              placeholder="กรุณาระบุที่อยู่อีเมล"
              {...register("email")}
              rightSection={
                watch("email") ? (
                  <CloseButton
                    aria-label="Clear input"
                    onClick={() => setValue("email", "")}
                  />
                ) : null
              }
              rightSectionPointerEvents="all"
              mt="md"
              size="md"
              type="email"
              leftSection={<AtSign size={16} />}
            />
          </Input.Wrapper>
          <Input.Wrapper error={errors.password?.message}>
            <Input
              placeholder="กรุณาระบุรหัสผ่าน"
              type="password"
              rightSectionPointerEvents="all"
              mt="md"
              size="md"
              leftSection={<LockKeyhole size={16} />}
              {...register("password")}
              rightSection={
                watch("password") ? (
                  <CloseButton
                    aria-label="Clear input"
                    onClick={() => setValue("password", "")}
                  />
                ) : null
              }
            />
          </Input.Wrapper>
          <Button variant="gradient" className="text-white" type="submit">
            เข้าสู่ระบบ
          </Button>
        </form>
      </Modal>
      <div className="flex h-16 w-full items-center justify-between bg-[#081c5c] px-[20rem]">
        {/* <div className="text-3xl font-bold text-white">RUTS</div> */}
        <img src="/logo.jpg" width={100} alt="" />

        <Button variant="outline" className="text-white" onClick={open}>
          เข้าสู่ระบบ
        </Button>
      </div>
      <div className="my-10 flex flex-col items-center justify-center gap-16">
        <img src="/banner.png" width={"450px"} alt="" />
        <div className="flex h-28 w-full items-center justify-between px-[25rem]">
          <Button
            variant="filled"
            onClick={() => {
              router.push("/PERSONNEL?status=IN_PROGRESS");
            }}
            color="#081c5c"
            leftSection={<IconClock stroke={2} />}
            style={{ width: "200px", height: "60px" }}
          >
            โครงการที่
            <br />
            กำลังดำเนินการ
          </Button>
          <Button
            variant="filled"
            onClick={() => {
              router.push("/PERSONNEL?status=COMPLETED");
            }}
            color="#081c5c"
            leftSection={<IconCalendarCheck stroke={2} />}
            style={{ width: "200px", height: "60px" }}
          >
            โครงการที่
            <br />
            เสร็จสิ้นแล้ว
          </Button>
          <Button
            variant="filled"
            onClick={() => {
              router.push("/PERSONNEL?status=PENDING");
            }}
            color="#081c5c"
            leftSection={<IconHourglass stroke={2} />}
            style={{ width: "200px", height: "60px" }}
          >
            โครงการที่
            <br />
            รออนุมัติ
          </Button>
        </div>
      </div>
    </>
  );
}
