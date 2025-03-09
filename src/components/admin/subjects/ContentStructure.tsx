import { useState, useEffect } from 'react';
import { Card } from "~/components/ui";
import { Button } from "~/components/ui";
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { SubjectNodeType, CompetencyLevel, SystemStatus } from "~/server/api/constants";

// Topic structure based on the new SubjectTopic model
type SubjectTopic = {
  id: string;
  code: string;
  title: string;
  description?: string;
  context?: string;
  learningOutcomes?: string;
  nodeType: SubjectNodeType;
  orderIndex: number;
  estimatedMinutes?: number;
  competencyLevel?: CompetencyLevel;
  keywords?: string[];
  subjectId: string;
  parentTopicId?: string;
  status: SystemStatus;
  children?: SubjectTopic[];
  _count?: {
    activities: number;
    assessments: number;
    childTopics: number;
  };
};

interface TopicNodeProps {
  topic: SubjectTopic;
  level: number;
  subjectId: string;
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => void;
}

const TopicNode = ({ topic, level, subjectId, onDelete, onRefresh }: TopicNodeProps) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = topic.children && topic.children.length > 0;
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${topic.title}"? This action cannot be undone.`)) {
      setIsDeleting(true);
      try {
        await onDelete(topic.id);
        toast.success("Topic deleted successfully");
        onRefresh();
      } catch (error) {
        toast.error("Failed to delete topic");
        console.error(error);
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  return (
    <div className="mb-2">
      <div 
        className={`p-3 rounded border ${level === 0 ? 'bg-gray-50' : level === 1 ? 'bg-white' : 'bg-gray-50'}`}
        style={{ marginLeft: `${level * 20}px` }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button 
                onClick={() => setExpanded(!expanded)} 
                className="text-gray-500 hover:text-gray-700"
              >
                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            ) : (
              <div className="w-4"></div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{topic.title}</span>
                <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full">
                  {topic.code}
                </span>
                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                  {topic.nodeType}
                </span>
                {topic._count && (
                  <div className="flex gap-1 text-xs text-gray-500">
                    <span>{topic._count.activities} activities</span>
                    <span>•</span>
                    <span>{topic._count.assessments} assessments</span>
                  </div>
                )}
              </div>
              {topic.description && (
                <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => router.push(`/admin/system/subjects/${subjectId}/topics/add?parentTopicId=${topic.id}`)}
              title="Add subtopic"
            >
              <Plus size={16} />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => router.push(`/admin/system/subjects/${subjectId}/topics/${topic.id}/edit`)}
              title="Edit topic"
            >
              <Edit size={16} />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleDelete}
              disabled={isDeleting || (topic._count && (topic._count.childTopics > 0 || topic._count.activities > 0 || topic._count.assessments > 0))}
              title={topic._count && (topic._count.childTopics > 0 || topic._count.activities > 0 || topic._count.assessments > 0) 
                ? "Cannot delete topics with children or associated content" 
                : "Delete topic"}
            >
              {topic._count && (topic._count.childTopics > 0 || topic._count.activities > 0 || topic._count.assessments > 0) 
                ? <AlertCircle size={16} className="text-gray-400" /> 
                : <Trash2 size={16} className={isDeleting ? "text-gray-400" : "text-red-500"} />}
            </Button>
          </div>
        </div>
      </div>
      
      {expanded && hasChildren && (
        <div>
          {topic.children!.map(child => (
            <TopicNode 
              key={child.id} 
              topic={child} 
              level={level + 1}
              subjectId={subjectId}
              onDelete={onDelete}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ContentStructureProps {
  subjectId: string;
}

export const ContentStructure = ({ subjectId }: ContentStructureProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Use the TRPC API to fetch topic hierarchy
  const { data: topicHierarchy, isLoading: isLoadingTopics, error } = api.subjectTopic.getHierarchy.useQuery(
    { subjectId },
    { enabled: !!subjectId, refetchOnWindowFocus: false, refetchOnMount: true, keepPreviousData: false }
  );
  
  // Delete mutation
  const deleteMutation = api.subjectTopic.delete.useMutation();
  
  // Handle delete topic
  const handleDeleteTopic = async (id: string) => {
    await deleteMutation.mutateAsync({ id });
    setRefreshKey(prev => prev + 1); // Trigger a refresh
  };
  
  // Refresh the topic hierarchy
  const refreshTopics = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  useEffect(() => {
    setIsLoading(isLoadingTopics);
  }, [isLoadingTopics]);
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Subject Topic Structure</h3>
        <Button onClick={() => router.push(`/admin/system/subjects/${subjectId}/topics/add`)}>
          Add Topic
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-4">
          Error loading topic structure: {error.message}
        </div>
      )}
      
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">
            Loading topic structure...
          </div>
        ) : topicHierarchy && topicHierarchy.length > 0 ? (
          topicHierarchy.map(topic => (
            <TopicNode 
              key={topic.id} 
              topic={topic} 
              level={0}
              subjectId={subjectId}
              onDelete={handleDeleteTopic}
              onRefresh={refreshTopics}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No topic structure defined yet. Add a topic to get started.
          </div>
        )}
      </div>
    </Card>
  );
}; 