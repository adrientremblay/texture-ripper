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
        console.log(action.start);

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
        if (UndoRedoManager.currentHistoryIndex >= UndoRedoManager.history.length - 1)
            return;
        
        UndoRedoManager.currentHistoryIndex++;
        console.log("History index is now at: " + UndoRedoManager.currentHistoryIndex);
        UndoRedoManager.restore();
    },

    /*
    restore: () => { // TODO: There are some issues when there are multiple textures
        const currentHistoryJson = UndoRedoManager.history[UndoRedoManager.currentHistoryIndex].node;
        const currentHistoryObj = JSON.parse(currentHistoryJson);
        const stage = UndoRedoManager.history[UndoRedoManager.currentHistoryIndex].stage;
        const nodeToRestore = stage.findOne('#' + currentHistoryObj.attrs.id);
        nodeToRestore.x(currentHistoryObj.attrs.x);
        nodeToRestore.y(currentHistoryObj.attrs.y);
        nodeToRestore.rotation(currentHistoryObj.attrs.rotation ? currentHistoryObj.attrs.rotation : 0);
        nodeToRestore.scaleX(currentHistoryObj.attrs.scaleX ? currentHistoryObj.attrs.scaleX : 1.0);
        nodeToRestore.scaleY(currentHistoryObj.attrs.scaleY ? currentHistoryObj.attrs.scaleY : 1.0);
    },
    */

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