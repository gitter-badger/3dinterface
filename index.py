#!/usr/bin/python
# -*- coding: utf-8 -*-

from django import template
from django.conf import settings

settings.configure()
t = template.Template(open('index.html','r').read())
c = template.Context({})
v = t.render(c)

print('Content-type: text/html')
print()

print(v)


# Web.render('index.html')
