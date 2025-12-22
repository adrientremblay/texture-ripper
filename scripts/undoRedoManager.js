const UndoRedoManager = {
    // Keep track of all actions performed by the user
    history: [],
    currentHistoryIndex: -1,
    
    registerNode: (node) => {
        node.on('dragend', UndoRedoManager.recordState);
    },

    recordState: (e) => {
        const node = e.target;
        if (!node)
            return;


        UndoRedoManager.history.push(node.toJSON());
        currentHistoryIndex++;

        console.log(UndoRedoManager.history);
    },

    init: () => {
        console.log('init');
        document.addEventListener('keydown', (event) => {
            // Check if Ctrl or Command (Mac) is pressed along with 'z'
            if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
                event.preventDefault();
                console.log('Ctrl+Z');
            }
        }); 
    }
}