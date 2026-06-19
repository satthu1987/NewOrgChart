import { IOrgItem } from '../models/IOrgItem';

export interface TreeNode {
  name: string;
  attributes?: { jobtitle?: string; branch?: string; pageurl?: string };
  children?: TreeNode[];
  raw?: IOrgItem;
}

export function buildTree(items: IOrgItem[]): TreeNode[] {
  const map = new Map<number, TreeNode>();
  const roots: TreeNode[] = [];

  // create node objects for each item
  items.forEach(i => {
    map.set(i.Id, {
      name: i.Title,
      attributes: { jobtitle: i.JobTitle, branch: i.Branch, pageurl: i.PageURL },
      children: [],
      raw: i
    });
  });

  // attach to parents where ManagerId exists and is found
  items.forEach(i => {
    const node = map.get(i.Id)!;
    if (i.ManagerId && map.has(i.ManagerId)) {
      const parent = map.get(i.ManagerId)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}