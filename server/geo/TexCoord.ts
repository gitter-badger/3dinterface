module geo {

    export class TexCoord implements Sendable {

        x : number;
        y : number;

        sent : boolean;
        index : number;

        constructor(arg : string) {

            let split = arg.replace(/\s+/g,' ').split(' ');

            this.x = parseFloat(split[1]);
            this.y = parseFloat(split[2]);

            this.sent = false;
            this.index = null;

        }

        toList() : any[] {
            return ['vt', this.index, this.x, this.y];
        }

        toString() : string {
            return 'vt ' + this.x + ' ' + this.y;
        }

    }

}
