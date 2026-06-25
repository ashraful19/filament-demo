(function () {
    document.addEventListener('livewire:navigating', function () {
        var store = Alpine.store('tableEditor');
        if (!store || !store.activeCell) return;

        store.focusTarget = {
            recordId: store.activeCell.recordId,
            column: store.activeCell.column,
        };
    });

    document.addEventListener('livewire:navigated', function () {
        var store = Alpine.store('tableEditor');
        if (!store || !store.focusTarget) return;

        Alpine.nextTick(function () {
            store.restoreFocus();
        });
    });
})();
