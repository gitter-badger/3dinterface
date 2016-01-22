module geo {

    export class Material {

        name : string;

        constructor(arg : string) {

            let split = arg.replace(/\s+/g, ' ').trim().split(' ');
            this.name = split[1];

        }

        toString() : string {
            return 'u ' + this.name;
        }

        toList() : any[] {
            return ['u', this.name];
        }

    }

}
