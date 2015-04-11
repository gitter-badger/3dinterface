<?php include_once("header_functions.php"); ?>
<!doctype html>
<html>
    <?php head("Multisphere"); ?>
    <body>
        <?php include("header.php"); ?>
        <?php include("nav.php"); ?>
        <section>
            <h2>Multiresolution sphere</h2>
            <p>
                This is the first test of multi-resolution. In fact, it's not
                really one multi-resolution sphere but many spheres with
                different resolutions. You can change resolution by clicking on
                the canvas.
            </p>
            <div id="container"></div>
        </section>
        <?php include("jsIncludes.php"); ?>
        <script src="js/MultiSphere.js"></script>
    </body>
</html>
