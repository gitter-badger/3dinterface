// Strict parseInt
module.exports.filterInt = function(value) {
    if(/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
        return Number(value);
    return NaN;
};
