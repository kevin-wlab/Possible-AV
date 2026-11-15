#!/bin/bash
# ft.sh <slot a|b|c|d|m> <page key> <mode> ...     builds a private test copy of ONE film page and screenshots it
#   stops <w> <h> <stop> [<stop>...]                 whole page at scroll stops (0 = opening). Files: /tmp/pvt-<slot>/<page>_<w>_<stop>.png
#   cam <stop> name:px,py,pz,lx,ly,lz,fov [...]      free camera, no page furniture, 760x560. Files: <page>_cam_<name>.png
#   thumb <stop> name:px,py,pz,lx,ly,lz,fov [...]    same at 960x720, also saved as img/<page>-<name>.jpg for the at-a-glance cards
#   glance [w]                                       the at-a-glance section as laid out (default width 1280; try 390 for phones)
set -e
slot=$1; page=$2; mode=$3; shift 3
case $slot in a) port=8771;; b) port=8772;; c) port=8773;; d) port=8775;; *) port=8774;; esac
d=/tmp/pvt-$slot; mkdir -p $d /home/claude/pav-hero/img
ln -sfn /tmp/pvt/node_modules $d/node_modules; ln -sfn /home/claude/pav-hero/img $d/img
python3 /home/claude/pav-hero/mk2.py --test $d --only $page
[ -f $d/$page.html ] || { echo "page '$page' was not built: it needs src/film/models/$page.js, src/film/pages/$page.js and src/film/pages/$page.body.html"; exit 1; }
curl -s -o /dev/null localhost:$port/$page.html || { (cd $d && setsid nohup python3 -m http.server $port >/dev/null 2>&1 </dev/null &); sleep 1; }
python3 /home/claude/pav-hero/filmshot.py $port $d $page $mode "$@"
