"use client";

import { useParams } from "next/navigation";
import { UserProfile } from "@/components/admin/users/UserProfile";
import { PageHeader } from "@/components/ui/page-header";
import { api } from "@/trpc/react";
import { LoadingSpinner } from "@/components/ui/loading";

export default function UserDetailPage() {
  const params = useParams();
  const userId = params?.id as string;
  const { data, isLoading } = api.user.getById.useQuery(userId);

  if (isLoading) return <LoadingSpinner />;
  if (!data?.user) return <div>User not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.user.name || "User Profile"}
        description={`Manage user profile and permissions`}
      />
      <UserProfile userId={userId} />
    </div>
  );
} 