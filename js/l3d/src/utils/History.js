/**
 * Represents the history of an object
 * @constructor
 * @memberOf L3D
 */
L3D.History = function() {
    /**
     * Stores the different states of the object
     * @type {Object[]}
     */
    this.states = [];

    /**
     * Represents the position in the history we're  at
     * @type {Number}
     */
    this.index = -1;

    /**
     * Represents the number of elements in the history
     * @type {Number}
     */
    this.size = 0;
};

/**
 * Appends a new state at the end of the history
 * @param {Object} state the state to append
 */
L3D.History.prototype.addState = function(state) {
    ++this.index;
    this.size = this.index + 1;
    this.states[this.size-1] = state;
};

/**
 * Returns the previous state and change the index to the previous state (so you can redo)
 */
L3D.History.prototype.undo = function() {
    if (this.undoable()) {
        this.index--;
        return this.currentState();
    }
};

/**
 * Returns the next state and change the index to the next state (so you can re-undo)
 */
L3D.History.prototype.redo = function() {
    if (this.redoable()) {
        this.index++;
        return this.currentState();
    }
};

/**
 * Checks if there is a undo possibility
 * @returns {Boolean} true if undo is possible, false otherwise
 */
L3D.History.prototype.undoable = function() {
    return this.index > 0;
};

/**
 * Checks if there is a redo possibility
 * @returns {Boolean} true if redo is possible, false otherwise
 */
L3D.History.prototype.redoable = function() {
    return this.index < this.size - 1;
};

/**
 * Returns the current state in the history
 * @returns {Object} the current state in the history
 */
L3D.History.prototype.currentState = function() {
    return this.states[this.index];
};
