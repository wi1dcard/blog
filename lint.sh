#!/bin/bash -eu

cd $(dirname $0)/source/_posts

file_list=$(grep -LE '^categories:(\s[A-Z][a-zA-Z]*)+$' *)

if [ -n "$file_list" ]
then
  echo "Please review the category name of following files:"
  echo
  echo $file_list

  exit 1
fi

exit 0
