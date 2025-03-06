"use client";

import { useRouter } from "next/navigation";
import { UserList } from "~/components/admin/users/UserList";
import { Button } from "~/components/ui";
import { PageHeader } from "~/components/ui/atoms/page-header";

export default function UsersPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="User Management"
          description="Manage system users and their roles"
        />
        <Button onClick={() => router.push("/admin/system/users/create")}>
          Create New User
        </Button>
      </div>
      <UserList onEdit={(id) => router.push(`/admin/system/users/${id}/edit`)} />
    </div>
  );
} 