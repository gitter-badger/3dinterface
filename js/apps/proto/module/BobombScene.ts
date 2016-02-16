import * as THREE from 'three';
import * as L3D from 'L3D';

import { SceneWithCoins } from './SceneWithCoins';
import { CoinConfig } from '../config';
import { RecommendationData } from './RecommendationData';
import { CoinData } from './CoinData';

module Proto {

    export class BobombScene extends SceneWithCoins {

        prefetchType : string;
        loader : L3D.ProgressiveLoader;
        camera : L3D.PointerCamera;

        constructor() {
            super();
        }

        setCamera(camera : L3D.PointerCamera) {

            super.setCamera(camera);
            this.camera.speed = 0.005;

        }

        load(prefetch : string, lowRes = false) {

            if (prefetch !== undefined) {
                this.prefetchType = prefetch;
            }

            var path = lowRes === true ?
                '/static/data/bobomb/bobomb battlefeild.obj' :
                '/static/data/bobomb/bobomb battlefeild_sub.obj';

            this.loader = new L3D.ProgressiveLoader(
                path,
                this,
                this.camera,
                (object : THREE.Mesh) => {
                    this.clickableObjects.push(object);
                    object.raycastable = true;
                    if (object.material.name === 'Material.071_574B138E_c.bmp' ||
                        object.material.name === 'Material.070_41A41EE3_c.bmp') {
                        object.material.transparent = true;
                    object.raycastable = false;
                    }
                },
                ()=>{},// L3D.LogFunction,
                    false,
                this.prefetchType
            );

            this.loader.onFinished = function() { this.finish(); }
            this.loader.load();

            this.collidableObjects.push(this.loader.obj);
            this.clickableObjects.push(this.loader.obj);
            this.loader.obj.raycastable = true;

        }

        getResetElements() {

            return {
                position: new THREE.Vector3(38.115627509754646,10.829803024792419,-19.862035691341315),
                target: new THREE.Vector3(-1.4518898576752122,5.048214777643772,-18.869661407832535)
            }

        }

        addRecommendations(ClassToInstanciate : any, width : number, height : number) {

            return super.addRecommendations(ClassToInstanciate, width, height, 0.2);

        }

        getRawRecommendations() : L3D.CameraItf[] {
            return RecommendationData.bobombRecommendations;
        }

        getRawCoins() : L3D.Vector3[] {
            return CoinData.bobombCoins;
        }

    }

}

export = Proto;
