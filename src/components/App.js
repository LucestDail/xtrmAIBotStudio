// react modules
import React, {
  useEffect,
  useState,
  useCallback,
  useRef
} from 'react';

// reactflow modules
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  getConnectedEdges,
  useNodesState,
  useEdgesState,
  Controls,
  applyNodeChanges,
  MiniMap,
  MarkerType,
  Background,
} from 'reactflow';

// defualt styles
import '../styles/App.css';

// reactflow styles
import 'reactflow/dist/style.css';

// Custom functions
import getId from '../modules/uuid.js'

// Custom component
import initialEdges from './init/initEdge';
import initialNodes from './init/initNode';
import XtrmEnd from './components/box/XtrmEndBox.js';
import XtrmStart from './components/box/XtrmStartBox.js';
import XtrmBox from './components/box/XtrmCustomBox.js';

// Custom options
import defaultEdgeOptions from '../options/defaultEdgeOptions';
import connectionLineStyle from '../options/connectionLineStyle';
import emptyBoxOptions from '../options/emptyBoxOptions';
import emptyEdgeOptions from '../options/emptyEdgeOption.js';
import emptyPositionOptions from '../options/emptyPositionOptions';
import newBoxOption from '../options/newBoxOption.js';
import newEdgeOption from '../options/newEdgeOption.js'

// Custom styles
import './styles/overview.css';
import './styles/index.css';

// Local variables
let nodeJson = "";

// Custom nodeTypes
const nodeTypes = {
  xtrmStart: XtrmStart,
  xtrmBox: XtrmBox,
  xtrmEnd: XtrmEnd,
};
const edgeTypes = {
  buttonedge: ButtonEdge,
};

// export default app
export default () => {

  // react component definitions
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Events Definitions
  // node change event
  const onChange = useCallback((params) => setNodes((eds) => applyNodeChanges(params, eds)), []);

  // node delete event
  const onNodesDelete = useCallback(
    (deleted) => {
      if (deleted[0].parentNode) {  // item node delete process
        setEdges(
          deleted.reduce((acc, node) => {
            const connectedEdges = getConnectedEdges([node], edges);
            const remainingEdges = acc.filter((edge) => !connectedEdges.includes(edge));
            return [...remainingEdges];
          }, edges)
        );

        setNodes(
          nodes.filter((node) => node.id !== deleted[0].id).map((node) => {
            if (node.id === deleted[0].parentNode) {
              node.height -= 40;
              node.style.height -= 40;
              node.itemNumber -= 1;
            }
            return node;
          })
        )

        nodes.filter((node) => node.id !== deleted[0].id).map((node) => {
          if (node.id === deleted[0].parentNode) {
            node.height -= 40;
            node.style.height -= 40;
            node.itemNumber -= 1;
          }
          return node;
        });

      } else {  
        setEdges(
          deleted.reduce((acc, node) => {
            const connectedEdges = getConnectedEdges([node], edges);
            const remainingEdges = acc.filter((edge) => !connectedEdges.includes(edge));
            return [...remainingEdges];
          }, edges)
        );

        setNodes(
          deleted.reduce((acc, node) => {
            const remainingNodes = acc.filter((nd) => node.id !== nd.parentNode);
            return [...remainingNodes];
          }, nodes)
        )
      }

    },
    [nodes, edges]
  );

  // node connect event
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) => addEdge({ ...params, type: 'buttonedge', animated: true, style: { stroke: '#000' } }, eds)),
    []
  );

  // node drag event
  const onDragOver = useCallback((event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }, []);

  // node drop event
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const emptyNodeId = 'empty_' + getId();
      if (typeof type === 'undefined' || !type) {
        return;
      }
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode = {
        id: 'box_' + getId(),
        type,
        sourcePosition: 'bottom',
        targetPosition: 'top',
        position,
        className: 'group-a',
        style: {
          backgroundColor: 'rgba(255, 0, 0, 0)',
          width: 200,
          height: 100,
          borderWidth: 2,
          borderRadius: 5,
          borderStyle: 'solid'
      },
        data: {
          label: `${type} node`
        },
        itemNumber: 0,
        emptyNodeId: emptyNodeId,
      };
      setNodes((nds) => nds.concat(newNode));
      if (type !== 'output') {
        const emptyNode = {
          id: emptyNodeId,
          type: 'emptyBox',
          targetPosition: 'top',
          position: {
            x: 0,
            y: 200,
          },
          className: 'group-empty',
          draggable : false,
          selectable: false,
          deletable: false,
          style: { backgroundColor: 'rgba(255, 0, 0, 0)', width: 200, height: 100},
          parentNode: newNode.id,
          itemNumber: 0,
        }
        const newEdge = {
          source: newNode.id,
          target: emptyNode.id,
          animated: true,
          draggable : false,
          style: { stroke: '#000' },
          id: 'edge_' + getId(),
          type: 'buttonedge',
          deletable : false,
          selectable: false,
          data: {emptyNode : emptyNode.id},
        }
        setEdges((eds) => eds.concat(newEdge));
        setNodes((nds) => nds.concat(emptyNode));
      }
    },
    [reactFlowInstance],
  );

  useEffect(() => {
    if (reactFlowInstance) {
      nodeJson = JSON.stringify(reactFlowInstance.toObject());
    }
  }, [nodes, edges]);

  return (
    <div className="dndflow" style={{ width: '98vw', height: '85vh' }} >
      <ReactFlowProvider>
        <Nodebar setNodes={setNodes} setEdges={setEdges} nodes={nodes} edges={edges} />
        <NodebarDetail setNodes={setNodes} />
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesDelete={onNodesDelete}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onChange={onChange}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            connectionLineStyle={connectionLineStyle}
            defaultEdgeOptions={defaultEdgeOptions}
            multiSelectionKeyCode=""
            attributionPosition="top-right"
          >
            <MiniMap style={{ height: 120 }} zoomable pannable />
            <Background color="#aaa" gap={16} />
            <Controls />
          </ReactFlow>
        </div>
        <Sidebar nodeJson={nodeJson} nodes={nodes} setNodes={setNodes} />
      </ReactFlowProvider>
    </div>
  );
};