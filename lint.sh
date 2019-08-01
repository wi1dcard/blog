#!/bin/sh -eu

yarn run lint

file_list=$(grep -LE '^categories:(\s[A-Z][a-zA-Z]*)+$' ./source/_posts/*)

if [ -n "$file_list" ]
then
  echo "Please review the category name of following files:"
  echo
  echo $file_list

  exit 1
fi

exit 0
