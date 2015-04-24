---
title: Prototype
layout: withjs
extrajs: <script src="/static/js/prototype/main.js"></script>
---
## 3D Interface

This is the prototype of a 3D interface. You can move the camera with the arrow
keys of your keyboard, and change the angle of the camera by dragging and
dropping the scene around it (you can also use your numpad, 2 to look lower, 8
to look higher, 4 to look on the left and 6 to look on the right, but if you're
more comfortable with non-numpad keys, you can also use i for up, j for left, k
for down, and l for right).

Recommended views are displayed with a transparent red arrow.  They disappear
when you come closer to them, and you can automatically move to them by
clicking on them. You can reset the camera at anytime by clicking on the reset
button.

<button id="reset" style="margin-bottom:10px">Reset camera</button>
<input type="checkbox" id="fullarrow" style="margin-bottom:10px">
<label for="fullarrow">Full arrow</label>
<input type="checkbox" id="collisions" style="margin-bottom:10px" checked>
<label for="collisions">Collisions</label>
<input type="checkbox" id="showarrows" style="margin-bottom:10px" checked>
<label for="showarrows">Show arrows</label>

<div id="container"> </div>
