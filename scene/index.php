<?php include_once("header_functions.php"); ?>
<!doctype html>
<html>
    <?php head("Prototype"); ?>
    <body>
        <?php include("header.php"); ?>
        <?php include("nav.php"); ?>
        <section>
            <h2>3D Interface</h2>
            <p>
                This is the prototype of a 3D interface. You can move the
                camera with the arrow keys of your keyboard, and change the
                angle of the camera by dragging and dropping the scene around
                it (you can also use your numpad, 2 to look lower, 8 to look
                higher, 4 to look on the left and 6 to look on the right).
            </p>
            <p>
                Recommended views are displayed with a transparent red screen.
                By clicking on this screen, your camera will move to the
                recommended viewpoint.
            </p>
            <div style="border-width:1px; border-style: solid;" id="container"></div>
        </section>
        <?php include("jsIncludes.php"); ?>
        <script src="js/main.js"></script>
    </body>
</html>
