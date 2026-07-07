import * as React from "react";
import { TreeNode } from "../utils/orgUtils";
import styles from "./PersonNode.module.scss";

export interface PersonNodeProps {
  activeTab:string;
  node: TreeNode;
  globalMaxDepth: number;
}

const ROLE_COLORS_VN: Record<string, string> = {
  "Leadership Team": "#404040",
  "Internal Support": "#4e7296",
  "Sales Support": "#f4883d",
  "Digital Technology Support": "#37b7a8",
  "Back Office": "#1f6b5d",
};

const ROLE_COLORS_US: Record<string, string> = {
  "Vice President": "#404040",
  "ES Operations": "#4e7296",
  "Professional Services": "#f4883d",
  "Engineering Services": "#f4883d",
};

function initials(name?: string) {
  if (!name) return "";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const PersonNode: React.FC<PersonNodeProps> = ({ activeTab, node, globalMaxDepth }) => {
  if (node.isSpacer) return <div style={{ width: 0, height: 0, overflow: "hidden" }} />;

  const [hovered, setHovered] = React.useState(false);

  const ROLE_COLORS = activeTab === 'us' ? ROLE_COLORS_US : ROLE_COLORS_VN;
  const bg = ROLE_COLORS[node.role || ""] ?? (activeTab === 'us' ? "#f0a65a" : "#888");
  const depth = node.depth ?? 1;
  const isSection1 = depth <= 4 && !node.isleaf;
  const isSection2= node.isleaf && node.showphoto;
  const isLeafDepth = node.isleaf && !node.showphoto;//depth >= globalMaxDepth || node.isleaf;

  const handleClick = () => {
    if (node.pageurl && node.pageurl.trim() !== "") {
      window.open(node.pageurl, "_blank", "noopener,noreferrer");
    }
  };

  const hasLink = !!(node.pageurl && node.pageurl.trim() !== "");

  const cardStyle: React.CSSProperties = {
    background: bg,
    cursor: hasLink ? "pointer" : "default",
    transform: hovered && hasLink ? "scale(1)" : "scale(1)",
    boxShadow: hovered && hasLink
      ? "0 6px 20px rgba(0,0,0,0.28)"
      : "0 2px 6px rgba(0,0,0,0.12)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease",
    filter: hovered && hasLink ? "brightness(1.12)" : "brightness(1)",
  };

  const hoverProps = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onClick: handleClick,
  };

  // 1. Check if the text exists, then split it by comma and clean up the spaces
      const textString = node.name || ""; // or whatever field holds "Engineering CAD, Data Analysis..."
      const textLines = textString.split(',').map((line: string) => line.trim());
      console.log(textLines);
      const LEAF_W = 90;
      const LEAF_H = 140;

  // Section 1: wide card — avatar left, name + jobTitle right
  if (isSection1) {
    return (
      <div className={["Anh Pham"].includes(node.name) ? styles.cardWhite : styles.card} style={cardStyle} {...hoverProps}>
        <div className={styles.section1}>
          <div className={styles.avatarWrap}>
            {node.photo ? (
              <img src={node.photo} alt={node.name} className={styles.avatarImg} />
            ) : (
              <div className={styles.avatarPlaceholder}>{initials(node.name)}</div>
            )}
          </div>
          <div className={styles.info}>
            <div className={styles.name}>{node.name}</div>
            {node.title && node.title !== node.name && (
              <div className={["Anh Pham"].includes(node.name) ? styles.titleCenter2 : styles.title}>{node.title}</div>
            )}
            {hasLink && hovered && (
              <div className={["Anh Pham"].includes(node.name) ? styles.linkHint2 : styles.linkHint}>🔗 View profile</div>
            )}
          </div>
        </div>
         {["Anh Pham"].includes(node.name) && (
          <div className={styles.accentBar}>
            <div className={styles.accentLeft} style={{ background: "#4e7296" }} />
            <div className={styles.accentRight} style={{ background: "#f4883d" }} />
          </div>
        )}
      </div>
    );
  }

  // Section 2: square card — avatar top, name + jobTitle below
  if (!isLeafDepth || isSection2) {
    return (
      <div className={["Anh Pham", "Tri Nguyen", "Ha Dinh","Vu Tran","Giang Vo"].includes(node.name) ? styles.cardWhite : styles.card} style={cardStyle} {...hoverProps}>
        <div className={styles.section2}>
          <div className={styles.avatarTop}>
            {node.photo ? (
              <img src={node.photo} alt={node.name} className={styles.avatarImgTop} />
            ) : (
              <div className={styles.avatarPlaceholderTop}>{initials(node.name)}</div>
            )}
          </div>
          <div className={styles.infoCenter}>
            <div className={styles.nameCenter}>{node.name}</div>
            {node.title && node.title !== node.name && (
              <div className={["Anh Pham", "Tri Nguyen", "Ha Dinh","Vu Tran","Giang Vo"].includes(node.name) ? styles.titleCenter2 : styles.titleCenter}>
                {node.title}
              </div>
            )}
            {hasLink && hovered && (
              <div className={["Anh Pham", "Tri Nguyen", "Ha Dinh","Vu Tran","Giang Vo"].includes(node.name) ? styles.linkHintCenter2 : styles.linkHintCenter}>
                🔗 View profile
              </div>
            )}
          </div>
        </div>
        {["Anh Pham", "Tri Nguyen", "Ha Dinh"].includes(node.name) && (
          <div className={styles.accentBar}>
            <div className={styles.accentLeft} style={{ background: "#4e7296" }} />
            <div className={styles.accentRight} style={{ background: "#f4883d" }} />
          </div>
        )}
        {["Giang Vo"].includes(node.name) && (
          <div className={styles.accentBar}>
            <div className={styles.accentRight} style={{ background: "#f4883d" }} />
          </div>
        )}
        {["Vu Tran"].includes(node.name) && (
          <div className={styles.accentBar}>
            <div className={styles.accentRight} style={{ background: "#4e7296" }} />
          </div>
        )}
      </div>
    );
  }
  

  // Bottom leaf: compact, no avatar
  return (
    <div
      className={styles.card}
      style={
        node.name === "ESVN Operations"
          ? { ...cardStyle, background: "#1f6b5d" }
          : node.name === "Internal Support"
          ? { ...cardStyle, background: "#4e7296" }
          : cardStyle
      }
    >
      <foreignObject 
  x={-LEAF_W / 2} 
  y={0} 
  width={LEAF_W} 
  height={LEAF_H}
>
      <div className={styles.leaf}>
        {/* <div className={styles.leafText}>{node.name}</div> */}
          {textLines.map((line: string, index: number) => (
            <span key={index} className={styles.leafText}>
              {line}
            </span>
          ))}
      </div>
      </foreignObject>
    </div>
  );
};

export default PersonNode;