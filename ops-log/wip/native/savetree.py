import json,sys
raw=json.load(open(sys.argv[1]))
if isinstance(raw,list):
    t=raw[0]['text']
    d=json.JSONDecoder().raw_decode(t)[0]
else: d=raw
if 'result' in d: d=d['result'][0]['data']
json.dump(d,open(sys.argv[2],'w'))
print(sys.argv[2], d['type'], d['id'])
