export default {
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