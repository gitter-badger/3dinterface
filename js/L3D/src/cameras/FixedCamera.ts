import * as THREE from 'three';
import { Vector3, Tools } from '../math/Tools';

module L3D {

    /**
     * Represents a fixed camera
     */
    export class FixedCamera extends THREE.PerspectiveCamera {

        target : THREE.Vector3;

        constructor(arg1:number, arg2:number, arg3:number, arg4:number, position:Vector3, target:Vector3) {

            super(arg1, arg2, arg3, arg4)

            if (position === undefined) {

                position = new THREE.Vector3(0,0,5);

            }

            if (target === undefined ) {

                target = new THREE.Vector3();

            }

            Tools.copy(position, this.position);
            this.target = Tools.copy(target);

        }

        /**
         * Look function. Just like OpenGL gluLookAt
         */
        look() {
            this.lookAt(this.target);
        }

    }

}

export = L3D;
