"use client";

import { useParams } from "next/navigation";
import { UserProfile } from "~/components/admin/users/UserProfile";
import { PageHeader } from "~/components/ui/atoms/page-header";
import { api } from "~/utils/api";

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const { data: user, isLoading } = api.user.getById.useQuery({ id: userId });

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.name}
        description={`Manage user profile and permissions`}
      />
      <UserProfile userId={userId} />
    </div>
  );
} 