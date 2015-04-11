<?php include_once("header_functions.php"); ?>
<!doctype html>
<html>
    <?php head('Streaming simulator'); ?>
    <body>
        <?php include("header.php"); ?>
        <?php include("nav.php"); ?>
        <section>
            <h2>Streaming simulator</h2>
            <p>
                In fact, it's not really streaming. The sphere is fully
                preloaded and then, a mesh is created and vertices and faces
                are dynamically added to this mesh as time goes by.
            </p>
            <p>
                You can try with a different resolution (between 1 and 25)
                <form action="" method="GET">
                    Resolution : <input id="res" name="res" type="number" min="1" max="25" value="5" length=10/>
                    <input type="submit" value="Go !" />
                </form>
            </p>
            <div style="border-width:1px; border-style: solid;" id="container"></div>
        </section>
        <?php include("jsIncludes.php"); ?>
        <script src="js/Params.js.php?<?php echo htmlentities($_SERVER['QUERY_STRING']); ?>"></script>
        <script src="js/main.js"></script>
    </body>
</html>
