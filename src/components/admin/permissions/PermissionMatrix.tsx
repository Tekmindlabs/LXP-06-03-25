import { useState } from "react";
import { Card, DataTable, Checkbox } from "@/components/ui";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/forms/select";
import { api } from "@/utils/api";
import { SystemStatus } from "@prisma/client";

interface Permission {
  id: string;
  name: string;
  scope: string;
  code: string;
  status: SystemStatus;
}

interface Role {
  id: string;
  name: string;
}

interface UserPermission {
  permissionId: string;
  userId: string;
}

export const PermissionMatrix = () => {
  const [selectedUser, setSelectedUser] = useState("");
  
  // Get users instead of roles
  const { data: users } = api.user.list.useQuery({
    status: SystemStatus.ACTIVE
  });
  
  // Get permissions with standard parameters
  const { data: permissions } = api.permission.list.useQuery({
    status: SystemStatus.ACTIVE
  });
  
  // Get user permissions if a user is selected
  const { data: userPermissions } = api.user.permissions.useQuery(
    { userId: selectedUser },
    { enabled: !!selectedUser }
  );

  const updatePermissionMutation = api.permission.assign.useMutation();

  // Map permissions with assigned status
  const permissionsWithAssignedStatus = permissions?.items.map(permission => {
    const isAssigned = userPermissions?.some(
      (up: UserPermission) => up.permissionId === permission.id
    );
    return {
      ...permission,
      assigned: !!isAssigned
    };
  }) || [];

  const columns = [
    { header: "Permission", accessorKey: "name" },
    {
      header: "Scope",
      accessorKey: "scope"
    },
    {
      header: "Assigned",
      cell: ({ row }: { row: { original: Permission & { assigned: boolean } } }) => (
        <Checkbox
          checked={row.original.assigned}
          onChange={(e) => {
            updatePermissionMutation.mutate({
              permissionId: row.original.id,
              userId: selectedUser
            });
          }}
        />
      )
    }
  ];

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Permission Matrix</h3>
          <Select
            value={selectedUser}
            onValueChange={setSelectedUser}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              {users?.items.map((user: any) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name || user.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={permissionsWithAssignedStatus}
          isLoading={!permissions}
        />
      </div>
    </Card>
  );
};