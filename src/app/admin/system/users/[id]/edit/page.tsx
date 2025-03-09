'use client';

import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/ui/atoms/page-header';
import { UserForm } from '@/components/admin/users/UserForm';
import { api } from '@/trpc/react';
import { LoadingSpinner } from '@/components/ui/loading';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/feedback/toast';
import { useRouter } from 'next/navigation';

// Map user types to the expected role values
const mapUserTypeToRole = (userType: string): "USER" | "ADMIN" | "MANAGER" => {
  if (userType.includes("ADMIN") || userType === "SYSTEM_ADMIN") {
    return "ADMIN";
  } else if (userType.includes("MANAGER") || userType === "SYSTEM_MANAGER") {
    return "MANAGER";
  } else {
    return "USER";
  }
};

export default function EditUserPage() {
  const params = useParams() || {};
  const userId = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const { data: user, isLoading } = api.user.getById.useQuery({ id: userId }, {
    enabled: !!userId,
  });
  
  const updateUser = api.user.update.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'User updated successfully',
        variant: 'success',
      });
      router.push(`/admin/system/users/${userId}`);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        variant: 'error',
      });
    },
  });
  
  const handleSubmit = async (data: any) => {
    updateUser.mutate({
      id: userId,
      ...data,
    });
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <PageHeader
          title="Edit User"
          description="User not found"
        />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Edit User"
        description={`Edit user information for ${user.name || 'User'}`}
      />
      
      <Card className="p-6">
        <UserForm
          initialData={{
            firstName: user.name?.split(' ')[0] || '',
            lastName: user.name?.split(' ')[1] || '',
            email: user.email || '',
            role: mapUserTypeToRole(user.userType || ''),
          }}
          onSubmit={handleSubmit}
          isLoading={updateUser.isLoading}
        />
      </Card>
    </div>
  );
} 