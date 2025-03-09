import { DataTable } from "@/components/ui";
import { Button } from "@/components/ui";
import { Card } from "@/components/ui";
import { UserFilters } from "./UserFilters";
import { Badge } from "@/components/ui";
import { toast } from "@/components/ui/feedback/toast";
import { useState } from "react";
import { SystemStatus } from "@prisma/client";

type UserListProps = {
  onEdit?: (id: string) => void;
};

interface UserFiltersState {
  search: string;
  role: string;
  status: SystemStatus | string;
  campus: string;
  dateRange: { from: null; to: null };
}

interface UserRow {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  status: SystemStatus;
  campus: { name: string } | null;
}

// Mock user data
const mockUsers: UserRow[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "Administrator",
    status: "ACTIVE" as SystemStatus,
    campus: { name: "Main Campus" }
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Teacher",
    status: "ACTIVE" as SystemStatus,
    campus: { name: "Downtown Campus" }
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "Student",
    status: "INACTIVE" as SystemStatus,
    campus: { name: "Main Campus" }
  }
];

export const UserList = ({ onEdit }: UserListProps) => {
  const [filters, setFilters] = useState<UserFiltersState>({
    search: "",
    role: "",
    status: "",
    campus: "",
    dateRange: { from: null, to: null }
  });

  const [users, setUsers] = useState<UserRow[]>(mockUsers);
  const isLoading = false;

  // Filter users based on filters
  const filteredUsers = users.filter(user => {
    if (filters.search && !user.name?.toLowerCase().includes(filters.search.toLowerCase()) && 
        !user.email?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.role && user.role !== filters.role) {
      return false;
    }
    if (filters.status && user.status !== filters.status) {
      return false;
    }
    if (filters.campus && user.campus?.name !== filters.campus) {
      return false;
    }
    return true;
  });

  // Mock update status mutation
  const updateStatus = (id: string, newStatus: SystemStatus) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, status: newStatus } : user
    ));
    toast({
      title: "Success",
      description: "User status updated successfully",
    });
  };

  // Mock bulk action mutation
  const bulkAction = (ids: string[], action: string) => {
    if (action === 'activate') {
      setUsers(users.map(user => 
        ids.includes(user.id) ? { ...user, status: "ACTIVE" as SystemStatus } : user
      ));
    } else if (action === 'deactivate') {
      setUsers(users.map(user => 
        ids.includes(user.id) ? { ...user, status: "INACTIVE" as SystemStatus } : user
      ));
    }
    toast({
      title: "Success",
      description: "Bulk action completed successfully",
    });
  };

  const columns = [
    { header: "Name", accessorKey: "name" },
    { header: "Email", accessorKey: "email" },
    {
      header: "Role",
      cell: ({ row }: { row: { original: UserRow } }) => (
        <Badge variant="outline">{row.original.role}</Badge>
      )
    },
    {
      header: "Status",
      cell: ({ row }: { row: { original: UserRow } }) => (
        <Badge 
          variant={row.original.status === "ACTIVE" ? "success" : "warning"}
        >
          {row.original.status}
        </Badge>
      )
    },
    {
      header: "Campus",
      accessorKey: "campus.name"
    },
    {
      header: "Actions",
      cell: ({ row }: { row: { original: UserRow } }) => (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit?.(row.original.id)}
          >
            Edit
          </Button>
          <Button 
            variant={row.original.status === "ACTIVE" ? "destructive" : "default"}
            size="sm"
            onClick={() => updateStatus(
              row.original.id,
              row.original.status === "ACTIVE" ? "INACTIVE" as SystemStatus : "ACTIVE" as SystemStatus
            )}
          >
            {row.original.status === "ACTIVE" ? "Deactivate" : "Activate"}
          </Button>
        </div>
      )
    }
  ];

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <UserFilters 
          onFiltersChange={(newFilters) => {
            setFilters(prev => ({ ...prev, ...newFilters }));
          }}
        />
        <DataTable 
          columns={columns}
          data={filteredUsers}
          isLoading={isLoading}
        />
      </div>
    </Card>
  );
};