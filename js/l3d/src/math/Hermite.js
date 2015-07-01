var Hermite = {};

Hermite.Polynom = function(t, f, fp) {
    this.times = t;
    this.evals = f;
    this.primes = fp;

    this.baseFunctions = [];

    for (var i in this.times) {
        this.baseFunctions.push(new Hermite.BaseFunction(i, this.times));
    }

    // Let's do something at least a little reusable
    this.tools = {};
    if (f[0] instanceof THREE.Vector3) {
        this.tools.whatType = 'THREE.Vector3';
        this.tools.sum  = Tools.sum;
        this.tools.prod = Tools.mul;
    } else {
        this.tools.whatType = 'number';
        this.tools.sum  = function(a, b) { return a + b;  };
        this.tools.prod = function(a, b) { return a * b;  };
    }
};

Hermite.Polynom.prototype.eval = function(t) {
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

Hermite.Polynom.prototype.prime = function(t) {
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

Hermite.BaseFunction = function(index, times) {
    this.index = index;
    this.times = times;
};

Hermite.BaseFunction.prototype.eval = function(t) {
    var ret = 1;

    for (var i in this.times) {
        if (i !== this.index) {
            ret *= (t - this.times[i]) / (this.times[this.index] - this.times[i]);
        }
    }

    return ret * ret;
};

Hermite.BaseFunction.prototype.prime = function(t) {
    var ret = 0;

    for (var i in this.times) {
        if (i !== this.index) {
            ret += 2 / (t - this.times[i]);
        }
    }

    return this.eval(t) * ret;
};

Hermite.special = {};

// This polynom interpolates with two coords and one derivative
// t = [0,1]
Hermite.special.Polynom = function(P0, P1, PP1) {
    this.tools = {};
    if (P0 instanceof THREE.Vector3) {
        this.tools.sum = Tools.sum;
        this.tools.mul = Tools.mul;
        this.tools.diff = Tools.diff;
        this.c = P0.clone();
    } else {
        this.tools.sum = function(a,b) { return a+b; };
        this.tools.mul = function(a,b) { return a*b; };
        this.tools.diff = function(a,b) { return a-b; };
        this.c = P0;
    }

    this.a = this.tools.sum(PP1, this.tools.diff(P0, P1));
    this.b = this.tools.diff(this.tools.mul(this.tools.diff(P1,P0), 2), PP1);
};

Hermite.special.Polynom.prototype.eval = function(t) {
    return this.tools.sum(this.tools.mul(this.a, t*t), this.tools.sum(this.tools.mul(this.b, t), this.c));
};

Hermite.special.Polynom.prototype.prime = function(t) {
    return this.tools.sum(this.tools.mul(this.a,2*t), this.b);
};
