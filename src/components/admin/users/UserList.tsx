import { DataTable } from "@/components/ui";
import { Button } from "@/components/ui";
import { Card } from "@/components/ui";
import { UserFilters } from "./UserFilters";
import { api } from "@/utils/api";
import { Badge } from "@/components/ui";
import { toast } from "@/components/ui/feedback/toast";
import { useState } from "react";
import { SystemStatus, User } from "@prisma/client";

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

export const UserList = ({ onEdit }: UserListProps) => {
  const [filters, setFilters] = useState<UserFiltersState>({
    search: "",
    role: "",
    status: "",
    campus: "",
    dateRange: { from: null, to: null }
  });

  const { data, isLoading } = api.user.list.useQuery({
    ...filters,
    take: 100,
    status: filters.status as SystemStatus | undefined
  });

  const utils = api.useContext();

  const updateStatusMutation = api.user.updateStatus.useMutation({
    onSuccess: () => {
      utils.user.list.invalidate();
      toast({
        title: "Success",
        description: "User status updated successfully",
      });
    },
  });

  const bulkActionMutation = api.user.bulkAction.useMutation({
    onSuccess: () => {
      utils.user.list.invalidate();
      toast({
        title: "Success",
        description: "Bulk action completed successfully",
      });
    },
  });

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
            onClick={() => updateStatusMutation.mutate({
              id: row.original.id,
              status: row.original.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
            })}
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
          data={data?.items || []}
          isLoading={isLoading}
          selectionOptions={{
            enabled: true,
            onBulkAction: (selectedIds: string[], action: string) => {
              bulkActionMutation.mutate({
                ids: selectedIds,
                action
              });
            }
          }}
        />
      </div>
    </Card>
  );
};