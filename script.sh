#!/bin/bash

#ls - List directory contents
echo -e "Hello, World!\n"
echo "List directory:"
ls
echo -e "\nList directory - Long List Format:"
ls -l
echo -e "\nList directory - include hidden files:"
ls -a
echo -e "\nList directory - human readable size:"
ls -h
echo -e "\nList directory - Sort by modification time:"
ls -t
echo -e "\nList directory - Reverse order while sorting:"
ls -r
echo -e "\nList directory - List subdirectories recursively:"
ls -R
echo -e "\nList directory - Sort by file size:"
ls -S
echo -e "\nList directory - List one file per line:"
ls -1
echo -e "\nList directory - List directories themselves, not their contents:"
ls -d /*
echo -e "\nList directory - Append indicator (one of */=@|) to entries:"
ls -F