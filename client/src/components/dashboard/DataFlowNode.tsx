import { useRef } from 'react';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeData {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  position: NodePosition;
}

interface DataFlowNodeProps {
  node: NodeData;
  selected?: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, position: NodePosition) => void;
}

export default function DataFlowNode({ 
  node, 
  selected = false, 
  onSelect, 
  onMove 
}: DataFlowNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!nodeRef.current) return;
    
    isDragging.current = true;
    startPos.current = {
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    };
    
    onSelect(node.id);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    
    const canvas = nodeRef.current?.parentElement;
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const nodeWidth = nodeRef.current?.offsetWidth || 0;
    const nodeHeight = nodeRef.current?.offsetHeight || 0;
    
    // Calculate new position
    const x = Math.max(0, Math.min(canvasRect.width - nodeWidth, e.clientX - startPos.current.x - canvasRect.left));
    const y = Math.max(0, Math.min(canvasRect.height - nodeHeight, e.clientY - startPos.current.y - canvasRect.top));
    
    onMove(node.id, { x, y });
  };
  
  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  // Status badge colors based on status
  const getStatusColors = () => {
    switch (node.status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'output':
      case 'storage':
        return 'bg-purple-100 text-purple-800';
      case 'filter':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get type colors based on node type
  const getTypeStyles = () => {
    switch (node.type.toLowerCase()) {
      case 'source':
      case 'input':
        return { title: 'text-primary-700', border: 'border-primary-300' };
      case 'filter':
      case 'transform':
        return { title: 'text-blue-700', border: 'border-blue-300' };
      case 'output':
      case 'export':
        return { title: 'text-purple-700', border: 'border-purple-300' };
      default:
        return { title: 'text-secondary-700', border: 'border-secondary-300' };
    }
  };
  
  const typeStyles = getTypeStyles();
  
  return (
    <div
      ref={nodeRef}
      className={cn(
        'absolute p-3 bg-white border rounded-lg shadow-sm data-flow-node',
        typeStyles.border,
        selected ? 'ring-2 ring-primary-500' : ''
      )}
      style={{
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
        cursor: 'move',
        zIndex: selected ? 10 : 1
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={cn("text-xs font-semibold", typeStyles.title)}>{node.title}</span>
        <MoreVertical className="text-secondary-400" size={16} />
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-secondary-600">{node.description}</span>
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium", getStatusColors())}>
          {node.status}
        </span>
      </div>
    </div>
  );
}
