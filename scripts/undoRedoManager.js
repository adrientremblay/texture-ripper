const UndoRedoManager = {
    // Keep track of all actions performed by the user
    history: [],
    currentHistoryIndex: -1,
    
    registerNode: (node) => {
        node.on('dragend', UndoRedoManager.recordState);
    },

    recordState: (e) => {
        const node = e.target;
        const nodeStage = e.target.parent.parent;
        console.log(e);

        if (!node || !nodeStage)
            return;

        UndoRedoManager.addToHistory(node,nodeStage);
    },

    addToHistory: (node, stage) => {
        UndoRedoManager.cleanupHistory();

        UndoRedoManager.history.push({
            node:  node.toJSON(),
            stage: stage,
        });
        UndoRedoManager.currentHistoryIndex++;

        console.log(UndoRedoManager.history);
    },

    undo: () => {
        if (UndoRedoManager.currentHistoryIndex < 0)
            return;
        
        UndoRedoManager.currentHistoryIndex--;
        console.log("History index is now at: " + UndoRedoManager.currentHistoryIndex);
        UndoRedoManager.restore();
    },

    /**
     * Restore the element at the current history index
     */
    restore: () => {
        const currentHistoryJson = UndoRedoManager.history[UndoRedoManager.currentHistoryIndex].node;
        const currentHistoryObj = JSON.parse(currentHistoryJson);
        const stage = UndoRedoManager.history[UndoRedoManager.currentHistoryIndex].stage;
        const nodeToRestore = stage.findOne('#' + currentHistoryObj.attrs.id);
        console.log(nodeToRestore);
        nodeToRestore.x(currentHistoryObj.attrs.x);
        nodeToRestore.y(currentHistoryObj.attrs.y);
    },

    /**
     * Deletes all elements of history after the current history index. This is because if the user undos
     * some actions then does an action, we dont want to retain the out of date actions in the history.
     */
    cleanupHistory: () => {
        UndoRedoManager.history = UndoRedoManager.history.slice(0, UndoRedoManager.currentHistoryIndex+1);
    },

    /**
     * Add event listeners for ctrl+z and ctrl+shift+z
     */
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