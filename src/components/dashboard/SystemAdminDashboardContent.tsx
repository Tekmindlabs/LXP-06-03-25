'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/data-display/card";
import { LineChart } from "@/components/ui/charts/LineChart";
import { BarChart } from "@/components/ui/charts/BarChart";
import { PieChart } from "@/components/ui/charts/PieChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: Date;
  user?: {
    name: string | null;
    userType: string;
  } | null;
}

interface SystemAdminDashboardContentProps {
  recentAuditLogs: AuditLog[];
}

/**
 * System Admin Dashboard Content component
 * Displays analytics, charts, and activity logs for system administrators
 */
export function SystemAdminDashboardContent({ recentAuditLogs }: SystemAdminDashboardContentProps) {
  // Mock data for user activity chart (in a real app, this would come from analytics endpoints)
  const userActivityData = [
    { date: "Mon", logins: 120, registrations: 8, activeUsers: 95 },
    { date: "Tue", logins: 132, registrations: 12, activeUsers: 105 },
    { date: "Wed", logins: 145, registrations: 10, activeUsers: 118 },
    { date: "Thu", logins: 140, registrations: 15, activeUsers: 110 },
    { date: "Fri", logins: 180, registrations: 20, activeUsers: 140 },
    { date: "Sat", logins: 75, registrations: 5, activeUsers: 60 },
    { date: "Sun", logins: 90, registrations: 7, activeUsers: 70 },
  ];

  // Mock data for user distribution by role
  const userDistributionData = [
    { name: "Students", value: 850, color: "#1F504B" },
    { name: "Teachers", value: 120, color: "#5A8A84" },
    { name: "Coordinators", value: 45, color: "#D8E3E0" },
    { name: "Campus Admins", value: 25, color: "#FF9852" },
    { name: "System Admins", value: 10, color: "#D92632" },
    { name: "Parents", value: 200, color: "#2F96F4" },
  ];

  // Mock data for campus performance
  const campusPerformanceData = [
    { name: "Campus A", students: 320, teachers: 45, courses: 28 },
    { name: "Campus B", students: 280, teachers: 38, courses: 24 },
    { name: "Campus C", students: 420, teachers: 52, courses: 32 },
    { name: "Campus D", students: 180, teachers: 25, courses: 18 },
    { name: "Campus E", students: 250, teachers: 35, courses: 22 },
  ];

  // Mock system health data
  const systemHealthData = [
    { name: "CPU Usage", value: 45, color: "#1F504B" },
    { name: "Memory", value: 60, color: "#5A8A84" },
    { name: "Storage", value: 30, color: "#D8E3E0" },
    { name: "Network", value: 25, color: "#2F96F4" },
  ];

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-4 mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="users">User Analytics</TabsTrigger>
        <TabsTrigger value="institutions">Institutions</TabsTrigger>
        <TabsTrigger value="system">System Health</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Daily user activity over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart 
                data={userActivityData}
                xAxisKey="date"
                lines={[
                  { dataKey: "logins", name: "Logins", color: "#1F504B" },
                  { dataKey: "activeUsers", name: "Active Users", color: "#5A8A84" },
                  { dataKey: "registrations", name: "New Registrations", color: "#FF9852" }
                ]}
                height={300}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>Users by role type</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChart 
                data={userDistributionData}
                height={300}
              />
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Campus Performance</CardTitle>
            <CardDescription>Comparative metrics across campuses</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={campusPerformanceData}
              xAxisKey="name"
              bars={[
                { dataKey: "students", name: "Students", color: "#1F504B" },
                { dataKey: "teachers", name: "Teachers", color: "#5A8A84" },
                { dataKey: "courses", name: "Courses", color: "#FF9852" }
              ]}
              height={350}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>System-wide activity logs</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAuditLogs.map((log, index) => (
                <div key={index} className="flex items-start space-x-4 border-b pb-4 last:border-0">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <AlertCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{log.action}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>{log.user?.name || 'Unknown user'}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-sm">{log.details}</p>
                  </div>
                </div>
              ))}
              
              {recentAuditLogs.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="users" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Monthly user registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart 
                data={[
                  { month: "Jan", users: 950 },
                  { month: "Feb", users: 1050 },
                  { month: "Mar", users: 1100 },
                  { month: "Apr", users: 1180 },
                  { month: "May", users: 1250 }
                ]}
                xAxisKey="month"
                lines={[
                  { dataKey: "users", name: "Total Users", color: "#1F504B" }
                ]}
                height={300}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>Users by role type</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChart 
                data={userDistributionData}
                height={300}
              />
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>User Activity by Time</CardTitle>
            <CardDescription>Hourly system usage patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={[
                { hour: "00:00", users: 25 },
                { hour: "03:00", users: 10 },
                { hour: "06:00", users: 30 },
                { hour: "09:00", users: 180 },
                { hour: "12:00", users: 210 },
                { hour: "15:00", users: 240 },
                { hour: "18:00", users: 120 },
                { hour: "21:00", users: 60 }
              ]}
              xAxisKey="hour"
              bars={[
                { dataKey: "users", name: "Active Users", color: "#1F504B" }
              ]}
              height={300}
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="institutions" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Campus Distribution</CardTitle>
              <CardDescription>Campuses per institution</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart 
                data={[
                  { name: "Institution A", campuses: 5 },
                  { name: "Institution B", campuses: 3 },
                  { name: "Institution C", campuses: 2 },
                  { name: "Institution D", campuses: 1 },
                  { name: "Institution E", campuses: 1 }
                ]}
                xAxisKey="name"
                bars={[
                  { dataKey: "campuses", name: "Campuses", color: "#1F504B" }
                ]}
                height={300}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Institution Performance</CardTitle>
              <CardDescription>Key metrics by institution</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart 
                data={[
                  { name: "Institution A", students: 520, teachers: 65, courses: 42 },
                  { name: "Institution B", students: 380, teachers: 48, courses: 36 },
                  { name: "Institution C", students: 220, teachers: 32, courses: 24 },
                  { name: "Institution D", students: 80, teachers: 15, courses: 12 },
                  { name: "Institution E", students: 50, teachers: 10, courses: 8 }
                ]}
                xAxisKey="name"
                bars={[
                  { dataKey: "students", name: "Students", color: "#1F504B" },
                  { dataKey: "teachers", name: "Teachers", color: "#5A8A84" },
                  { dataKey: "courses", name: "Courses", color: "#FF9852" }
                ]}
                height={300}
              />
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="system" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>System Resource Usage</CardTitle>
              <CardDescription>Current system resource allocation</CardDescription>
            </CardHeader>
            <CardContent>
              <PieChart 
                data={systemHealthData}
                height={300}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Response Time</CardTitle>
              <CardDescription>Average API response time (ms)</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart 
                data={[
                  { hour: "00:00", time: 120 },
                  { hour: "03:00", time: 110 },
                  { hour: "06:00", time: 105 },
                  { hour: "09:00", time: 180 },
                  { hour: "12:00", time: 210 },
                  { hour: "15:00", time: 190 },
                  { hour: "18:00", time: 150 },
                  { hour: "21:00", time: 130 }
                ]}
                xAxisKey="hour"
                lines={[
                  { dataKey: "time", name: "Response Time (ms)", color: "#D92632" }
                ]}
                height={300}
              />
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Error Rate</CardTitle>
            <CardDescription>System errors over time</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={[
                { date: "Mon", errors: 12 },
                { date: "Tue", errors: 8 },
                { date: "Wed", errors: 15 },
                { date: "Thu", errors: 10 },
                { date: "Fri", errors: 5 },
                { date: "Sat", errors: 3 },
                { date: "Sun", errors: 2 }
              ]}
              xAxisKey="date"
              bars={[
                { dataKey: "errors", name: "Errors", color: "#D92632" }
              ]}
              height={300}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 
