<!doctype html>
<html>
    <head>
        <title>The begining</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1>Here is stuff</h1>
        <div style="border-width:1px; border-style: solid;" id="container"></div>
        <script src="/js/three/three.min.js"></script>
        <script src="/js/three/MTLLoader.js"></script>
        <script src="/js/three/OBJLoader.js"></script>
        <script src="/js/three/OBJMTLLoader.js"></script>
        <script src="/js/three/OrbitControls.js"></script>
        <script src="/js/three/PointerLockControls.js"></script>
        <script src="/js/Cube.js"></script>
        <script src="/js/BouncingCube.js"></script>
        <script src="/js/Camera.js"></script>
        <script src="/js/PointerCamera.js"></script>
        <script src="/js/FixedCamera.js"></script>
        <script src="/js/CameraContainer.js"></script>
        <script src="/js/Tools.js"></script>
        <script src="/js/ProgressiveSphere.js"></script>
        <?php
            // Set global variables
            $default = 5;
            $res = null;
            try
            {
                if (isset($_GET['res']))
                {
                    $res = intval($_GET['res']);
                    if ($res < 1 || $res > 25)
                    {
                        throw new Exception('Variable res not set');
                    }
                }
                else
                {
                    throw new Exception('Variable res not set');
                }
            }
            catch (Exception $e)
            {
                $res = $default;
            }
            echo "<script>var global_array = {res: " . $res . "};</script>\n";
        ?>
        <script src="js/main.js"></script>
    </body>
</html>
