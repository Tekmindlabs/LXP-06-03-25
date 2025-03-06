import { useState } from "react";
import { Card, DataTable, DatePicker, FilterPanel } from "~/components/ui";
import { api } from "~/utils/api";
import type { AuditLog } from "~/types/api";

export const AuditLog = () => {
  const [filters, setFilters] = useState({
    userId: "",
    roleId: "",
    dateRange: {
      from: null as Date | null,
      to: null as Date | null
    }
  });

  const { data, isLoading } = api.permission.getAuditLog.useQuery(filters);

  const columns = [
    { header: "Action", accessorKey: "action" },
    { header: "User", accessorKey: "user.name" },
    { header: "Role", accessorKey: "role.name" },
    { 
      header: "Timestamp", 
      accessorKey: "timestamp",
      cell: ({ row }: { row: { original: AuditLog } }) => 
        new Date(row.original.timestamp).toLocaleString()
    },
    { header: "Details", accessorKey: "details" }
  ];

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <FilterPanel>
          <div className="grid grid-cols-4 gap-4">
            <DatePicker
              selected={filters.dateRange.from}
              onChange={date => setFilters({
                ...filters,
                dateRange: { ...filters.dateRange, from: date }
              })}
              placeholderText="From date"
            />
            <DatePicker
              selected={filters.dateRange.to}
              onChange={date => setFilters({
                ...filters,
                dateRange: { ...filters.dateRange, to: date }
              })}
              placeholderText="To date"
            />
          </div>
        </FilterPanel>

        <DataTable
          columns={columns}
          data={data?.items || []}
          isLoading={isLoading}
        />
      </div>
    </Card>
  );
}; 