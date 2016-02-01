///<reference path="../../../typings/tsd.d.ts" />
///<reference path="../../../typings/threejs/three.examples.d.ts" />

module L3D {

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

}
