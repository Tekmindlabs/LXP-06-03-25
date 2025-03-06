import { useState } from "react";
import { DataTable, Card, Badge, Button } from "~/components/ui";
import { PermissionFilters } from "./PermissionFilters";
import { api } from "~/utils/api";
import type { Permission } from "~/types/api";
import { SystemStatus, AccessScope } from "@prisma/client";

export const PermissionList = () => {
  const [filters, setFilters] = useState({
    scope: "",
    type: "",
    status: "" as SystemStatus | ""
  });

  const { data, isLoading } = api.permission.list.useQuery({
    scope: filters.scope as AccessScope | undefined,
    entityType: filters.type || undefined,
    status: filters.status || undefined
  });

  const columns = [
    { header: "Name", accessorKey: "name" },
    {
      header: "Scope",
      cell: ({ row }: { row: { original: Permission } }) => (
        <Badge variant="outline">{row.original.scope}</Badge>
      )
    },
    {
      header: "Type",
      cell: ({ row }: { row: { original: Permission } }) => (
        <Badge>{row.original.type}</Badge>
      )
    },
    {
      header: "Status",
      cell: ({ row }: { row: { original: Permission } }) => (
        <Badge 
          variant={row.original.status === SystemStatus.ACTIVE ? "success" : "warning"}
        >
          {row.original.status}
        </Badge>
      )
    },
    {
      header: "Actions",
      cell: ({ row }: { row: { original: Permission } }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Edit
          </Button>
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <PermissionFilters
          filters={filters}
          onChange={setFilters}
        />
        <DataTable
          columns={columns}
          data={data?.items || []}
          isLoading={isLoading}
        />
      </div>
    </Card>
  );
}; 