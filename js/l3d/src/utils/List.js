/**
 * @namespace
 * @memberof L3D
 */
L3D.utils = (function() {

var utils = {};

/**
 * @constructor
 * @description Linked list in javascript
 * @memberof L3D.utils
 */
var List = function() {

    /**
     * @private
     * @type {Number}
     * @description number of elements in the list
     */
    this._size = 0;

    /**
     * @private
     * @type {Object}
     * @description first chain element of the list
     */
    this._begin = null;

    /**
     * @private
     * @type {Object}
     * @description last chain element of the list
     */
    this._end = null;
};

/**
 * Size of the list
 * Complexity O(1)
 * @returns {Number} the number of elements in the list
 */
List.prototype.size = function() {
    return this._size;
};

/**
 * Push an element at the end of the list
 * Complexity O(1)
 * @param element {Object} object to push at the end of the list
 */
List.prototype.push = function(element) {
    if (this._size === 0) {
        this._begin = { data : element, next: null, prev: null };
        this._end = this._begin;
        this._size = 1;
    } else {
        var newObject = { data: element, next: null, prev: this._end };
        this._end.next = newObject;
        this._end = newObject;
        this._size++;
    }
};

/**
 * Sorts the list by creating an array, sorting it, and recopying it to the list
 * Complexity O(size() * log (size()))
 */
List.prototype.sort = function(comparator) {

    if (comparator === undefined) {
        comparator = priv.defaultComparator;
    }

    var array = [];
    this.forEach(function(elt) {
        array.push(elt);
    });

    array.sort(function(a, b) {
        return comparator(a, b);
    });

    var size = this.size();
    this.clear();

    for (var i = 0; i < size; i++) {
        this.push(array[i]);
    }
};

/**
 * Removes and returns the last element of the list
 * Complexity O(1)
 * @returns {Object} the last element of the list
 */
List.prototype.pop = function() {
    var tmp = this._end;
    this._end = null;
    return tmp.data;
};

/**
 * Apply a call back to each element of the list
 * Complexity O(size())
 * @param callback {function} callback to call on all elements of the list
 */
List.prototype.forEach = function(callback) {
    var chain = this._begin;

    while (chain !== null) {
        callback(chain.data);
        chain = chain.next;
    }
};

/**
 * Apply a call back to each element of the list in reverse order
 * Complexity O(size())
 * @param callback {function} callback to call on all elements of the list in reverse order
 */
List.prototype.forEachInverse = function(callback) {
    var chain = this._end;

    while (chain !== null) {
        callback(chain.data);
        chain = chain.prev;
    }
};

/**
 * Get the ith element of the list
 * Complexity O(ith)
 * @param ith {Number} index of the element to get
 * @returns {Object} the ith element if it exists, null otherwise
 */
List.prototype.at = function(ith) {
    if (ith < 0 || ith >= this.size()) {
        return null;
    }

    var chain = this._begin;
    for (var i = 0; i < ith; i++) {
        chain = chain.next;
    }

    return chain.data;
};

/**
 * Empty the list
 */
List.prototype.clear = function() {
    this._begin = null;
    this._end = null;
    this._size = 0;
};

/**
 * Insert an element at the right place in a sorted list
 * Precondition : the list must be sorted
 * Complexity : O(i) where i is the number of elements lower than elt
 * @param elt {Object} element to add
 * @param comparator {function} classic js comparator
 */
List.prototype.insertSorted = function(elt, comparator) {
    var newElement;

    if (comparator === undefined) {
        comparator = priv.defaultComparator;
    }

    if (this._begin === null) {
        // Inserted in front (empty list)
        this.push(elt);
    } else if (comparator(this._begin.data, elt) > 0) {
        // Inserted in front (smallest element)
        newElement = {prev: null, next: this._begin, data: elt};

        this._begin.prev = newElement;

        this._begin = newElement;
        this._size ++;

    } else if (comparator(this._end.data, elt) < 0) {
        // Inserted in end
        this.push(elt);
    } else {
        // Inserted in the middle
        var chain = this._begin;

        while (chain.next !== null) {
            // If chain < elt < chain.next
            if (comparator(chain.next.data, elt) > 0) {
                newElement = {data: elt, next: chain.next, prev: chain};
                if (chain.next) {
                    chain.next.prev = newElement;
                }
                chain.next = newElement;
                this._size ++;
                return;
            }

            // Next step
            chain = chain.next;
        }
    }
};

/**
 * Checks if a list is sorted
 * Complexity : O(size()) if the list is sorted, O(i) where i is the first non-sorted element in the list
 * @param comparator {function} classic js comparator
 * @returns {Boolean} true if the list is sorted, false otherwise
 */
List.prototype.isSorted = function(comparator) {
    var chain = this._begin;

    if (comparator === undefined) {
        comparator = priv.defaultComparator;
    }

    while (chain.next !== null) {
        if (comparator(chain.data, chain.next.data) > 0) {
            return false;
        }
        chain = chain.next;
    }

    return true;
};

/**
 * Returns an iterator to the begin of the list
 * @returns {Iterator} an interator to the first element
 */
List.prototype.begin = function() {
    return new Iterator(this._begin, 0);
};

/**
 * Returns an iterator to the end of the list
 * @returns {Iterator} an interator to the first element
 */
List.prototype.end = function() {
    return new Iterator(this._end, this.size() - 1);
};

/**
 * @constructor
 * @description Reprensents an iterator to an element of a list
 * @param chain {Object} chain element of a list
 * @param counter {Number} index of the current element
 * @memberof L3D.utils
 */
var Iterator = function(chain, counter) {
    this._chain = chain;
    this._counter = counter;
};

/**
 * Go to the next element
 * @method
 */
Iterator.prototype.next = function() {
    this._chain = this._chain.next;
    this._counter ++;
};

/**
 * Go to the previous element
 * @method
 */
Iterator.prototype.prev = function() {
    this._chain = this._chain.prev;
    this._counter --;
};

/**
 * Returns the current element
 * @method
 * @returns {Object} current element
 */
Iterator.prototype.get = function() {
    return this._chain.data;
};

/**
 * Checks if there is a element after the current element
 * @method
 * @returns {Boolean} true if the element exists, false otherwise
 */
Iterator.prototype.hasNext = function() {
    return this._chain.next !== null;
};

/**
 * Checks if there is a element before the current element
 * @method
 * @returns {Boolean} true if the element exists, false otherwise
 */
Iterator.prototype.hasPrev = function() {
    return this._chain.prev !== null;
};

/**
 * Compares two iterators of the same list
 * @param it2 {Iterator} second iterator of the comparison
 * @returns {Boolean} result of this < it2
 */
Iterator.prototype.lowerThan = function(it2) {
    return distance(this, it2) > 0;
};

/**
 * Compares two iterators of the same list
 * @method
 * @param it2 {Iterator} second iterator of the comparison
 * @returns {Boolean} result of this > it2
 */
Iterator.prototype.greaterThan = function(it2) {
    return distance(this, it2) < 0;
};

/**
 * Compute the distance between two iterators
 * @method
 * @private
 * @param it1 {Iterator} first iterator of the computation
 * @param it2 {Iterator} second iterator of the computation
 * @returns {Number} distance between it1 and it2
 */
var distance = function(it1, it2) {
    return it2._counter - it1._counter;
};

priv = {};

priv.defaultComparator = function(a,b) {
    if (a < b)
        return -1;
    if (a > b)
        return 1;
    return 0;
};

utils.List = List;
utils.Iterator = Iterator;

return utils;

})();
