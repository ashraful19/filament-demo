document.addEventListener('alpine:init', () => {
    Alpine.store('tableEditor', {
        dirtyCells: {},
        cellStates: {},
        activeCell: null,
        focusTarget: null,
        batchState: 'idle',
        tableId: null,
        editableColumns: [],
        saveOnBlur: false,
        saveOnEnter: true,
        wrapNavigation: false,
        undoStack: [],
        redoStack: [],
        maxUndo: 100,
        clipboard: null,

        init(tableId, config) {
            this.tableId = tableId;
            this.editableColumns = config.editableColumns || [];
            this.saveOnBlur = config.saveOnBlur ?? false;
            this.saveOnEnter = config.saveOnEnter ?? true;
            this.wrapNavigation = config.wrapNavigation ?? false;
        },

        markDirty(recordId, column, original, current) {
            if (original === current) return;
            const key = `${recordId}:${column}`;
            this.pushUndo(key, original, current);
            this.dirtyCells[key] = { original, current, column };
            this.cellStates[key] = 'dirty';
            this.notifyBadge();
        },

        revertCell(recordId, column) {
            const key = `${recordId}:${column}`;
            delete this.dirtyCells[key];
            this.cellStates[key] = 'idle';
            this.notifyBadge();
        },

        clearDirty(recordId, column) {
            const key = `${recordId}:${column}`;
            delete this.dirtyCells[key];
            this.cellStates[key] = 'idle';
            this.notifyBadge();
        },

        collectDirty() {
            return Object.entries(this.dirtyCells).map(([key, data]) => {
                const [recordId, column] = key.split(':');
                return { record_id: recordId, column, value: data.current, original: data.original };
            });
        },

        getDirtyCount() {
            return Object.keys(this.dirtyCells).length;
        },

        setActiveCell(recordId, column, rowIndex, colIndex) {
            this.activeCell = { recordId, column, rowIndex, colIndex };
        },

        setFocus(recordId, column) {
            this.focusTarget = { recordId, column };
        },

        batchSave() {
            if (this.getDirtyCount() === 0) return;
            this.batchState = 'saving';
            const changes = this.collectDirty();
            const self = this;
            if (typeof $wire !== 'undefined') {
                $wire.call('batchSave', { changes }).then(function (result) {
                    self.batchState = 'idle';
                    if (result.errors && result.errors.length > 0) {
                        result.errors.forEach(function (err) {
                            self.cellStates[err.record_id + ':' + err.column] = 'error';
                        });
                    }
                    if (result.saved && result.saved.length > 0) {
                        result.saved.forEach(function (s) {
                            self.cellStates[s.record_id + ':' + s.column] = 'success';
                            self.clearDirty(s.record_id, s.column);
                            setTimeout(function () {
                                self.cellStates[s.record_id + ':' + s.column] = 'idle';
                            }, 500);
                        });
                        self.undoStack = [];
                        self.redoStack = [];
                    }
                }).catch(function () {
                    self.batchState = 'idle';
                });
            }
        },

        cancelEdit() {
            if (this.activeCell) {
                const key = `${this.activeCell.recordId}:${this.activeCell.column}`;
                this.cellStates[key] = 'idle';
                delete this.dirtyCells[key];
            }
        },

        navigate(direction) {
            if (!this.activeCell) return;

            const next = this.findNextEditableCell(this.activeCell, direction);
            if (!next) return;

            this.saveAndNavigate(direction);
        },

        pushUndo(cellKey, oldValue, newValue) {
            this.undoStack.push({ cellKey, oldValue, newValue });
            if (this.undoStack.length > this.maxUndo) {
                this.undoStack.shift();
            }
            this.redoStack = [];
        },

        undo() {
            if (this.undoStack.length === 0) return;
            const action = this.undoStack.pop();
            this.redoStack.push(action);
            const cell = this.dirtyCells[action.cellKey];
            if (cell) {
                cell.current = action.oldValue;
                if (cell.current === cell.original) {
                    delete this.dirtyCells[action.cellKey];
                    this.cellStates[action.cellKey] = 'idle';
                }
            }
            this.notifyBadge();
        },

        redo() {
            if (this.redoStack.length === 0) return;
            const action = this.redoStack.pop();
            this.undoStack.push(action);
            this.dirtyCells[action.cellKey] = { original: action.oldValue, current: action.newValue, column: '' };
            this.cellStates[action.cellKey] = 'dirty';
            this.notifyBadge();
        },

        copyCell() {
            if (!this.activeCell) return;
            const key = `${this.activeCell.recordId}:${this.activeCell.column}`;
            const cell = this.dirtyCells[key];
            this.clipboard = {
                value: cell ? cell.current : '',
                column: this.activeCell.column,
            };
        },

        pasteCell() {
            if (!this.activeCell || !this.clipboard) return;
            const key = `${this.activeCell.recordId}:${this.activeCell.column}`;
            const cell = this.dirtyCells[key];
            const oldValue = cell ? cell.original : '';
            this.markDirty(this.activeCell.recordId, this.activeCell.column, oldValue, this.clipboard.value);
        },

        restoreFocus() {
            if (!this.focusTarget) return;
            const el = document.querySelector(
                `[data-cell-record="${this.focusTarget.recordId}"][data-cell-column="${this.focusTarget.column}"]`
            );
            if (el) el.focus();
            this.focusTarget = null;
        },

        findNextEditableCell(from, direction) {
            const cells = this.getEditableCells();
            if (cells.length === 0) return null;

            const idx = cells.findIndex(
                c => c.recordId === from.recordId && c.column === from.column
            );

            if (idx === -1) return cells[0] || null;

            let nextIdx = idx;

            if (direction === 'next' || direction === 'down') {
                nextIdx = idx + 1;
            } else if (direction === 'prev' || direction === 'up') {
                nextIdx = idx - 1;
            } else if (direction === 'left') {
                const fromColIdx = this.editableColumns.indexOf(from.column);
                if (fromColIdx > 0) {
                    const prevCol = this.editableColumns[fromColIdx - 1];
                    return cells.find(c => c.recordId === from.recordId && c.column === prevCol) || null;
                }
                if (this.wrapNavigation) {
                    const lastCol = this.editableColumns[this.editableColumns.length - 1];
                    const prevRowCells = cells.filter(
                        c => c.rowIndex === (from.rowIndex || 0) - 1
                    );
                    if (prevRowCells.length > 0) {
                        return prevRowCells.find(c => c.column === lastCol) || prevRowCells[prevRowCells.length - 1];
                    }
                }
                return null;
            } else if (direction === 'right') {
                const fromColIdx = this.editableColumns.indexOf(from.column);
                if (fromColIdx < this.editableColumns.length - 1) {
                    const nextCol = this.editableColumns[fromColIdx + 1];
                    return cells.find(c => c.recordId === from.recordId && c.column === nextCol) || null;
                }
                if (this.wrapNavigation) {
                    const firstCol = this.editableColumns[0];
                    const nextRowCells = cells.filter(
                        c => c.rowIndex === (from.rowIndex || 0) + 1
                    );
                    if (nextRowCells.length > 0) {
                        return nextRowCells.find(c => c.column === firstCol) || nextRowCells[0];
                    }
                }
                return null;
            }

            if (this.wrapNavigation) {
                if (nextIdx >= cells.length) nextIdx = 0;
                if (nextIdx < 0) nextIdx = cells.length - 1;
            }

            if (nextIdx >= 0 && nextIdx < cells.length) {
                return cells[nextIdx];
            }

            return null;
        },

        getEditableCells() {
            const cells = [];
            const table = document.getElementById(this.tableId);
            if (!table) return cells;

            const cellEls = table.querySelectorAll('[data-cell-column]');
            cellEls.forEach(el => {
                const recordId = el.getAttribute('data-cell-record');
                const column = el.getAttribute('data-cell-column');
                if (recordId && column) {
                    cells.push({
                        recordId,
                        column,
                        rowIndex: parseInt(el.getAttribute('data-cell-row') || '0', 10),
                        colIndex: this.editableColumns.indexOf(column),
                    });
                }
            });

            return cells;
        },

        saveAndNavigate(direction) {
            const next = this.findNextEditableCell(this.activeCell, direction);
            if (!next) return;

            this.activeCell = { recordId: next.recordId, column: next.column, rowIndex: next.rowIndex, colIndex: next.colIndex };

            Alpine.nextTick(() => {
                const el = document.querySelector(
                    `[data-cell-record="${next.recordId}"][data-cell-column="${next.column}"]`
                );
                if (el) {
                    const input = el.querySelector('input, textarea, select');
                    if (input) {
                        input.focus();
                        input.select();
                    } else {
                        el.focus();
                    }
                }
            });
        },

        notifyBadge() {
            window.dispatchEvent(new CustomEvent('table-dirty-count', { detail: { count: this.getDirtyCount() } }));
        },

        destroy() {
            this.dirtyCells = {};
            this.cellStates = {};
            this.activeCell = null;
            this.focusTarget = null;
            this.undoStack = [];
            this.redoStack = [];
        },
    });
});
