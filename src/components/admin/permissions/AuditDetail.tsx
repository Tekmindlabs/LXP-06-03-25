import { Card, Timeline } from "~/components/ui";
import { api } from "~/utils/api";

type AuditDetailProps = {
  auditId: string;
};

export const AuditDetail = ({ auditId }: AuditDetailProps) => {
  const { data: audit } = api.permission.getAuditDetail.useQuery({ id: auditId });

  if (!audit) return null;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">Change Details</h3>
            <p className="text-sm text-gray-500">
              {new Date(audit.timestamp).toLocaleString()}
            </p>
          </div>
          <Badge variant="outline">{audit.action}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="p-4">
            <h4 className="font-medium mb-2">Before</h4>
            <pre className="bg-gray-50 p-2 rounded">
              {JSON.stringify(audit.before, null, 2)}
            </pre>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium mb-2">After</h4>
            <pre className="bg-gray-50 p-2 rounded">
              {JSON.stringify(audit.after, null, 2)}
            </pre>
          </Card>
        </div>

        <div>
          <h4 className="font-medium mb-2">Impact Analysis</h4>
          <Timeline items={audit.impact} />
        </div>
      </div>
    </Card>
  );
}; 