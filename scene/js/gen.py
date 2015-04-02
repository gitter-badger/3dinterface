#!/usr/bin/python3

import random

N = 4;

def rand_vector():
    print('new THREE.Vector3(', end='')
    print(random.uniform(-500,500), end='')
    print(',', end='')
    print(random.uniform(-500,500), end='')
    print(',', end='')
    print(random.uniform(0,500), end='')
    print(')', end='')

def rand_color():
    chars = [ str(x) for x in range(10)] + [chr(x) for x in range(ord('a'), ord('f') + 1)]
    print('0x', end='')
    for i in range(6):
        print(chars[random.randint(0, len(chars)-1)],end='');

def gen_positions():
    print('var positions = [')
    for i in range(N):
        print('    ', end='')
        rand_vector()
        print(',')
    print('    ', end='')
    gen_vector()
    print('\n];')

def gen_colors():
    print('var colors = [')
    for i in range(N):
        print('    ', end='')
        rand_color()
        print(',')
    print('    ', end='')
    rand_color()
    print('\n];')


def main():
    gen_colors()

if __name__ == '__main__':
    main()


