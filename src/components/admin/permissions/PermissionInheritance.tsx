import { useEffect, useRef } from 'react';
import { Tree } from 'react-d3-tree';
import { Card, Badge } from "~/components/ui";
import { api } from "~/utils/api";

type PermissionInheritanceProps = {
  roleId: string;
};

export const PermissionInheritance = ({ roleId }: PermissionInheritanceProps) => {
  const treeContainer = useRef<HTMLDivElement>(null);
  const { data: inheritance } = api.permission.getInheritance.useQuery({ roleId });

  const buildTreeData = () => {
    if (!inheritance) return { name: 'No inheritance data' };

    const buildNode = (node: any) => ({
      name: node.name,
      attributes: {
        type: node.type,
        inherited: node.inherited
      },
      children: (node.children || []).map(buildNode)
    });

    return buildNode(inheritance);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Permission Inheritance</h3>
      <div ref={treeContainer} style={{ width: '100%', height: '400px' }}>
        <Tree
          data={buildTreeData()}
          orientation="vertical"
          pathFunc="step"
          translate={{ 
            x: treeContainer.current?.clientWidth ? treeContainer.current.clientWidth / 2 : 0,
            y: 50 
          }}
          renderCustomNodeElement={({ nodeDatum }: any) => (
            <g>
              <circle r={10} fill="#555" />
              <text dy="20" textAnchor="middle">
                {nodeDatum.name}
              </text>
              {nodeDatum.attributes?.inherited && (
                <Badge className="ml-2">Inherited</Badge>
              )}
            </g>
          )}
        />
      </div>
    </Card>
  );
}; 