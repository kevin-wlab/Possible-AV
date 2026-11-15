#!/bin/bash
# release.sh "<msg>" : build the release pages, split them for Webflow, rebuild web/ref, commit + merge, print the commit sha
set -e
cd /home/claude/pav-hero
LIVE=$(python3 -c "import re;print(','.join(re.search(r\"^LIVE=\[(.*?)\]\",open('port.py').read(),re.M).group(1).replace(\"'\",'').split(',')))")
python3 mk2.py --live $LIVE >/dev/null && python3 mk_home.py >/dev/null && python3 port.py >/dev/null
python3 - <<'P'
import os,re
W='/home/claude/possible-av/web/'
LIVE=re.search(r"^LIVE=\[(.*?)\]",open('/home/claude/pav-hero/port.py').read(),re.M).group(1).replace("'","").split(',')
for k in ['home','services']+LIVE:
    b=open('/home/claude/pav-hero/port/%s.body.html'%k).read()
    im=open(W+k+'.importmap.json').read() if os.path.exists(W+k+'.importmap.json') else ''
    js='<script type="module" src="../%s.js"></script>'%k if os.path.exists(W+k+'.js') else ''
    h='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">\n<link rel="stylesheet" href="../%s.css">%s</head><body>\n%s\n<script src="../%s.ui.js"></script>%s</body></html>'%(k,('<script type="importmap">%s</script>'%im) if im else '',b,k,js)
    open(W+'ref/%s.html'%k,'w').write(h)
P
cp port.py frag.py acts.py code.py release.sh upload-helper.js port/assets.txt /home/claude/possible-av/ops-log/wip/
cd /home/claude/possible-av
git stash -q 2>/dev/null || true; git checkout -q main; git pull -q; B=kevin/rel-$(date +%H%M%S); git checkout -q -B $B; git stash pop -q 2>/dev/null || true
git add web ops-log/wip
git diff --cached --quiet && { git rev-parse origin/main; exit 0; }
git commit -q -m "$1

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01WLBd7ALw3L66VWPiBxB8HB"
git push -q origin $B 2>&1 | grep -v '^remote:' || true
n=$(gh api repos/kevin-wlab/possible-av/pulls -X POST -f title="$1" -f head=$B -f base=main -f body=$'Webflow port files.\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n\nhttps://claude.ai/code/session_01WLBd7ALw3L66VWPiBxB8HB' --jq .number)
gh api repos/kevin-wlab/possible-av/pulls/$n/merge -X PUT -f merge_method=merge --jq .sha
