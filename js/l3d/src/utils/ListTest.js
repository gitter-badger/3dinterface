var list = new utils.List();
var size = 100;

for (var i = 0; i < size; i++) {
    list.push(Math.random());
}

// For with C++-style iterator
// for (var it = list.begin(); it.lowerThan(list.end()); it.next()) {
//     console.log(it.get());
// }

console.log(false === list.isSorted());
list.sort();
console.log(list.isSorted());

console.log(size === list.size());
