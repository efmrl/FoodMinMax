#! /bin/sh -xe

find src -print | entr ./sync.sh
