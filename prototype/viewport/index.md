---
title: Prototype
layout: withjs
extrajs: <script src="/static/js/prototype/viewport/main.js"></script>
extrahead: <link rel="stylesheet" href="/static/css/prototype.css" />
---
<div id="main-div">
<!--<div style="display: none;">-->
<h2>3D Interface</h2>

<p>
This is the prototype of a 3D interface. You can move the camera with the arrow
keys of your keyboard, and change the angle of the camera by dragging and
dropping the scene around it (you can also use your numpad, 2 to look lower, 8
to look higher, 4 to look on the left and 6 to look on the right, but if you're
more comfortable with non-numpad keys, you can also use i for up, j for left, k
for down, and l for right).
</p>

<p>
Recommended views are displayed with a transparent red arrow.  They disappear
when you come closer to them, and you can automatically move to them by
clicking on them. You can reset the camera at anytime by clicking on the reset
button.
</p>

<button class="btn btn-primary" id="full" style="margin-bottom: 10px; display: none;">Fullscreen</button>
<button class="btn btn-primary" id="reset" style="margin-bottom:10px">Reset camera</button>
<button class="btn btn-primary" id="undo" style="margin-bottom:10px">Undo</button>
<input  type="checkbox" id="fullarrow" style="margin-bottom:10px">
<label  for="fullarrow">Full arrow</label>
<input  type="checkbox" id="collisions" style="margin-bottom:10px" checked>
<label  for="collisions">Collisions</label>
<input  type="checkbox" id="showarrows" style="margin-bottom:10px" checked>
<label  for="showarrows">Show arrows</label>
</div>
<!-- </div> -->

<div id="container" style="padding: 0px; margin: 0px;" tabindex="1"></div>
