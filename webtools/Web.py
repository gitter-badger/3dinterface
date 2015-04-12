#!/usr/bin/python
# -*- coding: utf-8 -*-

import sys
import os

# ROOT_DIR = '/'.join(__file__.split('/')[:-2]) + '/'
ROOT_DIR = '/home/thomas/stage/javascript/web/'


class Element:
    def __init__(self, filename = None):
        self.children = []
        self.open_string = ''
        self.close_string = ''
        if filename:
            self.load(filename)

    def load(self, filename):
        with open(filename, 'r') as f:
            first_part = True
            for line in f:
                if line[0] == '#':
                    first_part = False
                    continue
                if first_part:
                    self.open_string += line
                else:
                    self.close_string += line
        self.open_string = self.open_string[:-1]
        self.close_string = self.close_string[:-1]

    def open(self, format = {}):
        print(self.open_string % format)

    def close(self, format = {}):
        print(self.close_string % format)

    def add_child(self, child):
        self.children.append(child)

    def print(self, format = {}):
        self.open()
        for i in self.children:
                i.print(format)
        self.close()
