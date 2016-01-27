module Proto {

    export class WhompScene extends SceneWithCoins {

        constructor() {
            super();
        }

        setCamera(camera : L3D.PointerCamera) {

            super.setCamera(camera);
            this.camera.speed = 0.002;

        }

        load(prefetch : string, lowRes = false) {

            if (prefetch !== undefined) {
                this.prefetchType = prefetch;
            }

            var path = lowRes === true ?
                '/static/data/whomp/Whomps Fortress.obj':
                '/static/data/whomp/Whomps Fortress_sub.obj';

            this.loader = new L3D.ProgressiveLoader(
                path,
                this,
                this.camera,
                (object : THREE.Mesh) => {

                    this.clickableObjects.push(object);
                    object.raycastable = true;
                    if (object.material.name === 'Shape_088' ||
                        object.material.name === 'Shape_089') {

                        object.raycastable = false;
                        object.material.transparent = true;

                    } else if (object.material.name === 'Shape_113') {

                        object.raycastable = false;
                        object.material.transparent = true;
                        object.material.opacity = 0.5;

                    } else if (object.material.name === 'Shape_076' ||
                               object.material.name === 'Shape_098' ||
                               object.material.name === 'Shape_092') {
                        object.visible = false;
                    }

                },
                ()=>{},// L3D.LogFunction,
                false,
                this.prefetchType
            );

            this.loader.onFinished = () => { this.finish(); }
            this.loader.load();

            this.collidableObjects.push(this.loader.obj);
            this.clickableObjects.push(this.loader.obj);
            this.loader.obj.raycastable = true;

        }

        getResetElements() {

            return {
                position : new THREE.Vector3(-6.725817925071645,1.4993570618328055,-10.356480813212423),
                target : new THREE.Vector3(-4.8541705829784604,1.3192268872752742,-6.825972443720941)
            }

        }

        addCoins(coinConfig : CoinConfig) {

            return super.addCoins(coinConfig, 0.002);

        }

        addRecommendations(ClassToInstanciate : any, width : number, height : number) {

            return super.addRecommendations(ClassToInstanciate, width, height, 0.2);

        }

    }

}