#!/bin/bash

shopt -s globstar
set -e

type gstat &>/dev/null && STAT="gstat" || STAT="stat"
TMPFILE=$(mktemp)
DEST_DIR="$PWD/public/resources/"

mkdir -p "$DEST_DIR"
cd resources/
for IMG in **/*; do
    DEST="$DEST_DIR$IMG"
    test -d "$IMG" && continue
    test -e "$DEST" && continue

    imagemin \
        --plugin.pngquant.quality=0.3 \
        --plugin.pngquant.quality=0.5 \
        --plugin.pngquant.strip \
        --plugin.pngquant.speed=4 \
        --plugin.mozjpeg.quality=70 \
        "$IMG" > "$TMPFILE"

    OPTI_SIZE=$($STAT -c%s "$TMPFILE")
    ORIG_SIZE=$($STAT -c%s "$IMG")

    echo "$IMG -- $(($OPTI_SIZE*100/$ORIG_SIZE))%"

    if [ $OPTI_SIZE -lt $ORIG_SIZE ]; then
        mkdir -p "$(dirname $DEST)"
        cp "$TMPFILE" "$DEST"
    fi
done
