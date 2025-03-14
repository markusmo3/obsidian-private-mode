#!/usr/bin/env bash

PLUGIN_NAME=${1:-${PWD##*/}}

rm -r ${PLUGIN_NAME}
mkdir ${PLUGIN_NAME}
for f in main.js manifest.json styles.scss styles.css; do
  if [[ -f $f ]]; then
      cp $f "${PLUGIN_NAME}/"
  fi
done
zip -r "${PLUGIN_NAME}".zip "$PLUGIN_NAME"
