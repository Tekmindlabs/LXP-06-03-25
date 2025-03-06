'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout';
import { Button } from '@/components/ui';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/data-display/card';
import { CalendarIcon, PlusIcon } from 'lucide-react';

export default function CalendarManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('holidays');

  return (
    <PageLayout
      title="Calendar Management"
      description="Manage holidays, academic events, and schedule patterns"
      breadcrumbs={[
        { label: 'Dashboard', href: '/admin/system' },
        { label: 'Calendar Management', href: '/admin/system/calendar' }
      ]}
    >
      <div className="flex space-x-4 mb-6">
        <Button 
          variant={activeTab === 'holidays' ? 'default' : 'outline'} 
          onClick={() => setActiveTab('holidays')}
        >
          Holidays
        </Button>
        <Button 
          variant={activeTab === 'events' ? 'default' : 'outline'} 
          onClick={() => setActiveTab('events')}
        >
          Academic Events
        </Button>
        <Button 
          variant={activeTab === 'patterns' ? 'default' : 'outline'} 
          onClick={() => setActiveTab('patterns')}
        >
          Schedule Patterns
        </Button>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={() => {
          switch (activeTab) {
            case 'holidays':
              router.push('/admin/system/calendar/holidays/create');
              break;
            case 'events':
              router.push('/admin/system/calendar/events/create');
              break;
            case 'patterns':
              router.push('/admin/system/calendar/patterns/create');
              break;
          }
        }}>
          <PlusIcon className="h-4 w-4 mr-2" />
          {activeTab === 'holidays' && 'Add Holiday'}
          {activeTab === 'events' && 'Add Academic Event'}
          {activeTab === 'patterns' && 'Add Schedule Pattern'}
        </Button>
      </div>

      {activeTab === 'holidays' && (
        <Card>
          <CardHeader>
            <CardTitle>Holidays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium">No Holidays Found</h3>
              <p className="mt-1">Get started by creating a holiday.</p>
              <Button 
                className="mt-4"
                onClick={() => router.push('/admin/system/calendar/holidays/create')}
              >
                Create Holiday
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {activeTab === 'events' && (
        <Card>
          <CardHeader>
            <CardTitle>Academic Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium">No Academic Events Found</h3>
              <p className="mt-1">Get started by creating an academic event.</p>
              <Button 
                className="mt-4"
                onClick={() => router.push('/admin/system/calendar/events/create')}
              >
                Create Academic Event
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {activeTab === 'patterns' && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium">No Schedule Patterns Found</h3>
              <p className="mt-1">Get started by creating a schedule pattern.</p>
              <Button 
                className="mt-4"
                onClick={() => router.push('/admin/system/calendar/patterns/create')}
              >
                Create Schedule Pattern
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
} 