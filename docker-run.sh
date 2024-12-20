#!/usr/bin/env sh

DIR="$(dirname "$1")"
FILE="$(basename "$1")"

echo "$DIR\n"
echo "$FILE\n"

docker run --rm -u $(id -u):$(id -g) \
  -v "$DIR":/gpx-to-jpeg \
  zz-gpx-to-jpeg "/gpx-to-jpeg/$FILE"