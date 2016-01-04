/**
 * Reprensents an elementary mesh (only one material)
 * @constructor
 * @memberOf geo
 */
geo.Mesh = function() {
    /**
     * @type {geo.Vertex[]}
     * @description All the vertices of the mesh
     * @deprecated Prefer the use of {@link geo.MeshContainer}.vertices
     */
    this.vertices = [];

    /**
     * @type {geo.Face[]}
     * @description All the faces of the mesh
     */
    this.faces = [];

    /**
     * @type {geo.TexCoord[]}
     * @description All the textures coordinates of the mesh
     */
    this.texCoords = [];

    /**
     * @type {geo.Normal[]}
     * @description All the normals of the mesh
     */
    this.normals = [];

    /**
     * @deprecated You should use your own counter
     */
    this.faceIndex = 0;

    /**
     * @type {String}
     * @description Name of the material of the current mesh
     */
    this.material = null;

    /**
     * @deprecated You should use your own attributes
     */
    this.started = false;

    /**
     * @deprecated You should use your own attributes
     */
    this.finished = false;
};

/**
 * Checks if there are normals in the mesh
 * @returns {Boolean} true if there are normals in the mesh, false otherwise
 */
geo.Mesh.prototype.hasNormals = function() {
    return this.normals.length > 0;
};

/**
 * Checks if there are texture coordinates in the mesh
 * @returns {Boolean} true if there are texture coordinates in the mesh, false otherwise
 */
geo.Mesh.prototype.hasTexCoords = function() {
    return this.texCoords.length > 0;
};

/**
 * Adds a vertex to a mesh
 * @param {geo.Vertex|String} A Vertex object or its string representation
 */
geo.Mesh.prototype.addVertex = function(vertex) {

    if (vertex instanceof geo.Vertex) {
        this.vertices.push(vertex);
    } else if (typeof vertex === 'string' || vertex instanceof String) {
        this.vertices.push(new geo.Vertex(vertex));
    } else {
        console.error("Can only add vertex from geo.Vertex or string");
        return;
    }

    return this.vertices[this.vertices.length - 1];
};

/**
 * Adds a face to a mesh
 * @param {geo.Face|String} A Face object or its string representation
 */
geo.Mesh.prototype.addFaces = function(face) {
    var faces;

    if (face instanceof geo.Face) {
        this.faces.push(face);
    } else if (typeof face === 'string' || face instanceof String) {
        faces = geo.parseFace(face);
        this.faces = this.faces.concat(faces);
    } else {
        console.error("Can only add face from geo.Face or string");
        return;
    }

    if (faces === undefined) {
        return this.faces[this.faces.length - 1];
    } else {
        return faces;
    }
};

/**
 * Adds a texture coordinate to a mesh
 * @param {geo.TexCoord|String} A TexCoord object or its string representation
 */
geo.Mesh.prototype.addTexCoord = function(texCoord) {
    if (texCoord instanceof geo.TexCoord) {
        this.texCoords.push(texCoord);
    } else if (typeof texCoord === 'string' || texCoord instanceof String) {
        this.texCoords.push(new geo.TexCoord(texCoord));
    } else {
        console.error("Can only add texCoord from geo.TexCoord or string");
        return;
    }

    return this.texCoords[this.texCoords.length - 1];
};

/**
 * Adds a normal to a mesh
 * @param {geo.Normal|String} A Normal object or its string representation
 */
geo.Mesh.prototype.addNormal = function(normal) {
    if (normal instanceof geo.Normal) {
        this.normals.push(normal);
    } else if (typeof normal === 'string' || normal instanceof String) {
        this.normals.push(new geo.Normal(normal));
    } else {
        console.error("Can only add normal from geo.Normal of string");
        return;
    }

    return this.normals[this.normals.length - 1];
};

/**
 * @deprecated
 */
geo.Mesh.prototype.isFinished = function() {
    return this.faceIndex === this.faces.length;
};

/**
 * Represent a 3D vertex
 * @constructor
 * @param {String} A string like in the .obj file (e.g. 'v 1.1 0.2 3.4')
 * @memberOf geo
 */
geo.Vertex = function() {
    if (typeof arguments[0] === 'string' || arguments[0] instanceof String) {
        var split = arguments[0].replace(/\s+/g, " ").split(' ');

        /**
         * x coordinate of the vertex
         * @type {Number}
         */
        this.x = parseFloat(split[1]);

        /**
         * y coordinate of the vertex
         * @type {Number}
         */
        this.y = parseFloat(split[2]);

        /**
         * z coordinate of the vertex
         * @type {Number}
         */
        this.z = parseFloat(split[3]);
    }

    /**
     * Indicates if the vertex has been sent or not
     * @type {Boolean}
     */
    this.sent = false;
};

/**
 * Gives a list representation of the vertex
 * @returns {Array} An array representing the vertex
 *
 * @example
 * var vertex = new geo.Vertex('v 3.5 3.6 3.7');
 * vertex.index = 5;
 * console.log(vertex.toList()); // Prints ['v', 5, 3.5, 3.6, 3.7]
 */
geo.Vertex.prototype.toList = function() {
    return ['v', this.index, this.x, this.y, this.z];
};

/**
 * Gives a string representation of the vertex
 * @returns {string} A string representing the vertex
 *
 * @example
 * var vertex = new geo.Vertex('v 3.5 3.6 3.7');
 * console.log(vertex.toString()); // Prints v 3.5 3.6 3.7
 */
geo.Vertex.prototype.toString = function() {
    return 'v ' + this.x + ' ' + this.y + ' ' + this.z;
};

/**
 * Represent a 3D normal
 * @constructor
 * @memberOf geo
 * @augments geo.Vertex
 * @param {String} A string like in the .obj file (e.g. 'vn 1.1 2.2 3.3')
 */
geo.Normal = function() {
    geo.Vertex.apply(this, arguments);
};

geo.Normal.prototype = Object.create(geo.Vertex.prototype);
geo.Normal.prototype.constructor = geo.Normal;

/**
 * Gives a list representation of the normal
 * @returns {Array} An array representing the normal
 *
 * @example
 * var normal = new geo.Normal('vn 3.5 3.6 3.7');
 * normal.index = 5;
 * console.log(normal.toList()); // Prints ['vn', 5, 3.5, 3.6, 3.7]
 */
geo.Normal.prototype.toList = function() {
    var superObject = geo.Vertex.prototype.toList.call(this);
    superObject[0] = 'vn';
    return superObject;
};

/**
 * Gives a string representation of the normal
 * @returns {string} A string representing the normal
 *
 * @example
 * var normal = new geo.Normal('vn 3.5 3.6 3.7');
 * console.log(normal.toString()); // Prints vn 3.5 3.6 3.7
 */
geo.Normal.prototype.toString = function() {
    var superObject = geo.Vertex.prototype.toString.call(this);
    superObject.replace('v', 'vn');
    return superObject;
};

/**
 * Represent a texture coordinate element
 * @constructor
 * @memberOf geo
 * @param {String} a string like in the .obj file (e.g. 'vt 0.5 0.5')
 */
geo.TexCoord = function() {
    if (typeof arguments[0] === 'string' || arguments[0] instanceof String) {
        var split = arguments[0].replace(/\s+/g, " ").split(' ');

        /**
         * x coordinate of the texture
         * @type {Number}
         */
        this.x = parseFloat(split[1]);

        /**
         * y coordinate of the texture
         * @type {Number}
         */
        this.y = parseFloat(split[2]);
    }

    /**
     * Indicates if the vertex has been sent or not
     * @type {Boolean}
     */
    this.sent = false;
};

/**
 * Gives a list representation of the texture coordinate
 * @returns {Array} An array representing the texture coordinate
 *
 * @example
 * var texCoord = new geo.TexCoord('vt 3.5 3.6');
 * texture coordinate.index = 5;
 * console.log(texture coordinate.toList()); // Prints ['vt', 5, 3.5, 3.6]
 */
geo.TexCoord.prototype.toList = function() {
    return ['vt', this.index, this.x, this.y];
};

/**
 * Gives a string representation of the texture coordinate
 * @returns {string} A string representing the texture coordinate
 *
 * @example
 * var texCoord = new geo.TexCoord('vt 3.5 3.6');
 * console.log(texCoord.toString()); // Prints vt 3.5 3.6
 */
geo.TexCoord.prototype.toString = function() {
    return 'vt ' + this.x + ' ' + this.y;
};


/**
 * Represents a face. Only triangles are supported. For quadrangular polygons, see {@link geo.parseFace}
 * @constructor
 * @memberOf geo
 * @param {String} A string like in a .obj file (e.g. 'f 1/1/1 2/2/2 3/3/3' or 'f 1 2 3').
 */
geo.Face = function() {
    var split;
    if (typeof arguments[0] === 'string' || arguments[0] instanceof String) {
        if (arguments[0].indexOf('/') === -1) {
            // No / : easy win : "f 1 2 3"  or "f 1 2 3 4"
            split = arguments[0].replace(/\s+/g, ' ').split(' ');
            this.a = parseInt(split[1]) - 1;
            this.b = parseInt(split[2]) - 1;
            this.c = parseInt(split[3]) - 1;

        } else {
            // There might be textures coords
            split = arguments[0].replace(/\s+/g, ' ').trim().split(' ');

            // Split elements
            var split1 = split[1].split('/');
            var split2 = split[2].split('/');
            var split3 = split[3].split('/');

            var vIndex = 0;
            var tIndex = 1;
            var nIndex = 2;

            /**
             * index of the first vertex of the face
             * @type {Number}
             */
            this.a = parseInt(split1[vIndex]) - 1;

            /**
             * index of the second vertex of the face
             * @type {Number}
             */
            this.b = parseInt(split2[vIndex]) - 1;

            /**
             * index of the third vertex of the face
             * @type {Number}
             */
            this.c = parseInt(split3[vIndex]) - 1;

            /**
             * index of the texture coordinate of the first vertex of the face
             * @type {Number}
             */
            this.aTexture = parseInt(split1[tIndex]) - 1;

            /**
             * index of the texture coordinate of the second vertex of the face
             * @type {Number}
             */
            this.bTexture = parseInt(split2[tIndex]) - 1;

            /**
             * index of the texture coordinate of the third vertex of the face
             * @type {Number}
             */
            this.cTexture = parseInt(split3[tIndex]) - 1;

            /**
             * index of the normal of the first vertex of the face
             * @type {Number}
             */
            this.aNormal = parseInt(split1[nIndex]) - 1;

            /**
             * index of the normal of the second vertex of the face
             * @type {Number}
             */
            this.bNormal = parseInt(split2[nIndex]) - 1;

            /**
             * index of the normal of the third vertex of the face
             * @type {Number}
             */
            this.cNormal = parseInt(split3[nIndex]) - 1;

        }
    }

    /**
     * Indicates if the vertex has been sent or not
     * @type {Boolean}
     */
    this.sent = false;

};

/**
 * Parse a face line and returns an array of faces
 *
 * @private
 * @param {String} a string representing a face
 * @returns {Face[]} a single 3-vertices face or two 3-vertices face if it was
 * a 4-vertices face
 */
geo.parseFace = function(arg) {

    var split = arg.trim().split(' ');
    var ret = [];

    // Face3
    if (split.length >= 4) {
        ret.push(new geo.Face(arg));
    }

    // Face3 == 2 * Face3
    if (split.length >= 5) {
        ret.push(new geo.Face(
            [
                split[0],
                split[1],
                split[3],
                split[4]
            ].join(' ')
        ));
    }

    return ret;
};

/**
 * Returns the max index of the vertices of the face
 * @returns {Number} the max index of the vertices
 */
geo.Face.prototype.max = function() {
    if (this.d !== undefined) {
        return Math.max(this.a, this.b, this.c, this.d);
    } else {
        return Math.max(this.a, this.b, this.c);
    }
};

/**
 * Returns the max index of the texture coordinates of the face
 * @returns {Number} the max index of the texture coordinates
 */
geo.Face.prototype.maxTexture = function() {
    if (this.dTexture) {
        return Math.max(this.aTexture, this.bTexture, this.cTexture, this.dTexture);
    } else {
        return Math.max(this.aTexture, this.bTexture, this.cTexture);
    }
};

/**
 * Gives a list representation of the face
 * @returns {Array} An array representing the texture coordinate
 *  <ol start=0>
 *    <li>'f'</li>
 *    <li>the index of the face</li>
 *    <li>a list containing the indices of the vertex of the face</li>
 *    <li>a list containing the indices of the texture coordinates</li>
 *    <li>a list containing the indices of the normals</li>
 *  </ol>
 *
 * @example
 * var face = new geo.Face('f 1/2/3 4/5/6 7/8/9');
 * texture coordinate.index = 5;
 * console.log(texture coordinate.toList()); // Prints ['f', 5, [1,4,7], [2,5,8], [3,6,9]]
 */
geo.Face.prototype.toList = function() {
    var l = ['f', this.index, this.meshIndex,
                                         [this.a,        this.b,        this.c       ],
             isNaN(this.aTexture) ? [] : [this.aTexture, this.bTexture, this.cTexture],
             isNaN(this.aNormal ) ? [] : [this.aNormal,  this.bNormal,  this.cNormal ]
    ];

    // if (this.d !== undefined)
    //     l.push(this.d);

    // if (this.aTexture !== undefined) {
    //     l.push(this.aTexture);
    //     l.push(this.bTexture);
    //     l.push(this.cTexture);
    // }

    // if (this.dTexture !== undefined)
    //     l.push(this.dTexture);

    return l;
};

/**
 * Gives a string representation of the face
 * @returns {string} A string representing the face
 *
 * @example
 * var face = new geo.Face('f 3 5 6');
 * console.log(face.toString()); // Prints f 3 5 6
 */
geo.Face.prototype.toString = function() {
    return 'f ' + this.a + ' ' + this.b + ' ' + this.c + (this.d !== undefined ? ' ' + this.d : '');
};

/**
 * Represents a material name
 * @constructor
 * @param {string} line the string representing the material
 * @memberOf geo
 */
geo.Material = function() {
    var split = arguments[0].replace(/\s+/g, ' ').trim().split(' ');

    /**
     * The name of the material
     * @type {string}
     */
    this.name = split[1];
};

/**
 * Gives a string representation of the material
 * @returns {string} obj representation of usemtl
 */
geo.Material.prototype.toString = function() {
    return 'usemtl ' + this.name;
};

/**
 * Gives a list representation of the material
 * @returns {array} an array representing the material
 * @example
 * var material = new geo.Material('usemtl MyMaterial');
 * console.log(material.toList()); // Logs ['u', 'MyMaterial']
 */
geo.Material.prototype.toList = function() {
    return ['u', this.name];
};

