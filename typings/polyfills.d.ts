interface Array<T> {
    find(predicate: (search: T) => boolean) : T;
}

declare module Express {

    export interface Request {

        session : any;

    }

}

// We use a custom version of Stats
declare interface Stats {

    getFps() : number;

}

interface Error {

    status ?: number;

}

declare module THREE {

    export interface Object3D {

        raycastable ?: boolean;
        onClick ?: () => void;
        onMouseEnter ?: (param : {x:number, y:number}) => boolean;
        onMouseLeave ?: () => boolean;

    }

}

interface Document {

    mozPointerLockElement : any;
    mozRequestPointerLock() : void;

    webkitPointerLockElement : any;
    webkitRequestPointerLock() : void;

}

interface Element {

    mozPointerLockElement : any;
    mozRequestPointerLock() : void;

    webkitPointerLockElement : any;
    webkitRequestPointerLock() : void;

}

interface Window {

    containerSize : {

        width : () => number;
        height: () => number;

    };

    onWindowResize ?: Function;

}

interface Math {

    sign : (v : number) => number;

}
