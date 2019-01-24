#!/bin/bash -eu

cd $(dirname $0)
dir=$(pwd)
cd "$dir/source/_posts"

file_list=$(grep -LE '^categories:(\s[A-Z][a-zA-Z]*)+$' *)

if [ -n "$file_list" ]
then
  echo "Please review the category name of following files:"
  echo
  echo $file_list

  exit 1
fi

file_list=$(echo *.md | tr ' ' "\n" | grep -v "jootu-copywriting-style-guide" | tr "\n" ' ')

lint-md $file_list --config "$dir/lint-md.json"

exit 0
