'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/data-display/card";
import { Badge } from "@/components/ui/atoms/badge";
import { ArrowLeftIcon, PlusIcon, BookOpenIcon, CalendarIcon, UsersIcon, HomeIcon } from "lucide-react";
import { formatDate } from "@/utils/format";
import { Campus, Program, ProgramCampus } from "@prisma/client";

interface CampusProgramsContentProps {
  campus: Campus & {
    institution: {
      id: string;
      name: string;
      code: string;
    };
  };
  programCampuses: (ProgramCampus & {
    program: Program;
    _count: {
      classes: number;
      courseOfferings: number;
    };
  })[];
  availablePrograms: Program[];
}

export function CampusProgramsContent({
  campus,
  programCampuses,
  availablePrograms,
}: CampusProgramsContentProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/admin/system/campuses/${campus.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title={`Programs - ${campus.name}`}
          description={`Manage programs for ${campus.code} campus`}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Campus Programs</h2>
        <Link href={`/admin/system/campuses/${campus.id}/programs/assign`}>
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Assign Program
          </Button>
        </Link>
      </div>
      
      {programCampuses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programCampuses.map((pc) => (
            <Card key={pc.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{pc.program.name}</CardTitle>
                  <Badge variant="secondary">{pc.program.code}</Badge>
                </div>
                <CardDescription>{pc.program.type}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Start: {formatDate(pc.startDate)}</span>
                  </div>
                  {pc.endDate && (
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>End: {formatDate(pc.endDate)}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <HomeIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Classes: {pc._count.classes}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <BookOpenIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Courses: {pc._count.courseOfferings}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex justify-between">
                <Link href={`/admin/system/programs/${pc.program.id}`}>
                  <Button variant="outline" size="sm">View Program</Button>
                </Link>
                <Link href={`/admin/system/campuses/${campus.id}/programs/${pc.id}`}>
                  <Button variant="secondary" size="sm">Manage</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <BookOpenIcon className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No programs assigned</h3>
          <p className="text-sm text-gray-500 mt-1">Assign programs to this campus to get started.</p>
          <Link href={`/admin/system/campuses/${campus.id}/programs/assign`} className="mt-4">
            <Button>Assign Program</Button>
          </Link>
        </div>
      )}
      
      {availablePrograms.length > 0 && (
        <>
          <div className="mt-8">
            <h2 className="text-xl font-semibold">Available Programs</h2>
            <p className="text-sm text-muted-foreground mt-1">
              These programs from {campus.institution.name} can be assigned to this campus.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availablePrograms.map((program) => (
              <Card key={program.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{program.name}</CardTitle>
                    <Badge variant="outline">{program.code}</Badge>
                  </div>
                  <CardDescription>{program.type}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="text-sm">
                    <p>Level: {program.level}</p>
                    <p>Duration: {program.duration} {program.duration === 1 ? 'year' : 'years'}</p>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 flex justify-between">
                  <Link href={`/admin/system/programs/${program.id}`}>
                    <Button variant="outline" size="sm">View Program</Button>
                  </Link>
                  <Link href={`/admin/system/campuses/${campus.id}/programs/assign?programId=${program.id}`}>
                    <Button size="sm">Assign</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 