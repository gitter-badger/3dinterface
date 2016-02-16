import * as THREE from 'three';
import * as L3D from 'L3D';

module L3DP {

    export class ButtonManager {

        camera : L3D.PointerCamera;
        recommendations : L3D.BaseRecommendation[];
        previewer : L3D.Previewer;
        showArrows : boolean;
        beenFullscreen : boolean;

        resetElement : JQuery;
        undoElement :  JQuery;
        redoElement :  JQuery;

        pointerLockElement : JQuery;
        showArrowsElement :  JQuery;


        constructor(camera : L3D.PointerCamera, recommendations : L3D.BaseRecommendation[], previewer : L3D.Previewer) {

            this.camera = camera;
            this.recommendations = recommendations;
            this.previewer = previewer;

            this.showArrows = true;
            this.beenFullscreen = false;

            this.resetElement = $('#reset');
            this.undoElement = $('#undo');
            this.redoElement = $('#redo');

            this.pointerLockElement = $('#lock');
            this.showArrowsElement = $('#showarrows');

            this.undoElement.click(() => {this.camera.undo(); this.updateElements();});
            this.redoElement.click(() => {this.camera.redo(); this.updateElements();});
            this.pointerLockElement.change(() => {
                this.camera.shouldLock = this.pointerLockElement.prop('checked');
                this.camera.onPointerLockChange();

                var bakup = L3D.DB.isEnabled();
                if (!bakup)
                    L3D.DB.enable();

                var event = new L3D.DB.Event.SwitchedLockOption();
                event.locked = this.pointerLockElement.prop('checked');
                event.send();

                if (!bakup)
                    L3D.DB.disable();

            });

            this.showArrowsElement.change(() => {this.showArrows = this.showArrowsElement.prop('checked');});
            this.resetElement.click(() => this.camera.reset());

        }

        updateElements() {
            // Update icon
            if (!this.camera.undoable()) {
                this.undoElement.addClass('btn-default').removeClass('btn-primary');
            } else {
                this.undoElement.removeClass('btn-default').addClass('btn-primary');
            }

            if (!this.camera.redoable()) {
                this.redoElement.addClass('btn-default').removeClass('btn-primary');
            } else {
                this.redoElement.removeClass('btn-default').addClass('btn-primary');
            }

        }

    }

}

export = L3DP;
