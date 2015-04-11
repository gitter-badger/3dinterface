<?php include_once("header_functions.php"); ?>
<!doctype html>
<html>
    <?php head("Bouncing cube"); ?>
    <body>
        <?php include("header.php"); ?>
        <?php include("nav.php"); ?>
        <section>
            <h2>Bouncing cube</h2>
            <p>
                Click on the cube to make it jump !
            </p>
            <div id="container"></div>
        </section>
        <?php include("jsIncludes.php"); ?>
        <script src="js/BouncingMain.js"></script>
    </body>
</html>
