const UndoRedoManager = {
    // Keep track of all actions performed by the user
    history: [],
    
    registerNode: (node) => {
        node.on('dragend', UndoRedoManager.recordState);
    },

    recordState: (e) => {
        const node = e.target;
        if (!node)
            return;

        UndoRedoManager.history.push(node.toJSON());
        console.log(UndoRedoManager.history);
    },
}