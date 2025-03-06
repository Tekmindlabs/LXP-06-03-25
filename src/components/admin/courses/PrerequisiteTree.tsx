import { useEffect, useRef } from 'react';
import { Tree } from 'react-d3-tree';
import { Card } from "~/components/ui";
import { api } from "~/utils/api";

type PrerequisiteTreeProps = {
  prerequisites: string[];
};

export const PrerequisiteTree = ({ prerequisites }: PrerequisiteTreeProps) => {
  const treeContainer = useRef<HTMLDivElement>(null);
  const { data: courses } = api.course.list.useQuery({});

  const buildTreeData = () => {
    if (!courses?.items) return { name: 'No prerequisites' };

    const courseMap = new Map(courses.items.map(c => [c.id, c]));
    const rootCourse = courses.items.find(c => prerequisites.includes(c.id));

    if (!rootCourse) return { name: 'No prerequisites' };

    const buildNode = (courseId: string, visited = new Set<string>()) => {
      if (visited.has(courseId)) return null;
      visited.add(courseId);

      const course = courseMap.get(courseId);
      if (!course) return null;

      const children = prerequisites
        .map(id => buildNode(id, new Set(visited)))
        .filter(Boolean);

      return {
        name: course.code,
        attributes: {
          name: course.name,
        },
        children,
      };
    };

    return buildNode(rootCourse.id);
  };

  return (
    <Card className="p-4">
      <div ref={treeContainer} style={{ width: '100%', height: '300px' }}>
        <Tree 
          data={buildTreeData()}
          orientation="vertical"
          pathFunc="step"
          translate={{ 
            x: treeContainer.current?.clientWidth ? treeContainer.current.clientWidth / 2 : 0, 
            y: 50 
          }}
        />
      </div>
    </Card>
  );
}; 