

// utils/orgUtils.ts (replace buildTree/buildTreeData with this)
export type Id = string;

export interface TreeNode {
  id: Id;
  name: string;
  title?: string;
  role?: string;
  photo?: string;
  managerId?: Id | null;
  children?: TreeNode[];
  depth?: number;
  isSpacer?: boolean;        // true for padding spacer nodes
  isOriginalLeaf?: boolean;  // true for actual data leaves
  isleaf?:boolean;
  pageurl?:string;
}

export function buildTreeData(items: Array<any>) {
  // create nodes map with string ids
  const map = new Map<Id, TreeNode>();
  for (const it of items) {
    const idStr = String(it.Id ?? it.ID ?? it.id);
    map.set(idStr, {
      id: idStr,
      name: it.Title ?? '',
      title: it.JobTitle ?? '',
      role: it.Branch ?? '',
      photo: it.PhotoURL ?? undefined,
      managerId: it.ManagerId != null ? String(it.ManagerId) : (it.Manager && (it.Manager.Id ?? it.Manager.ID) ? String(it.Manager.Id ?? it.Manager.ID) : null),
      children: [],
      depth: 0,
      isSpacer: false,
      isOriginalLeaf: false,
      isleaf:it.IsLeaf,
      pageurl:it.PageURL ?? it.PageUrl ?? '',
    });
  }

  // attach children
  const roots: TreeNode[] = [];
  map.forEach((node) => {
    const mid = node.managerId ? String(node.managerId) : null;
    if (mid && mid !== node.id && map.has(mid)) {
      map.get(mid)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });

  // depth first set depth and mark original leaves
  const setDepth = (n: TreeNode, d: number) => {
    n.depth = d;
    if (!n.children || n.children.length === 0) {
      n.isOriginalLeaf = true;
      return;
    }
    for (const c of n.children) setDepth(c, d + 1);
  };
  for (const r of roots) setDepth(r, 1);

  // compute global max depth
  const maxDepthFor = (n: TreeNode): number => {
    if (!n.children || n.children.length === 0) return n.depth ?? 1;
    return Math.max(...n.children.map(maxDepthFor));
  };
  const globalMaxDepth = roots.length ? Math.max(...roots.map(maxDepthFor)) : 1;

  // pad original leaves by wrapping spacer nodes so leaves align at globalMaxDepth
  const padLeafToDepth = (n: TreeNode, currentDepth: number): TreeNode => {
    if (!n.children || n.children.length === 0) {
      // original leaf: if shallower than globalMaxDepth, wrap with spacer nodes
      if (currentDepth < globalMaxDepth) {
        let wrapper: TreeNode = { ...n, children: undefined, isSpacer: false, isOriginalLeaf: true, depth: currentDepth };
        for (let d = currentDepth; d < globalMaxDepth; d++) {
          wrapper = {
            id: `__sp_${Math.random().toString(36).slice(2)}`,
            name: '',
            title: '',
            role: n.role,
            photo: undefined,
            managerId: null,
            children: [wrapper],
            depth: d,
            isSpacer: true,
            isOriginalLeaf: false,
            isleaf:n.isleaf,
            pageurl:n.pageurl,
          };
        }
        return wrapper;
      }
      return n;
    }

    // non-leaf: map children
    n.children = n.children.map((c) => padLeafToDepth(c, currentDepth + 1));
    return n;
  };

  const paddedRoots = roots.map(r => padLeafToDepth(r, r.depth ?? 1));

  // create a single virtual root if multiple roots exist
  const virtualRoot: TreeNode = paddedRoots.length === 1 ? paddedRoots[0] : {
    id: '__root__',
    name: '',
    children: paddedRoots,
    depth: 0,
    isSpacer: true,
    isOriginalLeaf: false
  };

  return { root: virtualRoot, globalMaxDepth };
}