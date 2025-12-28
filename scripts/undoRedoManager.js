const UndoRedoManager = {
    // Keep track of all actions performed by the user
    history: [],
    currentHistoryIndex: -1,
    
    registerNode: (node) => {
        node.on('dragend', UndoRedoManager.recordState);
    },

    recordState: (e) => {
        const node = e.target;
        const nodeParent = e.target.parent.canvas;
        console.log(e);

        if (!node || !nodeParent)
            return;

        UndoRedoManager.history.push({
            node:  node.toJSON(),
            parent: parent,
        });
        UndoRedoManager.currentHistoryIndex++;

        console.log(UndoRedoManager.history);
    },

    undo: () => {
        if (UndoRedoManager.currentHistoryIndex < 0)
            return;
        
        const historyElement = UndoRedoManager.history[UndoRedoManager.currentHistoryIndex--];
        //historyElement.parent.create(historyElement.node);
        Konva.Node.create(historyElement.node);
        console.log("created node");
    },

    init: () => {
        document.addEventListener('keydown', (event) => {
            // Check if Ctrl or Command (Mac) is pressed along with 'z'
            if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
                event.preventDefault();
                UndoRedoManager.undo();
            }
        }); 
    }
}