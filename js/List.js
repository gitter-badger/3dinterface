var utils = (function() {

var utils = {};

// Defines a double linked-list class
utils.List = function() {
    this._size = 0;
    this._begin = null;
    this._end = null;
}

// Returns the number of element of a list
utils.List.prototype.size = function() {
    return this._size;
}

// Pushes an element to the end of a class
utils.List.prototype.push = function(element) {
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
}

// Sort the list
utils.List.prototype.sort = function(comparator) {

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
}

// Remove last element and returns it
utils.List.prototype.pop = function() {
    var tmp = this._end;
    this._end = null;
    return tmp.data;
}

// Apply a function to each element of the list
utils.List.prototype.forEach = function(callback) {
    var chain = this._begin;

    while (chain !== null) {
        callback(chain.data);
        chain = chain.next;
    }
}

// Apply a function to each element of the list (starting from the end)
utils.List.prototype.forEachInverse = function(callback) {
    var chain = this._end;

    while (chain !== null) {
        callback(chain.data);
        chain = chain.prev;
    }
}

// Get ith element of the list
utils.List.prototype.at = function(ith) {
    if (ith < 0 || ith >= this.size()) {
        return null;
    }

    var chain = this._begin;
    for (var i = 0; i < ith; i++) {
        chain = chain.next;
    }

    return chain.data;
}

// Clear the list
utils.List.prototype.clear = function() {
    this._begin = null;
    this._end = null;
    this._size = 0;
}

// Insert an element at the right place in the list
// Precondition : list must be sorted
utils.List.prototype.insertSorted = function(elt, comparator) {
    if (comparator === undefined) {
        comparator = priv.defaultComparator;
    }

    if (this._begin === null) {
        // Inserted in front (empty list)
        this.push(elt);
    } else if (comparator(this._begin.data, elt) > 0) {
        // Inserted in front (smallest element)
        var newElement = {prev: null, next: this._begin, data: elt};

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
                var newElement = {data: elt, next: chain.next, prev: chain};
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
}

// Check if a list is sorted of not
utils.List.prototype.isSorted = function(comparator) {
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
}

// Gives an iterator to the begin of the list
utils.List.prototype.begin = function() {
    return new utils.List.Iterator(this._begin, 0);
}

// Gives an iterator to the end of the list
utils.List.prototype.end = function() {
    return new utils.List.Iterator(this._end, this.size() - 1);
}

// Class iterator
utils.List.Iterator = function(chain, counter) {
    this._chain = chain;
    this._counter = counter;
}

// Go to the next element
utils.List.Iterator.prototype.next = function() {
    this._chain = this._chain.next;
    this._counter ++;
}

// Go to the previous element
utils.List.Iterator.prototype.prev = function() {
    this._chain = this._chain.prev;
    this._counter --;
}

// Return the current element
utils.List.Iterator.prototype.get = function() {
    return this._chain.data;
}

// Check if there is another element next
utils.List.Iterator.prototype.hasNext = function() {
    return this._chain.next !== null;
}

// Check if there is another element before
utils.List.Iterator.prototype.hasPrev = function() {
    return this._chain.prev !== null;
}

// Compares to another iterator of the same list
utils.List.Iterator.prototype.lowerThan = function(it2) {
    return utils.distance(this, it2) > 0;
}

// Compares to another iterator of the same list
utils.List.Iterator.prototype.greaterThan = function(it2) {
    return utils.distance(this, it2) < 0;
}

// Returns the distance between two iterators of the same list
utils.distance = function(it1, it2) {
    return it2._counter - it1._counter;
}

priv = {};

priv.defaultComparator = function(a,b) {
    if (a < b)
        return -1;
    if (a > b)
        return 1;
    return 0;
}

// Support for NodeJs
if (typeof module !== 'undefined' && module.exports) {
    module.exports = utils;
} else {
    return utils;
}

})();
