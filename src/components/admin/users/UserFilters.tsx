import { useState } from "react";
import { SystemStatus } from '@prisma/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';

interface UserFiltersProps {
  onFiltersChange: (filters: {
    status?: SystemStatus;
    role?: string;
    search?: string;
  }) => void;
}

export function UserFilters({ onFiltersChange }: UserFiltersProps) {
  return (
    <div className="flex gap-4">
      <Select onValueChange={(value: SystemStatus) => onFiltersChange({ status: value })}>
        <SelectTrigger>
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={SystemStatus.ACTIVE}>Active</SelectItem>
          <SelectItem value={SystemStatus.INACTIVE}>Inactive</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={(value: string) => onFiltersChange({ role: value })}>
        <SelectTrigger>
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ADMIN">Admin</SelectItem>
          <SelectItem value="USER">User</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 
