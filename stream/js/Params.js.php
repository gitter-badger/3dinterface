<?php

    // This file will generate a js script
    header("Content-Type: text/javascript");

    echo "params = {};\n";
    echo "params.get = {};\n";
    echo "params.post = {};\n";

    // Next part is to check the value of the parameters
    // All this is necessary, we must be sure that res is a number before
    // generating js code, otherwise, a malicious user might inject js code
    // For example, if we simply did
    // echo "params.get.res = " . $_GET['res'] . ";\n";
    // One could inject a js alert by going to
    // http://localhost/stream?res=3;alert('toto')

    // Default value, will be applied if the res variable is not correct
    $default = 5;
    $res = null;

    try
    {
        // Cast res to an int and check if it's in the bounds
        // res will be 0 if filter_var returns false
        $res = intval(filter_var($_GET['res'], FILTER_VALIDATE_INT));
        if ($res < 1 || $res > 25)
        {
            throw new Exception('Variable res not set');
        }
    }
    catch (Exception $e)
    {
        // If an exception occur, let's just set the default value
        $res = $default;
    }

    // And finally, generate a correct js code with no possible injection
    echo "params.get.res = " . $res . ";\n";
