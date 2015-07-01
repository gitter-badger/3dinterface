// We will be doing a lot of document.write, so let's remove jshint warnings
/* jshint evil:true */
function test(b) {
    if (b)
        document.write("<li style='color: #008800'>Success !</li>");
    else
        document.write("<li style='color: red'>Failure !</li>");
}

function main() {
    document.write("<h1>Starting test !</h1>");

    var v1 = new THREE.Vector3(1,2,3);
    var v2 = new THREE.Vector3(2,3,4);
    var v1Bak = v1.clone();
    var v2Bak = v2.clone();

    // First tests
    document.write("<ol>");
    var v3 = Tools.sum(v1,v2);
    test(v3.x == v1.x + v2.x && v3.y == v1.y + v2.y && v3.z == v1.z + v2.z);
    test(Tools.equals(v1, v1Bak));
    test(Tools.equals(v2, v2Bak));
    document.write('</ol>');

    // Clear v1, v2
    v1 = v1Bak.clone();
    v2 = v2Bak.clone();

    document.write("<ol>");
    var v4 = Tools.diff(v1,v2);
    test(v4.x == v1.x - v2.x && v4.y == v1.y - v2.y && v4.z == v1.z - v2.z);
    test(Tools.equals(v1, v1Bak));
    test(Tools.equals(v2, v2Bak));
    document.write('</ol>');

    v1 = v1Bak.clone();
    v2 = v2Bak.clone();

    document.write("<ol>");
    var v5 = Tools.dot(v1,v2);
    test(v5 == v1.x * v2.x + v1.y * v2.y + v1.z * v2.z);
    test(Tools.equals(v1, v1Bak));
    test(Tools.equals(v2, v2Bak));
    document.write('</ol>');

    v1 = v1Bak.clone();
    v2 = v2Bak.clone();

    document.write("<ol>");
    var v6 = Tools.cross(new THREE.Vector3(1,0,0), new THREE.Vector3(0,1,0));
    test(Tools.equals(v6,  new THREE.Vector3(0,0,1)));
    test(Tools.equals(v1, v1Bak));
    test(Tools.equals(v2, v2Bak));
    document.write('</ol>');

    v1 = v1Bak.clone();
    v2 = v2Bak.clone();

    document.write("<ol>");
    for (var lambda = 0; lambda < 5; lambda += 0.5)
    {
        var v7 = Tools.mul(v1, lambda);
        test(Tools.equals(v7, new THREE.Vector3(v1Bak.x*lambda, v1Bak.y*lambda, v1Bak.z*lambda)));
        v1 = v1Bak.clone();
        v2 = v2Bak.clone();
        var v8 = Tools.mul(v1, lambda);
        test(Tools.equals(v8, new THREE.Vector3(v1Bak.x*lambda, v1Bak.y*lambda, v1Bak.z*lambda)));
        v1 = v1Bak.clone();
        v2 = v2Bak.clone();

        // Try into v1
        v1 = Tools.mul(v1, lambda);
        test(Tools.equals(v1, new THREE.Vector3(v1Bak.x*lambda, v1Bak.y*lambda, v1Bak.z*lambda)));
        v1 = v1Bak.clone();
        v2 = v2Bak.clone();

    }
}

main();
