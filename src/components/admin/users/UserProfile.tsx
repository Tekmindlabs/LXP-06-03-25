import { useState } from "react";
import { Card, Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui";
import { UserForm } from "./UserForm";
import { RoleAssignment } from "./RoleAssignment";
import { ActivityLog } from "./ActivityLog";

type UserProfileProps = {
  userId: string;
};

// Mock user data
const mockUser = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  role: "ADMIN" as const
};

export const UserProfile = ({ userId }: UserProfileProps) => {
  const [activeTab, setActiveTab] = useState("details");
  
  // Mock form submission
  const handleSubmit = async (data: any) => {
    console.log("Submitting user data:", data);
    // In a real app, this would call an API
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Basic Information</TabsTrigger>
          <TabsTrigger value="roles">Role Assignment</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card className="p-6">
            <UserForm 
              initialData={mockUser} 
              onSubmit={handleSubmit}
            />
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <RoleAssignment userId={userId} />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityLog userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}; 