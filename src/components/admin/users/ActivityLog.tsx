import { useState } from "react";
import { Card, DataTable, DatePicker } from "~/components/ui";
import { api } from "~/utils/api";

type ActivityLogProps = {
  userId: string;
};

export const ActivityLog = ({ userId }: ActivityLogProps) => {
  const [dateRange, setDateRange] = useState({
    from: null as Date | null,
    to: null as Date | null
  });

  const { data, isLoading } = api.user.getActivity.useQuery({
    userId,
    dateRange
  });

  const columns = [
    { header: "Action", accessorKey: "action" },
    { header: "Details", accessorKey: "details" },
    { 
      header: "Timestamp", 
      accessorKey: "timestamp",
      cell: ({ row }: { row: { original: { timestamp: Date } } }) => 
        new Date(row.original.timestamp).toLocaleString()
    },
    { header: "IP Address", accessorKey: "ipAddress" }
  ];

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex gap-4">
          <DatePicker
            selected={dateRange.from}
            onChange={date => setDateRange({ ...dateRange, from: date })}
            placeholderText="From date"
          />
          <DatePicker
            selected={dateRange.to}
            onChange={date => setDateRange({ ...dateRange, to: date })}
            placeholderText="To date"
          />
        </div>

        <DataTable
          columns={columns}
          data={data || []}
          isLoading={isLoading}
        />
      </div>
    </Card>
  );
}; 