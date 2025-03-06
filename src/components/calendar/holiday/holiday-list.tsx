'use client';

import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarAction, hasCalendarPermission } from '@/lib/permissions/calendar-permissions';
import { UserType } from '@prisma/client';
import { Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { HolidayForm } from './holiday-form';
import { api } from '@/trpc/react';
import { useToast } from '@/components/ui/feedback/toast';

interface Holiday {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  type: string;
  affectsAll: boolean;
  campuses: Array<{ id: string; name: string }>;
}

interface HolidayListProps {
  holidays: Holiday[];
  userType: UserType;
  campuses: Array<{ id: string; name: string }>;
  onEdit: (holiday: Holiday) => void;
  onDelete: (holidayId: string) => void;
}

const holidayTypeColors = {
  NATIONAL: 'bg-blue-100 text-blue-800',
  RELIGIOUS: 'bg-purple-100 text-purple-800',
  INSTITUTIONAL: 'bg-green-100 text-green-800',
  ADMINISTRATIVE: 'bg-orange-100 text-orange-800',
  WEATHER: 'bg-red-100 text-red-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

export function HolidayList({
  holidays,
  userType,
  campuses,
  onEdit,
  onDelete,
}: HolidayListProps) {
  const { toast } = useToast();
  const [selectedHoliday, setSelectedHoliday] = React.useState<Holiday | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  const canEditHolidays = hasCalendarPermission(userType, CalendarAction.UPDATE_HOLIDAY);
  const canDeleteHolidays = hasCalendarPermission(userType, CalendarAction.DELETE_HOLIDAY);

  const handleEdit = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedHoliday) {
      try {
        await onDelete(selectedHoliday.id);
        toast({
          title: 'Success',
          description: 'Holiday deleted successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete holiday',
          variant: 'destructive',
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedHoliday(null);
      }
    }
  };

  const handleSubmitEdit = async (data: any) => {
    if (selectedHoliday) {
      try {
        await onEdit({
          ...selectedHoliday,
          ...data,
        });
        toast({
          title: 'Success',
          description: 'Holiday updated successfully',
        });
        setIsEditDialogOpen(false);
        setSelectedHoliday(null);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update holiday',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      {holidays.map((holiday) => (
        <Card key={holiday.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">{holiday.name}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge className={holidayTypeColors[holiday.type as keyof typeof holidayTypeColors]}>
                {holiday.type}
              </Badge>
              {canEditHolidays && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(holiday)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {canDeleteHolidays && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(holiday)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {holiday.description && (
                <p className="text-sm text-gray-500">{holiday.description}</p>
              )}
              <div className="flex items-center space-x-4 text-sm">
                <span>
                  {format(holiday.startDate, 'MMM d, yyyy')} -{' '}
                  {format(holiday.endDate, 'MMM d, yyyy')}
                </span>
                {holiday.affectsAll ? (
                  <Badge variant="outline">All Campuses</Badge>
                ) : (
                  <div className="flex items-center space-x-1">
                    {holiday.campuses.map((campus) => (
                      <Badge key={campus.id} variant="outline">
                        {campus.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Holiday</DialogTitle>
          </DialogHeader>
          {selectedHoliday && (
            <HolidayForm
              initialData={{
                name: selectedHoliday.name,
                description: selectedHoliday.description,
                startDate: selectedHoliday.startDate,
                endDate: selectedHoliday.endDate,
                type: selectedHoliday.type as any,
                affectsAll: selectedHoliday.affectsAll,
                campusIds: selectedHoliday.campuses.map((c) => c.id),
              }}
              onSubmit={handleSubmitEdit}
              onCancel={() => setIsEditDialogOpen(false)}
              campuses={campuses}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Holiday</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this holiday? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 