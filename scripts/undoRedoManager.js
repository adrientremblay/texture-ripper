const UndoRedoManager = {
    // Keep track of all actions performed by the user
    history: [],
    
    registerNode: (node) => {
        node.on('dragend', UndoRedoManager.recordState);
    },

    recordState: (e) => {
        console.log('recording state');
        console.log(e);
        //console.log(node.toJSON());
    },
}