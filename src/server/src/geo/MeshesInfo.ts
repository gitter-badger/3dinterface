import * as mth from 'mth';
import { Transformation } from './Transformation';

module geo {

    export module MeshNames {

        export interface MeshInfo {
            done : boolean;
            transformation ?: Transformation;
        }

        export var dict : {[id:string] : MeshInfo} = {
            '/static/data/castle/princess peaches castle (outside).obj': {
                done: false
            },
            '/static/data/mountain/coocoolmountain.obj': {
                done: false
            },
            '/static/data/mountain/coocoolmountain_sub.obj': {
                done: false
            },
            '/static/data/whomp/Whomps Fortress.obj': {
                done: false,
                transformation: new Transformation({
                    translation: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    rotation: {
                        x: -Math.PI / 2,
                        y: 0,
                        z: Math.PI / 2
                    },
                    scale: 0.1
                })
            },
            '/static/data/whomp/Whomps Fortress_sub.obj': {
                done: false,
                transformation : new Transformation({
                    translation: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    rotation: {
                        x: -Math.PI / 2,
                        y: 0,
                        z: Math.PI / 2
                    },
                    scale: 0.1
                })
            },
            '/static/data/bobomb/bobomb battlefeild.obj': {
                done: false,
                transformation : new Transformation({
                    translation: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    rotation: {
                        x: 0,
                        y: Math.PI - 0.27,
                        z: 0
                    }
                })
            },
            '/static/data/bobomb/bobomb battlefeild_sub.obj': {
                done: false,
                transformation : new Transformation({
                    translation: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    rotation: {
                        x: 0,
                        y: Math.PI - 0.27,
                        z: 0
                    }
                })
            },
            '/static/data/sponza/sponza.obj': {
                done: false,
                transformation : new Transformation({
                    translation: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    rotation: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    scale: 0.02
                })
            }

        }

    }

}

export = geo;
