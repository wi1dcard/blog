#!/bin/bash -eu

DIR=$(dirname $0)
TMPFILE=$(mktemp)

pngpaste "$TMPFILE"

HASH=$(md5 < "$TMPFILE")
IMG="/resources/$HASH.png"

mv $TMPFILE "$DIR$IMG"
echo "![]($IMG)" | tee >(pbcopy)
