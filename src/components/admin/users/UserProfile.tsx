import { useState } from "react";
import { Card, Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui";
import { UserForm } from "./UserForm";
import { RoleAssignment } from "./RoleAssignment";
import { ActivityLog } from "./ActivityLog";
import { api } from "~/utils/api";

type UserProfileProps = {
  userId: string;
};

export const UserProfile = ({ userId }: UserProfileProps) => {
  const [activeTab, setActiveTab] = useState("details");
  const { data: user } = api.user.getById.useQuery({ id: userId });

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
            <UserForm initialData={user} />
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