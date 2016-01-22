module geo {

    /**
     * Represents a 3D vertex
     */
    export class Vertex implements Sendable {

        /**
         * x coordinate of the vertex
         */
        x : number;

        /**
         * y coordinate of the vertex
         */
        y : number;

        /**
         * z coordinate of the vertex
         */
        z : number;

        /**
         * index of the vertex in a model
         */
        index : number;

        /**
         * indicates wether the vertex has already been sent or not
         */
        sent : boolean;

       /**
        * Builds a 3D vertex
        * @param arg A string like in the .obj file (e.g. 'v 1.1 0.2 3.4')
        */
        constructor(arg : string) {

            let split = arg.replace(/s+/g, ' ').split(' ');

            this.x = parseFloat(split[1]);
            this.y = parseFloat(split[2]);
            this.z = parseFloat(split[3]);

            this.index = null;

            this.sent = false;

        }

        toList() : any[] {
            return ['v', this.index, this.x, this.y, this.z];
        }

        toString() : string {
            return 'v ' + this.x + ' ' + this.y + ' ' + this.z;
        }

    }

}
