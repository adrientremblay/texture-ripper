const UndoRedoManager = {
    // Keep track of all actions performed by the user
    history: [],
    currentHistoryIndex: -1,
    startNode: null,

    registerNode: (node) => {
        node.on('dragstart', UndoRedoManager.recordInitialState);
        node.on('dragend', UndoRedoManager.recordAction);
        node.on('transformstart', UndoRedoManager.recordInitialState);
        node.on('transformend', UndoRedoManager.recordAction);
    },

    recordInitialState: (e) => {
        const node = e.target;
        if (!node)
            return;

        UndoRedoManager.startNode = node.toJSON();
    },

    recordAction: (e) => {
        UndoRedoManager.cleanupHistory();

        const startNode = JSON.parse(UndoRedoManager.startNode);
        const endNode = e.target;
        const nodeStage = e.target.parent.parent;

        if (!UndoRedoManager.startNode) {
            return;
        }

        const action = {
            nodeId: startNode.attrs.id,
            start: {
                x: startNode.attrs.x,
                y: startNode.attrs.y,
                rotation: startNode.attrs.rotation ? startNode.attrs.rotation : 0.0,
                scaleX: startNode.attrs.scaleX ? startNode.attrs.scaleX : 1.0,
                scaleY: startNode.attrs.scaleY ? startNode.attrs.scaleY : 1.0,
            },
            end: {
                x: endNode.attrs.x,
                y: endNode.attrs.y,
                rotation: endNode.attrs.rotation ? endNode.attrs.rotation : 0.0,
                scaleX: endNode.attrs.scaleX ? endNode.attrs.scaleX : 1.0,
                scaleY: endNode.attrs.scaleY ? endNode.attrs.scaleY : 1.0,
            },
            stage: nodeStage,
        }

        UndoRedoManager.history.push(action);
        UndoRedoManager.currentHistoryIndex++;
        console.log(action);
    },

    undo: () => {
        if (UndoRedoManager.currentHistoryIndex < 0) {
            console.error("Nothing to undo!");
            return;
        }
        
        const action = UndoRedoManager.history[UndoRedoManager.currentHistoryIndex--];

        const nodeToRestore = action.stage.findOne('#' + action.nodeId);
        if (!nodeToRestore) {
            console.error("Could not find node!");
            return;
        }
        nodeToRestore.x(action.start.x);
        nodeToRestore.y(action.start.y);
        nodeToRestore.rotation(action.start.rotation);
        nodeToRestore.scaleX(action.start.scaleX);
        nodeToRestore.scaleY(action.start.scaleY);

        console.log("History index is now at: " + UndoRedoManager.currentHistoryIndex);
    },

    redo: () => {
        if (UndoRedoManager.currentHistoryIndex >= UndoRedoManager.history.length - 1) {
            console.error("Nothing to redo!");
            return;
        }

        const action = UndoRedoManager.history[++UndoRedoManager.currentHistoryIndex];

        const nodeToRestore = action.stage.findOne('#' + action.nodeId);
        if (!nodeToRestore) {
            console.error("Could not find node!");
            return;
        }
        nodeToRestore.x(action.end.x);
        nodeToRestore.y(action.end.y);
        nodeToRestore.rotation(action.end.rotation);
        nodeToRestore.scaleX(action.end.scaleX);
        nodeToRestore.scaleY(action.end.scaleY);
        
        console.log("History index is now at: " + UndoRedoManager.currentHistoryIndex);
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
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'Z') {
                event.preventDefault();
                UndoRedoManager.redo();
            }
            if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
                event.preventDefault();
                UndoRedoManager.undo();
            }
        }); 
    }
}