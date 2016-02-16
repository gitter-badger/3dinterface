declare module Stats {
    export class Stats {
        domElement : HTMLCanvasElement;

        getFps() : number;
        setMode(t : number) : void;
        begin() : void;
        end() : void;
    }
}

declare module 'stats' {
    export = Stats;
}
