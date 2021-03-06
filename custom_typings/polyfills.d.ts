declare module THREE {

    export interface Object3D {

        raycastable ?: boolean;
        onClick ?: () => void;
        onMouseEnter ?: (param : {x:number, y:number}) => boolean;
        onMouseLeave ?: () => void;

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
