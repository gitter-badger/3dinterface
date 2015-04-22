#!/usr/bin/python
# -*- coding: utf-8 -*-

import sys
from webtools import Web

Web.render('index.html')

print('<a href="/priv">download</a>')
