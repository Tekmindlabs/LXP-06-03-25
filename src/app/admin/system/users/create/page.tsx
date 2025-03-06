"use client";

import { PageHeader } from "~/components/ui/atoms/page-header";
import { Button } from "~/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { UserForm } from "@/components/admin/users/UserForm";
import { Card } from "~/components/ui/atoms/card";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui";

export default function CreateUserPage() {
  const router = useRouter();
  const createUser = api.user.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
      });
      router.push("/admin/system/users");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: any) => {
    await createUser.mutate(data);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/system/users">
            <Button variant="outline" size="icon">
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
          </Link>
          <PageHeader
            title="Create User"
            description="Add a new user to the system"
          />
        </div>
      </div>
      
      <Card className="p-6">
        <UserForm 
          onSubmit={handleSubmit}
          isLoading={createUser.isLoading}
        />
      </Card>
    </div>
  );
}
