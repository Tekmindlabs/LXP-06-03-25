import { useState } from "react";
import { Card, Button } from "~/components/ui";
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem 
} from "~/components/ui/forms/select";

// Define the types locally
interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

interface Permission {
  id: string;
  name: string;
  code: string;
}

interface Campus {
  id: string;
  name: string;
  code: string;
}

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

  // Mock data for roles
  const roles: Role[] = [
    {
      id: "role-1",
      name: "Administrator",
      permissions: [
        { id: "perm-1", name: "Create User", code: "USER_CREATE" },
        { id: "perm-2", name: "Edit User", code: "USER_EDIT" },
        { id: "perm-3", name: "Delete User", code: "USER_DELETE" }
      ]
    },
    {
      id: "role-2",
      name: "Teacher",
      permissions: [
        { id: "perm-4", name: "View Classes", code: "CLASS_VIEW" },
        { id: "perm-5", name: "Grade Students", code: "STUDENT_GRADE" }
      ]
    }
  ];

  // Mock data for campuses
  const campuses = {
    items: [
      { id: "campus-1", name: "Main Campus", code: "MAIN" },
      { id: "campus-2", name: "Downtown Campus", code: "DOWNTOWN" }
    ]
  };

  // Mock data for user roles
  const userRoles: UserRole[] = [
    {
      id: "user-role-1",
      role: roles[0],
      campus: campuses.items[0]
    }
  ];

  // Mock mutation
  const assignRoleMutation = {
    mutate: (data: { userId: string; roleId: string; campusId: string }) => {
      console.log("Assigning role:", data);
    }
  };

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
              {roles.map((role: Role) => (
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
              {campuses.items.map((campus: Campus) => (
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
              {roles.find((r: Role) => r.id === selectedRole)?.permissions.map((permission: Permission) => (
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
            {userRoles.map((userRole: UserRole) => (
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