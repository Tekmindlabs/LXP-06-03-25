'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Campus, Institution, SystemStatus, UserCampusAccess, UserType } from "@prisma/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/data-display/card";
import { Badge } from "@/components/ui/atoms/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/navigation/tabs";
import { 
  BuildingIcon, 
  MapPinIcon, 
  GlobeIcon, 
  PhoneIcon, 
  MailIcon, 
  PencilIcon, 
  TrashIcon, 
  UsersIcon,
  BookOpenIcon,
  HomeIcon,
  SettingsIcon,
  AlertTriangleIcon
} from "lucide-react";
import { formatDate } from "@/utils/format";
import { useToast } from "@/components/ui/feedback/toast";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

// Extended Campus type to match what we expect from the database
interface ExtendedCampus extends Omit<Campus, 'address' | 'contact'> {
  address: {
    street?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  institution: Institution;
  userAccess?: (UserCampusAccess & {
    user: {
      id: string;
      name: string | null;
      email: string | null;
    };
  })[];
  _count?: {
    userAccess: number;
    facilities: number;
    programs: number;
  };
}

interface CampusDetailProps {
  campus: Campus & {
    institution: Institution;
    userAccess?: (UserCampusAccess & {
      user: {
        id: string;
        name: string | null;
        email: string | null;
      };
    })[];
    _count?: {
      userAccess: number;
      facilities: number;
      programs: number;
    };
  };
}

export function CampusDetail({ campus }: CampusDetailProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Parse JSON data
  const address = typeof campus.address === 'object' && campus.address !== null 
    ? campus.address as unknown as { street?: string; city: string; state: string; postalCode: string; country: string; }
    : { city: 'Unknown', state: 'Unknown', country: 'Unknown', postalCode: 'Unknown' };
  
  const contact = typeof campus.contact === 'object' && campus.contact !== null 
    ? campus.contact as unknown as { phone: string; email: string; website?: string; }
    : { phone: 'Unknown', email: 'Unknown' };

  const deleteCampus = api.campus.delete.useMutation({
    onSuccess: () => {
      toast({
        title: "Campus deleted",
        description: "The campus has been deleted successfully",
        variant: "success",
      });
      router.push("/admin/system/campuses");
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Error deleting campus",
        description: error.message || "Failed to delete campus",
        variant: "error",
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this campus? This action cannot be undone.")) {
      deleteCampus.mutate({ id: campus.id });
    }
  };

  const getStatusBadgeVariant = (status: SystemStatus) => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "INACTIVE":
        return "secondary";
      case "ARCHIVED":
        return "warning";
      default:
        return "secondary";
    }
  };

  const getRoleBadgeVariant = (role: UserType) => {
    switch (role) {
      case "CAMPUS_ADMIN":
        return "secondary";
      case "CAMPUS_COORDINATOR":
        return "secondary";
      case "CAMPUS_TEACHER":
        return "success";
      default:
        return "secondary";
    }
  };

  // Create tab items for the Tabs component
  const tabItems = [
    {
      id: "administrators",
      label: (
        <div className="flex items-center">
          <UsersIcon className="h-4 w-4 mr-2" />
          Administrators
        </div>
      ),
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Campus Administrators</h3>
            <Link href={`/admin/system/campuses/${campus.id}/administrators/assign`}>
              <Button size="sm">
                <UsersIcon className="h-4 w-4 mr-2" />
                Assign Administrator
              </Button>
            </Link>
          </div>
          
          {campus.userAccess && campus.userAccess.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campus.userAccess.map((access) => (
                <Card key={access.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{access.user.name}</CardTitle>
                      <Badge variant={getRoleBadgeVariant(access.roleType)}>
                        {access.roleType.replace('CAMPUS_', '')}
                      </Badge>
                    </div>
                    <CardDescription>{access.user.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-xs text-muted-foreground">
                      <div>Start Date: {formatDate(access.startDate)}</div>
                      {access.endDate && <div>End Date: {formatDate(access.endDate)}</div>}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex justify-end w-full">
                      <Link href={`/admin/system/users/${access.user.id}`}>
                        <Button variant="outline" size="sm">View Profile</Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <UsersIcon className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No administrators assigned</h3>
              <p className="text-sm text-gray-500 mt-1">Assign administrators to manage this campus.</p>
              <Link href={`/admin/system/campuses/${campus.id}/administrators/assign`} className="mt-4">
                <Button>Assign Administrator</Button>
              </Link>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "features",
      label: (
        <div className="flex items-center">
          <SettingsIcon className="h-4 w-4 mr-2" />
          Features
        </div>
      ),
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Campus Features</h3>
            <Link href={`/admin/system/campuses/${campus.id}/features/manage`}>
              <Button size="sm">
                <SettingsIcon className="h-4 w-4 mr-2" />
                Manage Features
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <SettingsIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Feature management</h3>
            <p className="text-sm text-gray-500 mt-1">Configure and manage campus features.</p>
            <Link href={`/admin/system/campuses/${campus.id}/features/manage`} className="mt-4">
              <Button>Manage Features</Button>
            </Link>
          </div>
        </div>
      ),
    },
    {
      id: "programs",
      label: (
        <div className="flex items-center">
          <BookOpenIcon className="h-4 w-4 mr-2" />
          Programs
        </div>
      ),
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Campus Programs</h3>
            <Link href={`/admin/system/campuses/${campus.id}/programs`}>
              <Button size="sm">
                <BookOpenIcon className="h-4 w-4 mr-2" />
                View All Programs
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <BookOpenIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Program management</h3>
            <p className="text-sm text-gray-500 mt-1">View and manage academic programs for this campus.</p>
            <Link href={`/admin/system/campuses/${campus.id}/programs`} className="mt-4">
              <Button>View Programs</Button>
            </Link>
          </div>
        </div>
      ),
    },
    {
      id: "classes",
      label: (
        <div className="flex items-center">
          <HomeIcon className="h-4 w-4 mr-2" />
          Classes
        </div>
      ),
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Campus Classes</h3>
            <Link href={`/admin/system/campuses/${campus.id}/classes`}>
              <Button size="sm">
                <HomeIcon className="h-4 w-4 mr-2" />
                View All Classes
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <HomeIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Class management</h3>
            <p className="text-sm text-gray-500 mt-1">View and manage classes for this campus.</p>
            <Link href={`/admin/system/campuses/${campus.id}/classes`} className="mt-4">
              <Button>View Classes</Button>
            </Link>
          </div>
        </div>
      ),
    },
    {
      id: "facilities",
      label: (
        <div className="flex items-center">
          <BuildingIcon className="h-4 w-4 mr-2" />
          Facilities
        </div>
      ),
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Campus Facilities</h3>
            <Link href={`/admin/system/campuses/${campus.id}/facilities`}>
              <Button size="sm">
                <BuildingIcon className="h-4 w-4 mr-2" />
                View All Facilities
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <BuildingIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Facility management</h3>
            <p className="text-sm text-gray-500 mt-1">View and manage facilities for this campus.</p>
            <Link href={`/admin/system/campuses/${campus.id}/facilities`} className="mt-4">
              <Button>View Facilities</Button>
            </Link>
          </div>
        </div>
      ),
    },
    {
      id: "students",
      label: (
        <div className="flex items-center">
          <UsersIcon className="h-4 w-4 mr-2" />
          Students
        </div>
      ),
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Campus Students</h3>
            <Link href={`/admin/system/campuses/${campus.id}/students`}>
              <Button size="sm">
                <UsersIcon className="h-4 w-4 mr-2" />
                View All Students
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <UsersIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Student management</h3>
            <p className="text-sm text-gray-500 mt-1">View and manage students for this campus.</p>
            <Link href={`/admin/system/campuses/${campus.id}/students`} className="mt-4">
              <Button>View Students</Button>
            </Link>
          </div>
        </div>
      ),
    },
    {
      id: "teachers",
      label: (
        <div className="flex items-center">
          <UsersIcon className="h-4 w-4 mr-2" />
          Teachers
        </div>
      ),
      content: (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Campus Teachers</h3>
            <Link href={`/admin/system/campuses/${campus.id}/teachers`}>
              <Button size="sm">
                <UsersIcon className="h-4 w-4 mr-2" />
                View All Teachers
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <UsersIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Teacher management</h3>
            <p className="text-sm text-gray-500 mt-1">View and manage teachers for this campus.</p>
            <Link href={`/admin/system/campuses/${campus.id}/teachers`} className="mt-4">
              <Button>View Teachers</Button>
            </Link>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{campus.name}</CardTitle>
              <CardDescription className="mt-2">
                <div className="flex items-center text-sm">
                  <BuildingIcon className="h-4 w-4 mr-1" />
                  <Link href={`/admin/system/institutions/${campus.institutionId}`} className="hover:underline">
                    {campus.institution.name}
                  </Link>
                </div>
                <div className="flex items-center text-sm mt-1">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {address.street && `${address.street}, `}
                  {address.city}, {address.state}, {address.postalCode}, {address.country}
                </div>
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Badge variant={getStatusBadgeVariant(campus.status)}>
                {campus.status}
              </Badge>
              <Badge variant="outline">{campus.code}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{contact.phone}</span>
                </div>
                <div className="flex items-center">
                  <MailIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{contact.email}</span>
                </div>
                {contact.website && (
                  <div className="flex items-center">
                    <GlobeIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a 
                      href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {contact.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Campus Information</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <UsersIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{campus._count?.userAccess || 0} Staff Members</span>
                </div>
                <div className="flex items-center">
                  <BookOpenIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{campus._count?.programs || 0} Programs</span>
                </div>
                <div className="flex items-center">
                  <HomeIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{campus._count?.facilities || 0} Facilities</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">System Information</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-xs text-muted-foreground w-24">Created:</span>
                  <span>{formatDate(campus.createdAt)}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-muted-foreground w-24">Last Updated:</span>
                  <span>{formatDate(campus.updatedAt)}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-muted-foreground w-24">ID:</span>
                  <span className="text-xs font-mono">{campus.id}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-end space-x-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={deleteCampus.isLoading}
              className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              {deleteCampus.isLoading ? (
                "Deleting..."
              ) : (
                <>
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Campus
                </>
              )}
            </Button>
            <Link href={`/admin/system/campuses/${campus.id}/edit`}>
              <Button size="sm">
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit Campus
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>

      <Tabs defaultValue="administrators" className="mt-6">
        <TabsList>
          {tabItems.map((item) => (
            <TabsTrigger key={item.id} value={item.id}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabItems.map((item) => (
          <TabsContent key={item.id} value={item.id}>
            {item.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 