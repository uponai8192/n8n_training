import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/Navbar";
import { InvitesClient } from "./InvitesClient";

export default async function InvitesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const invites = await prisma.invite.findMany({
    orderBy: { createdAt: "desc" },
  });

  const invitesData = invites.map((i) => ({
    id: i.id,
    email: i.email,
    role: i.role,
    token: i.token,
    used: i.used,
    createdAt: i.createdAt.toISOString(),
    expiresAt: i.expiresAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <InvitesClient invites={invitesData} />
    </div>
  );
}
