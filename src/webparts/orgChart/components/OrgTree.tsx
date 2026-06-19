import * as React from 'react';
import Tree from 'react-d3-tree';
import { IOrgItem } from '../models/IOrgItem';
import { buildTree, TreeNode } from '../utils/orgUtils';
import PersonNode from './PersonNode';
import styles from './OrgTree.module.scss';

interface OrgTreeProps {
  items: IOrgItem[];
}

const OrgTree: React.FC<OrgTreeProps> = ({ items }) => {
  const roots = React.useMemo(() => buildTree(items), [items]);

  // transform TreeNode to react-d3-tree expected shape
  const transform = (node: TreeNode): any => {
    return {
      name: node.name,
      attributes: node.attributes,
      children: node.children && node.children.length ? node.children.map(transform) : undefined,
      raw: node.raw
    };
  };

  const treeData = roots.length === 1 ? transform(roots[0]) : { name: 'Root', children: roots.map(transform) };

  // center horizontally
  const translate = { x: window.innerWidth / 2, y: 80 };
  const nodeSize = { x: 260, y: 140 };
  const separation = { siblings: 1.1, nonSiblings: 1.4 };

  return (
    <div className={styles.treeContainer}>
      <Tree
        data={treeData}
        translate={translate}
        orientation="vertical"
        nodeSize={nodeSize}
        separation={separation}
        renderCustomNodeElement={(rd3tProps) => <PersonNode nodeDatum={rd3tProps.nodeDatum} />}
        pathFunc="elbow"
        zoomable
        collapsible={false}
      />
    </div>
  );
};

export default OrgTree;