var container = document.getElementById('content');

function print(text) {
    var content = document.createTextNode(text);
    var newLine = document.createElement('br');
    container.appendChild(content);
    container.appendChild(newLine);
}

function toString(variable) {
    if (variable instanceof THREE.Vector3) {
        return variable.x + ', ' + variable.y + ', ' + variable.z;
    } else {
        return variable;
    }
}

// Test with THREE.Vector3
// t = [0,1];
// f = [new THREE.Vector3(0,0,0), new THREE.Vector3(1,1,1)];
// fp = [new THREE.Vector3(0,1,2), new THREE.Vector3(0,0,0)];

// Test with doubles
t = [0,1];
f = [0,1];
fp = [-1,-1];

var hermite = new L3D.Hermite.special.Polynom(0, 1, -1);

print('M = [');
for (var t = 0; t < 1; t += 0.01) {
    var res = hermite.eval(t);
    print("\t" + t + ',' + toString(res) + ';');
}
print('];');

print('MP = [');
for (var t = 0; t < 1; t += 0.01) {
    var res = hermite.prime(t);
    print("\t" + t + ',' + toString(res) + ';');
}
print('];');


