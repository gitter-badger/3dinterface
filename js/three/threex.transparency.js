var THREEx = THREEx || {}

/**
 * namespace for the extension
 * @type {Object}
 */
THREEx.Transparency	= {};
THREEx.Transparency.objects = [];

/**
 * init transparency of a object recursivly
 * @param  {THREE.Object3D[]} objects the object which are transparent
 */
THREEx.Transparency.init	= function(objects){
	objects.forEach(function(object){
        THREEx.Transparency.objects.push(object);
		object.material.transparent	= true;
		object.material.depthWrite	= false;
        object.raycastable = false;
	});
}

THREEx.Transparency.push = function() {
    for (var i = 0; i < arguments.length; i++) {
        THREEx.Transparency.objects.push(arguments[i]);
        arguments[i].material.transparent = true;
        arguments[i].material.depthWrite = false;
        arguments[i].raycastable = false;
    }
}

/**
 * update the object for transparency rendering
 * @param  {THREE.Object3D[]} objects the objects which are transparent
 * @param  {THREE.Camera} camera the camera used for rendering
 */
THREEx.Transparency.update	= function(camera){
	// update camera matrices
	camera.updateMatrixWorld()
	camera.matrixWorldInverse.getInverse( camera.matrixWorld )

	var screenMatrix= new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
	var position	= new THREE.Vector3()

	// traverse the object
	THREEx.Transparency.objects.forEach(function(object){
		// update the matrixWorld of the object and its children
		object.updateMatrixWorld()
		// compute its position in screen space
		position.setFromMatrixPosition( object.matrixWorld );
        // object.matrixWorld.setMatrixFromPosition(position);
		position.applyProjection( screenMatrix );
		// use the position.x as renderDepth
		object.renderDepth	= position.z;
	})
}


