module geo {

    export class Face implements Sendable {

        a : number;
        b : number;
        c : number;

        aTexture : number;
        bTexture : number;
        cTexture : number;

        aNormal : number;
        bNormal : number;
        cNormal : number;

        index : number;
        sent : boolean;

        meshIndex : number;

        constructor(arg : string) {

            if (arg.indexOf('/') === -1) {

                // No / : easy win : "f 1 2 3"  or "f 1 2 3 4"
                let split = arg.replace(/\s+/g, ' ').split(' ');
                this.a = parseInt(split[1]) - 1;
                this.b = parseInt(split[2]) - 1;
                this.c = parseInt(split[3]) - 1;

            } else {

                // There might be textures coords
                let split = arg.replace(/\s+/g, ' ').trim().split(' ');

                // Split elements
                var split1 = split[1].split('/');
                var split2 = split[2].split('/');
                var split3 = split[3].split('/');

                var vIndex = 0;
                var tIndex = 1;
                var nIndex = 2;

                this.a = parseInt(split1[vIndex]) - 1;
                this.b = parseInt(split2[vIndex]) - 1;
                this.c = parseInt(split3[vIndex]) - 1;

                this.aTexture = parseInt(split1[tIndex]) - 1;
                this.bTexture = parseInt(split2[tIndex]) - 1;
                this.cTexture = parseInt(split3[tIndex]) - 1;

                this.aNormal = parseInt(split1[nIndex]) - 1;
                this.bNormal = parseInt(split2[nIndex]) - 1;
                this.cNormal = parseInt(split3[nIndex]) - 1;

                this.index = null;
                this.meshIndex = null;
                this.sent = false;

            }

        }

        max() : number {
            return Math.max(this.a, this.b, this.c);
        }

        maxTexture() : number {
            return Math.max(this.aTexture, this.bTexture, this.cTexture);
        }

        toList() : any[] {
            return [
                'f', this.index, this.meshIndex,
                                            [this.a,        this.b,        this.c       ],
                isNaN(this.aTexture) ? [] : [this.aTexture, this.bTexture, this.cTexture],
                isNaN(this.aNormal ) ? [] : [this.aNormal,  this.bNormal,  this.cNormal ]

            ];
        }

        toString() : string {

            return 'f ' + this.a + ' ' + this.b + ' ' + this.c;

        }

        static parseFace(arg : string) : Face[] {

            let split = arg.trim().split(' ');
            let ret : Face[] = [];

            // Face3
            if (split.length >= 4) {
                ret.push(new Face(arg));
            }

            // Face3 == 2 * Face3
            if (split.length >= 5) {
                ret.push(new Face(
                    [
                        split[0],
                        split[1],
                        split[3],
                        split[4]
                    ].join(' ')
                ));
            }

            return ret;

        }

    }

}
