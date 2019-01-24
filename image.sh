#!/bin/bash -eu

dir=$(dirname $0)
tmp_file=$(mktemp)

pngpaste $tmp_file

hash=$(md5 < $tmp_file)
img="/resources/$hash.png"

mv $tmp_file "$dir/source$img"
echo "![]($img)" | tee >(pbcopy)
