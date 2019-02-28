#!/bin/bash -eu

cd $(dirname $0)

dir=$(pwd)
posts="$dir/source/_posts"
cd $posts

file_list=$(grep -LE '^categories:(\s[A-Z][a-zA-Z]*)+$' *)

if [ -n "$file_list" ]
then
  echo "Please review the category name of following files:"
  echo
  echo $file_list

  exit 1
fi

lint-md . --config "$dir/lint-md.json"

exit 0
