///<reference path="../../../typings/tsd.d.ts" />
///<reference path="./cameras/Camera.ts" />
///<reference path="./cameras/PointerCamera.ts" />
///<reference path="./utils/History.ts" />
///<reference path="./utils/Logger.ts" />
///<reference path="./math/Tools.ts" />
///<reference path="./math/Hermite.ts" />
///<reference path="./canvases/MousePointer.ts" />

declare module THREE {

    export interface Object3D {

        raycastable ?: boolean;

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
