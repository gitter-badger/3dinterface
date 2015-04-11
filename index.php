<?php include_once("header_functions.php"); ?>
<!doctype html>
<html>
    <?php head("Index"); ?>
    <body>
        <?php include("header.php"); ?>
        <?php include("nav.php"); ?>
        <section>
            <h2>Index</h2>
            <ul>
                <li><a href="/bouncing/">A bouncing cube that jumps when you click on it</a></li>
                <li>
                    <p>
                        <a href="/multisphere/">Sphere with multi-resolution</a>
                    </p>
                    <p>
                        Lots of obj files loaded and displayed. When you click
                        somewhere, the current obj is hidden and the next one, with
                        a better resolution is shown.
                    </p>
                </li>
                <li>
                    <p>
                        <a href="/scene/">A proto of the real thing</a>
                    </p>
                    <p>
                        You can move the camera with the arrow keys and move the
                        angle of the camera with 2, 4, 6 and 8 (the arrows of the
                        numpad), or you can do a drag-and-drop like (click on the
                        mouse to grap the scene, and move the mouse to rotate the
                        camera). You can also select a camera by clicking on the
                        red part of it, and get back to the free camera by clicking
                        again. You can also select a camera by simply clicking on
                        the object you want to see. The program will choose the
                        camera that you want, and move to it progressively.
                    </p>
                </li>
                <li>
                    <p>
                        <a href="/stream/">Streaming simulation</a>
                    </p>
                    <p>
                        A mesh of a sphere is fully loaded, and displayed
                        progressively. This test is here to prove that we can
                        dynamically add vertices and faces to a mesh.
                    </p>
                </li>
            </ul>
        </section>
    </body>
</html>
