import * as React from "react";
import Tree from "react-d3-tree";
import PersonNode from "./PersonNode";
import styles from "./OrgTree.module.scss";
import { buildTreeData, TreeNode } from "../utils/orgUtils";
import { IOrgItem } from "../models/IOrgItem";

const TreeComponent = Tree as unknown as React.ComponentType<any>;

export interface OrgTreeProps {
  items: IOrgItem[];
  activeTab?: 'us' | 'vn';
}

// Card size constants — adjust these to tune the layout
const S1_W = 250;   // Section 1 (top rows): wide card
const S1_H = 80;
const S2_W = 90;   // Section 2 (middle rows): square card
const S2_H = 140;
const LEAF_W = 90; // Bottom leaf row: compact card
const LEAF_H = 140;

const S1_MAX_DEPTH = 4; // depths 1-3 use Section 1 style


const LEGEND_VN = [
  { label: "Leadership Team",            color: "#3b3b3b" },
  { label: "Internal Support",           color: "#4e7296" },
  { label: "Sales Support",              color: "#f4883d" },
  { label: "Digital Technology Support", color: "#37b7a8" },
  { label: "Back Office",                color: "#1f6b5d" },
];

const LEGEND_US = [
  { label: "Leadership Team",            color: "#3b3b3b" },
  { label: "Internal Support",              color: "#4e7296" },
  { label: "Sales Support",                 color: "#f4883d" },
  
];




const OrgTree: React.FC<OrgTreeProps> = ({ items,activeTab='us' }) => {
  
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = React.useState({ x: 800, y: 60 });

  // Dynamically center the chart based on container width
  React.useEffect(() => {
    const updateTranslate = () => {
      if (containerRef.current) {
        const w = containerRef.current.getBoundingClientRect().width;
        setTranslate({ x: w / 2 + 100, y: 60 });
      }
    };

    updateTranslate();

    const observer = new ResizeObserver(updateTranslate);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);
  
  const { root, globalMaxDepth } = React.useMemo(() => buildTreeData(items), [items]);

  React.useEffect(() => {
    console.group("OrgTree debug");
    console.log("items:", items.length);
    console.log("root:", root);
    console.log("globalMaxDepth:", globalMaxDepth);
    console.groupEnd();
  }, [items, root, globalMaxDepth]);


  const renderNode = React.useCallback(
    (rd3props: any) => {
      const nodeDatum: TreeNode = rd3props.nodeDatum;

      // hide synthetic root and spacer nodes
      /* if (nodeDatum.isSpacer || nodeDatum.id === "__root__") {
        return (
          <g>
            <foreignObject width={0} height={0} style={{ overflow: "hidden", pointerEvents: "none" }}>
              <div />
            </foreignObject>
          </g>
        );
      } */

      const depth = nodeDatum.depth ?? 1;
      const isLeaf = nodeDatum.isleaf;
      const isSection1 = depth <= S1_MAX_DEPTH;

      let w = S2_W;
      let h = S2_H;
      if(isSection1)
      {
        w=S1_W;
        h=S1_H;
      }
      if(isSection1 && isLeaf)
      {
        w=LEAF_W;
        h=LEAF_H;
      }


      return (
        <g>

          {depth != 1 && (
        <line 
          x1={0} 
          y1={0} 
          x2={0} 
          y2={10} 
          stroke="#d0d0d0" 
          strokeWidth={1}  
        />
      )}
        <g transform={nodeDatum.name==="Andrew Hunt" ? "translate(0, 0)" : "translate(0, 10)"} style={{ cursor: "pointer" }}>
          <foreignObject
            x={-w / 2}
            y={0}
            width={w}
            height={h}
            fill="#d0d0d0"
            style={{ overflow: "auto", pointerEvents: "all"}}
          >
            
            <div style={{ width: w, height: h }}>
              <PersonNode activeTab={activeTab} node={nodeDatum} globalMaxDepth={globalMaxDepth} />
            </div>
          </foreignObject>
        </g>
        </g>
      );
    },
    [globalMaxDepth]
  );


  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
    <div className={styles.orgTreeRoot} ref={containerRef}>
      <TreeComponent
        data={root as any}
        translate={translate}
        orientation="vertical"
        renderCustomNodeElement={renderNode}
        collapsible={false}
        zoomable={false}           // re-enable zoom so user can zoom out to see full chart
        draggable={true}          // re-enable pan/drag
        pathFunc="elbow"
        separation={{ siblings: 0.34, nonSiblings: 0.5 }}   // much tighter
        nodeSize={{ x: S1_W + 20, y: S1_H + 160 }}
        scaleExtent={{ min: 1, max: 1 }}                 // allow zoom out to 30%
        initialDepth={undefined}
        depthFactor={150}
        
      />
    </div>

    {/* Legend */}
    <div style={{
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      gap: "20px",
      padding: "12px 24px",
      borderTop: "1px solid #e0e0e0",
      background: "#fff",
      fontFamily: '"Segoe UI", Arial, sans-serif',
    }}>
      {(activeTab === 'us' ? LEGEND_US : LEGEND_VN).map(item => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28,
            height: 16,
            borderRadius: 4,
            background: item.color,
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 12, color: "#444", whiteSpace: "nowrap" }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
    </div>
  );
};

export default OrgTree;