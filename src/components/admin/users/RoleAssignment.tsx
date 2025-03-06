import { useState } from "react";
import { Card, Button } from "~/components/ui";
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem 
} from "~/components/ui/forms/select";
import { api } from "~/utils/api";
import type { Role, Campus } from "~/types/api";

type RoleAssignmentProps = {
  userId: string;
};

type UserRole = {
  id: string;
  role: Role;
  campus: Campus;
};

export const RoleAssignment = ({ userId }: RoleAssignmentProps) => {
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("");

  const { data: roles } = api.role.list.useQuery();
  const { data: campuses } = api.campus.list.useQuery({});
  const { data: userRoles } = api.user.getRoles.useQuery({ userId });

  const assignRoleMutation = api.user.assignRole.useMutation({
    onSuccess: () => {
      // Handle success
    }
  });

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Select
            value={selectedRole}
            onValueChange={setSelectedRole}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles?.map((role: Role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedCampus}
            onValueChange={setSelectedCampus}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select campus" />
            </SelectTrigger>
            <SelectContent>
              {campuses?.items?.map((campus: Campus) => (
                <SelectItem key={campus.id} value={campus.id}>
                  {campus.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedRole && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Permissions</h4>
            <div className="space-y-2">
              {roles?.find(r => r.id === selectedRole)?.permissions.map(permission => (
                <div key={permission.id} className="text-sm">
                  {permission.name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={() => assignRoleMutation.mutate({
              userId,
              roleId: selectedRole,
              campusId: selectedCampus
            })}
          >
            Assign Role
          </Button>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Current Roles</h3>
          <div className="space-y-2">
            {userRoles?.map(userRole => (
              <div key={userRole.id} className="flex justify-between items-center p-4 border rounded">
                <div>
                  <p className="font-medium">{userRole.role.name}</p>
                  <p className="text-sm text-gray-500">{userRole.campus.name}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {/* Handle remove */}}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}; 