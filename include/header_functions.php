<?php

    function head($title = "Title")
    {
        echo "\n\t<head>\n";
        echo "\t\t<title>The begining - " . $title . "</title>\n";
        echo "\t\t<meta charset='utf-8' />\n";
        echo "\t\t<link rel=\"stylesheet\" href=\"http://fonts.googleapis.com/css?family=Ubuntu:400,700,400italic\" />\n";
        echo "\t\t<link rel=\"stylesheet\" href=\"/css/style.css\" />\n";
        echo "\t</head>\n\n";
    }

