import * as THREE from 'three';
import { FixedCamera } from '../cameras/FixedCamera';
import { Vector3, Tools } from '../math/Tools';

module l3d {

    /**
     * @description Represents a reccomendation that does nothing
     * @constructor
     * @extends THREE.Object3D
     */
    export class BaseRecommendation extends THREE.Object3D {

        camera : FixedCamera;

        constructor(arg1:number, arg2:number, arg3:number, arg4:number, position:Vector3, target:Vector3) {

            super();

            this.camera = new FixedCamera(arg1,arg2,arg3,arg4,position,target);
            Tools.copy(position, this.camera.position);
            this.camera.target = Tools.copy(target);

        }


        // Base recommendation behaves like no recommendation : all its methods do nothing
        raycast(r : THREE.Raycaster, o : any[]) : void {}
        check() {}
        initExtremity() {}
        updateExtremity() {}
        setSize(s : number) {}
        update(mainCamera : THREE.Camera) {}
        regenerateArrow(mainCamera ?: THREE.Camera) {}
        look() {}
        addToScene(scene : THREE.Scene) {}

    }

}

export = l3d;
