import { redirect } from "next/navigation";
import { getUserSession } from "@/server/api/trpc";

export default async function HomePage() {
  const session = await getUserSession();

  if (session?.userId) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
