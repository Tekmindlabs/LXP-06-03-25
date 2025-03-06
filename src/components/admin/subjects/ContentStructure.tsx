import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided } from '@hello-pangea/dnd';
import { Card } from "~/components/ui";
import { Button } from "~/components/ui";
import { Input } from "~/components/ui";

type Topic = {
  id: string;
  title: string;
  content: string;
  order: number;
};

type TopicCardProps = {
  topic: Topic;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

const TopicCard = ({ topic, onEdit, onDelete }: TopicCardProps) => {
  return (
    <div className="p-4 mb-2 bg-white border rounded shadow-sm">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">{topic.title}</h4>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(topic.id)}>
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(topic.id)}>
            Delete
          </Button>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-1">{topic.content}</p>
    </div>
  );
};

export const ContentStructure = () => {
  const [topics, setTopics] = useState<Topic[]>([]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(topics);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTopics(items);
  };

  const handleEdit = (id: string) => {
    // Implement edit functionality
  };

  const handleDelete = (id: string) => {
    setTopics(topics.filter(topic => topic.id !== id));
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Content Structure</h3>
        <Droppable droppableId="topics">
          {(provided: DroppableProvided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {topics.map((topic, index) => (
                <Draggable key={topic.id} draggableId={topic.id} index={index}>
                  {(provided: DraggableProvided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <TopicCard 
                        topic={topic} 
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </Card>
    </DragDropContext>
  );
}; 