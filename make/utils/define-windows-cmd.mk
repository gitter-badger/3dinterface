MERGE=copy /E /y
TOUCH_DIRSTAMP=copy /b $@+,,
MKDIRP=mkdir
RMRF=rd /s /q
DEVNULL=NUL
ECHO=echo
FIND=$(shell dir /s /b $1\$2)
