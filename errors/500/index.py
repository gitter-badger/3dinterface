#!/usr/bin/python
# -*- coding: utf-8 -*-

import sys
from webtools import Web

def main():
    print('Content-type: text/html')
    print()

    page = Web.Element(Web.ROOT_DIR + 'templates/page.html')
    head = Web.Element(Web.ROOT_DIR + 'templates/head.html')
    body = Web.Element(Web.ROOT_DIR + 'templates/body.html')
    content = Web.Element('index.html')

    page.add_child(head)
    page.add_child(body)
    body.add_child(content)

    page.print()

if __name__ == '__main__':
    main()
