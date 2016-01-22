module geo {

    export class Normal extends Vertex implements Sendable {

        constructor(arg : string) {
            super(arg);
        }

        toList() : any[] {
            let superObject = super.toList();
            superObject[0] = 'vn';
            return superObject;
        }

        toString() : string {
            return super.toString().replace('v', 'vn');
        }

    }

}
