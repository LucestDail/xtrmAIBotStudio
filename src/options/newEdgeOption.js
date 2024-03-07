import getId from '../modules/getId';
export default (newNode, emptyNode) => {
    const newEdgeOption = {
        source: newNode.id,
        target: emptyNode.id,
        animated: true,
        draggable: false,
        style: { stroke: '#000' },
        id: 'edge_' + getId(),
        type: 'buttonedge',
        deletable: false,
        selectable: false,
        data: { emptyNode: emptyNode.id }
    }
    return newEdgeOption;
};