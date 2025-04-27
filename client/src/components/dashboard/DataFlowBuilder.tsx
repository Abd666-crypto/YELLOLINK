import { useState } from 'react';
import { Save, Play, Globe, Filter, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FaTwitter, FaInstagram, FaSort } from 'react-icons/fa';
import DataFlowNode, { NodeData, NodePosition } from './DataFlowNode';

export interface Connection {
  sourceId: string;
  targetId: string;
}

export interface DataFlow {
  nodes: NodeData[];
  connections: Connection[];
}

// Initial default nodes
const defaultNodes: NodeData[] = [
  {
    id: '1',
    title: 'E-commerce Scraper',
    description: 'amazon.com',
    type: 'source',
    status: 'Active',
    position: { x: 50, y: 50 }
  },
  {
    id: '2',
    title: 'Product Filter',
    description: 'Price > $50',
    type: 'filter',
    status: 'Filter',
    position: { x: 250, y: 70 }
  },
  {
    id: '3',
    title: 'CSV Export',
    description: 'products.csv',
    type: 'output',
    status: 'Output',
    position: { x: 450, y: 50 }
  },
  {
    id: '4',
    title: 'Twitter API',
    description: '#datascience',
    type: 'source',
    status: 'Active',
    position: { x: 50, y: 170 }
  },
  {
    id: '5',
    title: 'Sentiment Analysis',
    description: 'ML Model',
    type: 'transform',
    status: 'Processing',
    position: { x: 250, y: 190 }
  },
  {
    id: '6',
    title: 'Database',
    description: 'MongoDB',
    type: 'output',
    status: 'Storage',
    position: { x: 450, y: 170 }
  }
];

// Default connections
const defaultConnections: Connection[] = [
  { sourceId: '1', targetId: '2' },
  { sourceId: '2', targetId: '3' },
  { sourceId: '4', targetId: '5' },
  { sourceId: '5', targetId: '6' }
];

export default function DataFlowBuilder() {
  const [nodes, setNodes] = useState<NodeData[]>(defaultNodes);
  const [connections, setConnections] = useState<Connection[]>(defaultConnections);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  const handleNodeSelect = (id: string) => {
    setSelectedNodeId(id);
  };
  
  const handleNodeMove = (id: string, position: NodePosition) => {
    setNodes(nodes.map(node => 
      node.id === id ? { ...node, position } : node
    ));
  };
  
  const handleAddNode = (type: string) => {
    const id = `node-${Date.now()}`;
    const newNode: NodeData = {
      id,
      title: `New ${type}`,
      description: 'Configure me',
      type,
      status: 'New',
      position: { x: 100, y: 100 }
    };
    
    setNodes([...nodes, newNode]);
    setSelectedNodeId(id);
  };
  
  const handleSaveFlow = () => {
    // In a real app, this would make an API call to save the flow
    console.log('Saving flow:', { nodes, connections });
    // Show a toast notification
  };
  
  const handleRunFlow = () => {
    // In a real app, this would trigger the flow execution
    console.log('Running flow');
    // Show a toast notification
  };
  
  // Calculate connection lines
  const renderConnections = () => {
    return connections.map((connection, index) => {
      const sourceNode = nodes.find(node => node.id === connection.sourceId);
      const targetNode = nodes.find(node => node.id === connection.targetId);
      
      if (!sourceNode || !targetNode) return null;
      
      // Calculate connection points (center of nodes)
      const sourceX = sourceNode.position.x + 75; // Approximating node width/2
      const sourceY = sourceNode.position.y + 30; // Approximating node height/2
      const targetX = targetNode.position.x + 75;
      const targetY = targetNode.position.y + 30;
      
      // Calculate line length and angle
      const dx = targetX - sourceX;
      const dy = targetY - sourceY;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      
      return (
        <div
          key={`conn-${index}`}
          className="data-connector"
          style={{
            left: `${sourceX}px`,
            top: `${sourceY}px`,
            width: `${length}px`,
            transform: `rotate(${angle}deg)`
          }}
        />
      );
    });
  };
  
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium leading-6 text-secondary-900">Visual Data Flow Builder</h3>
        <div>
          <Button variant="outline" size="sm" className="mr-3" onClick={handleSaveFlow}>
            <Save size={16} className="mr-2" />
            Save Flow
          </Button>
          <Button size="sm" onClick={handleRunFlow}>
            <Play size={16} className="mr-2" />
            Run Flow
          </Button>
        </div>
      </div>
      
      <div className="p-6 mt-4 bg-white rounded-lg shadow">
        <div className="flex mb-4 space-x-3 overflow-x-auto pb-2">
          <Button
            variant="outline"
            size="sm"
            className="px-3 py-2 text-xs"
            onClick={() => handleAddNode('source')}
          >
            <Globe size={14} className="mr-1" /> 
            Website Source
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-3 py-2 text-xs"
            onClick={() => handleAddNode('twitter')}
          >
            <FaTwitter size={14} className="mr-1" /> 
            Twitter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-3 py-2 text-xs"
            onClick={() => handleAddNode('instagram')}
          >
            <FaInstagram size={14} className="mr-1" /> 
            Instagram
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-3 py-2 text-xs"
            onClick={() => handleAddNode('filter')}
          >
            <Filter size={14} className="mr-1" /> 
            Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-3 py-2 text-xs"
            onClick={() => handleAddNode('transform')}
          >
            <FaSort size={14} className="mr-1" /> 
            Transform
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="px-3 py-2 text-xs"
            onClick={() => handleAddNode('storage')}
          >
            <Database size={14} className="mr-1" /> 
            Store
          </Button>
        </div>
        
        <div className="relative min-h-[400px] border rounded-lg border-secondary-200 bg-secondary-50" id="flow-canvas">
          {/* Render the connection lines */}
          {renderConnections()}
          
          {/* Render all nodes */}
          {nodes.map(node => (
            <DataFlowNode
              key={node.id}
              node={node}
              selected={node.id === selectedNodeId}
              onSelect={handleNodeSelect}
              onMove={handleNodeMove}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
