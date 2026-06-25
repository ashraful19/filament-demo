(function () {
    const LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40, TAB = 9, ENTER = 13, ESC = 27, SPACE = 32;
    const KEY_C = 67, KEY_V = 86, KEY_Z = 90;

    document.addEventListener('keydown', function (event) {
        var store = Alpine.store('tableEditor');
        if (!store || !store.activeCell) return;

        var meta = event.metaKey || event.ctrlKey;
        var shift = event.shiftKey;
        var key = event.keyCode;

        if (meta && key === ENTER) {
            event.preventDefault();
            store.batchSave();
            return;
        }

        if (meta && shift && key === KEY_Z) {
            event.preventDefault();
            store.redo();
            return;
        }

        if (meta && key === KEY_Z) {
            event.preventDefault();
            store.undo();
            return;
        }

        if (key === TAB) {
            event.preventDefault();
            store.navigate(shift ? 'prev' : 'next');
            return;
        }

        if (key === ESC) {
            event.preventDefault();
            store.cancelEdit();
            return;
        }

        if (key === UP) { event.preventDefault(); store.navigate('up'); return; }
        if (key === DOWN) { event.preventDefault(); store.navigate('down'); return; }
        if (key === LEFT) { event.preventDefault(); store.navigate('left'); return; }
        if (key === RIGHT) { event.preventDefault(); store.navigate('right'); return; }

        if (meta && key === KEY_C) {
            event.preventDefault();
            store.copyCell();
            return;
        }

        if (meta && key === KEY_V) {
            event.preventDefault();
            store.pasteCell();
            return;
        }
    });
})();
