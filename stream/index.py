#!/usr/bin/python
# -*- coding: utf-8 -*-

import sys
import cgi
from webtools import Web

def main():
    print('Content-type: text/html')
    print()

    page = Web.Element(Web.ROOT_DIR + 'templates/page.html')
    head = Web.Element(Web.ROOT_DIR + 'templates/head.html')
    body = Web.Element(Web.ROOT_DIR + 'templates/body.html')
    jsIncludes = Web.Element(Web.ROOT_DIR + 'templates/jsIncludes.html')

    # Parse parameter res
    res = None
    try:
        parameters = cgi.FieldStorage()
        res = int(cgi.escape(parameters.getvalue('res')))
        if res < 1 or res > 25:
            raise IndexError('res must be between 1 and 25')
    except:
        res = 5

    mainJs = Web.Element()
    mainJs.open_string = """\
        <script>
            params = {};
            params.get = {};
            params.post = {};
            params.get.res = """ + str(res) + """;
        </script>
        <script src="js/main.js"></script>\
"""
    content = Web.Element('index.html')

    page.add_child(head)
    page.add_child(body)
    body.add_child(content)
    body.add_child(jsIncludes)
    jsIncludes.add_child(mainJs)

    page.print({'res' : res})

if __name__ == '__main__':
    main()
