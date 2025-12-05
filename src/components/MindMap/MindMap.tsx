import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import styles from './MindMap.module.css';

// Estructura de datos para el mapa mental
export interface MindMapNode {
  id: string;
  label: string;
  children?: MindMapNode[];
}

export interface MindMapData {
  root: MindMapNode;
}

interface MindMapProps {
  data?: MindMapData;
}

// Datos de ejemplo
const defaultMindMapData: MindMapData = {
  root: {
    id: 'root',
    label: 'React',
    children: [
      {
        id: 'components',
        label: 'Componentes',
        children: [
          { id: 'functional', label: 'Funcionales' },
          { id: 'class', label: 'De Clase' },
          { id: 'hoc', label: 'HOC' },
        ],
      },
      {
        id: 'hooks',
        label: 'Hooks',
        children: [
          { id: 'useState', label: 'useState' },
          { id: 'useEffect', label: 'useEffect' },
          { id: 'useContext', label: 'useContext' },
          { id: 'useRef', label: 'useRef' },
        ],
      },
      {
        id: 'state',
        label: 'Estado',
        children: [
          { id: 'local', label: 'Local' },
          { id: 'global', label: 'Global' },
          { id: 'redux', label: 'Redux' },
        ],
      },
      {
        id: 'routing',
        label: 'Enrutamiento',
        children: [
          { id: 'react-router', label: 'React Router' },
          { id: 'next-router', label: 'Next.js Router' },
        ],
      },
    ],
  },
};

// Función para calcular posiciones y crear nodos/edges
function buildNodesAndEdges(data: MindMapData): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const HORIZONTAL_SPACING = 220;
  const VERTICAL_SPACING = 80;

  function getNodeStyle(depth: number): string {
    if (depth === 0) return styles.rootNode;
    if (depth === 1) return styles.branchNode;
    if (depth === 2) return styles.leafNode;
    return styles.subLeafNode;
  }

  function processNode(
    node: MindMapNode,
    depth: number,
    parentId: string | null,
    yOffset: number
  ): number {
    const x = depth * HORIZONTAL_SPACING;
    
    // Calcular posición Y basada en hijos
    let totalHeight = 0;
    const childYPositions: number[] = [];

    if (node.children && node.children.length > 0) {
      let currentY = yOffset;
      node.children.forEach((child) => {
        const childHeight = processNode(
          child,
          depth + 1,
          node.id,
          currentY
        );
        childYPositions.push(currentY + childHeight / 2);
        currentY += childHeight + VERTICAL_SPACING;
        totalHeight += childHeight;
      });
      totalHeight += (node.children.length - 1) * VERTICAL_SPACING;
    } else {
      totalHeight = 40;
    }

    // Posición Y del nodo actual (centrado respecto a sus hijos)
    const y = node.children && node.children.length > 0
      ? (childYPositions[0] + childYPositions[childYPositions.length - 1]) / 2
      : yOffset + 20;

    nodes.push({
      id: node.id,
      data: { label: node.label },
      position: { x, y },
      className: `${styles.mindMapNode} ${getNodeStyle(depth)}`,
      type: 'default',
    });

    if (parentId) {
      edges.push({
        id: `${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: 'smoothstep',
        animated: depth === 1,
        style: {
          stroke: depth === 1 ? '#667eea' : '#adb5bd',
          strokeWidth: depth === 1 ? 2 : 1,
        },
      });
    }

    return totalHeight;
  }

  processNode(data.root, 0, null, 0);

  return { nodes, edges };
}

function MindMap({ data = defaultMindMapData }: MindMapProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildNodesAndEdges(data),
    [data]
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onInit = useCallback(() => {
    // Ajustar vista al iniciar
  }, []);

  if (!data || !data.root) {
    return (
      <div className={styles.emptyMindMap}>
        <svg
          className={styles.emptyIcon}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
          />
        </svg>
        <p>No hay datos para el mapa mental</p>
      </div>
    );
  }

  return (
    <div className={styles.mindMapContainer}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={2}
        attributionPosition="bottom-left"
      >
        <Background color="#e9ecef" gap={20} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            if (node.className?.includes('rootNode')) return '#667eea';
            if (node.className?.includes('branchNode')) return '#11998e';
            return '#dee2e6';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}

export default MindMap;
