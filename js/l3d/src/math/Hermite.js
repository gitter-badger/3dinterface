/**
 * @memberof L3D
 * @namespace
 * @description Contains eveything linked to hermite polynoms
 */
L3D.Hermite = {};

/**
 * @memberof L3D.Hermite
 * @constructor
 * @description creates a hermite polynom
 * @param t {Number[]|THREE.Vector3[]} time indices of the interpolation
 * @param f {Number[]|THREE.Vector3[]} values of the polynom at each time
 * @param fp {Number[]|THREE.Vector3[]} values of the derivative of the polynom at each time
 */
L3D.Hermite.Polynom = function(t, f, fp) {

    /**
     * @type {Number[]|THREE.Vector3[]}
     * @description time indices of the interpolation
     */
    this.times = t;

    /**
     * @type {Number[]|THREE.Vector3[]}
     * @description values of the polynom at each time
     */
    this.evals = f;

    /**
     * @type {Number[]|THREE.Vector3[]}
     * @description values of the derivatives of the polynom at each time
     */
    this.primes = fp;

    /**
     * @type {L3D.Hermite.BaseFunction[]}
     * @description array of the base functions to evaluate the poylnom
     */
    this.baseFunctions = [];

    for (var i in this.times) {
        this.baseFunctions.push(new L3D.Hermite.BaseFunction(i, this.times));
    }

    // Let's do something at least a little reusable
    /**
     * @type {Object}
     * @description an object containing
     * <ul>
     *  <li><code>whatType</code> : a string being <code>THREE.Vector3</code> or <code>number</code></li>
     *  <li><code>tools</code> : an object containg sum and mul, functions of the correct type</li>
     * </ul>
     */
    this.tools = {};
    if (f[0] instanceof THREE.Vector3) {
        this.tools.whatType = 'THREE.Vector3';
        this.tools.sum  = L3D.Tools.sum;
        this.tools.prod = L3D.Tools.mul;
    } else {
        this.tools.whatType = 'number';
        this.tools.sum  = function(a, b) { return a + b;  };
        this.tools.prod = function(a, b) { return a * b;  };
    }
};

/**
 * Evaluates the polynom at a certain time
 * @param t {Number} time at which you want to evaluate the polynom
 * @return {Number|THREE.Vector3} the evaluation of the polynom at the given time
 */
L3D.Hermite.Polynom.prototype.eval = function(t) {
    var ret;

    if (this.tools.whatType === 'THREE.Vector3') {
        ret = new THREE.Vector3();
    } else {
        ret = 0;
    }

    for (var i in this.times) {
        var ti = this.times[i];
        var qi_t = this.baseFunctions[i].eval(t);
        // var qi_ti = this.baseFunctions[i].eval(ti);

        var qip_ti = this.baseFunctions[i].prime(ti);
        var f_ti = this.evals[i];
        var fp_ti = this.primes[i];

        // This is the wikipedia formula
        // ret += (qi_t / qi_ti) * ((1 - (t - ti) * (qip_ti / qi_ti)) * f_ti + (t - ti) * fp_ti);
        // Let's not forget that qi_ti = 1

        // This is the final formula
        // ret += (qi_t) * ((1 - (t - ti) * (qip_ti)) * f_ti + (t - ti) * fp_ti);

        // This is the implementation working with THREE.Vector3
        // In terms of disgusting code, we're quite good there
        ret =
            this.tools.sum(
                ret,
                this.tools.prod(
                    this.tools.sum(
                        this.tools.prod(f_ti, 1 - (t - ti) * (qip_ti)),
                        this.tools.prod(fp_ti, t - ti)
                    ),
                    qi_t
                )
            );
    }

    return ret;
};

/**
 * Evaluates the derivate of the polynom at a certain time
 * @param t {Number} time at which you want to evaluate the derivative of the polynom
 * @return {Number|THREE.Vector3} the evaluation of the derivative of the polynom at the given time
 */
L3D.Hermite.Polynom.prototype.prime = function(t) {
    var ret;

    if (this.tools.whatType === 'THREE.Vector3') {
        ret = new THREE.Vector3();
    } else {
        ret = 0;
    }

    for (var i in this.times) {
        var ti = this.times[i];
        var qi_t = this.baseFunctions[i].eval(t);
        // var qi_ti = this.baseFunctions[i].eval(ti);

        var qip_t  = this.baseFunctions[i].prime(t );
        var qip_ti = this.baseFunctions[i].prime(ti);
        var f_ti = this.evals[i];
        var fp_ti = this.primes[i];

        // The return of the disgusting code...
        // First part is the same that the eval function, but changing qi_t by qip_t
        // (first part of the derivative)
        ret =
            this.tools.sum(
                ret,
                this.tools.prod(
                    this.tools.sum(
                        this.tools.prod(f_ti, 1 - (t - ti) * (qip_ti)),
                        this.tools.prod(fp_ti, t - ti)
                    ),
                    qip_t
                )
            );

        // Here, we just add
        // ret += qi_t * (-qip_t * f_ti + fp_ti);
        ret =
            this.tools.sum(
                ret,
                this.tools.prod(
                    this.tools.sum(
                        this.tools.prod(
                            f_ti,
                            -qip_t
                        ),
                        fp_ti
                    ),
                    qi_t
                )
            );

        // Now the following code is the same as the precedent affectation
        // However it doesn't work, and I can't see the difference between
        // this and the previous one... so I keep it here, to find the
        // mistate later
        // ret =
        //     this.tools.sum(
        //         ret,
        //         this.tools.prod(
        //             this.tools.sum(
        //                 fp_ti,
        //                 this.tools.prod(
        //                     f_ti,
        //                     -qip_ti
        //                 )
        //             ),
        //             qi_t
        //         )
        //     );
    }

    return ret;
};

/**
 * @memberof L3D.Hermite
 * @constructor
 * @description Represents a base function for evaluation of hermite polynoms
 * @param index {Number} the index of the base function
 * @param times {Number[]} the times for polynom interpolation
 */
L3D.Hermite.BaseFunction = function(index, times) {
    /**
    * @type {Number}
    * @description the index of the base function
    */
    this.index = index;

    /**
     * @type {Number[]}
     * @description the times for polynom interpolation
     */
    this.times = times;
};

/**
 * Returns the evaluation of the base function
 * @param t {Number} time at which you want to evaluate the base function
 * @returns {Number} the evaluation of the base function at the given time
 */
L3D.Hermite.BaseFunction.prototype.eval = function(t) {
    var ret = 1;

    for (var i in this.times) {
        if (i !== this.index) {
            ret *= (t - this.times[i]) / (this.times[this.index] - this.times[i]);
        }
    }

    return ret * ret;
};

/**
 * Returns the evaluation of the derivative of the base function
 * @param t {Number} time at which you want to evaluate the derivative of the base function
 * @returns {Number} the evaluation of the derivative of the base function at the given time
 */
L3D.Hermite.BaseFunction.prototype.prime = function(t) {
    var ret = 0;

    for (var i in this.times) {
        if (i !== this.index) {
            ret += 2 / (t - this.times[i]);
        }
    }

    return this.eval(t) * ret;
};

/**
 * @memberof L3D.Hermite
 * @namespace
 */
L3D.Hermite.special = {};

/**
 * @memberof L3D.Hermite.special
 * @description Represents a simple hermite polynom where the times are [0, 1], and where
 * the position is known at 0, 1 and where the derivative is only known at 1
 * @constructor
 * @param P0 {Number|THREE.Vector3} polynom at instant 0
 * @param P1 {Number|THREE.Vector3} polynom at instant 1
 * @param PP1 {Number|THREE.Vector3} derivative of the polynom at instant 1
 */
L3D.Hermite.special.Polynom = function(P0, P1, PP1) {
    /**
     * @type {Object}
     * @description an object containing
     * <ul>
     *  <li><code>whatType</code> : a string being <code>THREE.Vector3</code> or <code>number</code></li>
     *  <li><code>tools</code> : an object containg sum and mul, functions of the correct type</li>
     * </ul>
     */
    this.tools = {};
    if (P0 instanceof THREE.Vector3) {
        this.tools.sum = L3D.Tools.sum;
        this.tools.mul = L3D.Tools.mul;
        this.tools.diff = L3D.Tools.diff;

        /**
         * @type {Number|THREE.Vector3}
         * @description b of ax²+bx+c
         */
        this.c = P0.clone();
    } else {
        this.tools.sum = function(a,b) { return a+b; };
        this.tools.mul = function(a,b) { return a*b; };
        this.tools.diff = function(a,b) { return a-b; };
        this.c = P0;
    }

    /**
     * @type {Number}
     * @description a of ax²+bx+c
     */
    this.a = this.tools.sum(PP1, this.tools.diff(P0, P1));

    /**
     * @type {Number}
     * @description b of ax²+bx+c
     */
    this.b = this.tools.diff(this.tools.mul(this.tools.diff(P1,P0), 2), PP1);
};

/**
 * Returns the evaluation of the polynom
 * @param t {Number} time at which you want to evaluate the polynom
 * @returns {Number|THREE.Vector3} the evaluation of the polynom at the given time
 */
L3D.Hermite.special.Polynom.prototype.eval = function(t) {
    return this.tools.sum(this.tools.mul(this.a, t*t), this.tools.sum(this.tools.mul(this.b, t), this.c));
};

/**
 * Returns the evaluation of the derivative of the polynom
 * @param t {Number} time at which you want to evaluate the derivative of the polynom
 * @returns {Number|THREE.Vector3} the evaluation of the derivative of the polynom at the given time
 */
L3D.Hermite.special.Polynom.prototype.prime = function(t) {
    return this.tools.sum(this.tools.mul(this.a,2*t), this.b);
};
