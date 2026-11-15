# builds Webflow CMS fieldData for the new posts: posts/<slug>.json + posts/images.json -> /tmp/items.json
import json,sys
NEW=['stage-deck-sizes-guide','what-is-uplighting-event-guide','markerless-vs-marker-motion-capture','touch-screen-kiosk-rental-events','projector-screen-size-lumens-guide','corporate-event-production-nyc-guide','event-sound-system-guide']
IMG=json.load(open('/home/claude/pav-hero/posts/images.json'))
items=[]
for n,s in enumerate(NEW):
    d=json.load(open('/home/claude/pav-hero/posts/%s.json'%s)); url='https://www.possibleav.com/post/'+s
    fig='<figure class="w-richtext-figure-type-image w-richtext-align-fullwidth"><div><img src="%s" alt="%s" loading="lazy"></div></figure>'%(IMG[s],d['image-alt'].replace('"','&quot;'))
    body=d['body'].replace('<p>[[IMAGE]]</p>',fig)
    ld={"@context":"https://schema.org","@graph":[{"@type":"BlogPosting","@id":url+"#article","headline":d['name'],"description":d['meta-description'],"url":url,"mainEntityOfPage":url,"image":IMG[s],"datePublished":"2026-11-15","dateModified":"2026-11-15","articleSection":d['category'],"inLanguage":"en-US","author":{"@type":"Organization","name":"Possible AV","url":"https://www.possibleav.com/"},"publisher":{"@type":"Organization","name":"Possible AV","url":"https://www.possibleav.com/"}},
      {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://www.possibleav.com/"},{"@type":"ListItem","position":2,"name":"Blog","item":"https://www.possibleav.com/blog"},{"@type":"ListItem","position":3,"name":d['name'],"item":url}]},
      {"@type":"FAQPage","@id":url+"#faq","mainEntity":[{"@type":"Question","name":q['q'],"acceptedAnswer":{"@type":"Answer","text":q['a']}} for q in d['faq']]}]}
    body+='<div data-rt-embed-type="true"><script type="application/ld+json">%s</script></div>'%json.dumps(ld,ensure_ascii=False)
    items.append({"fieldData":{"name":d['name'],"slug":s,"category":d['category'],"read-time":d['read-time'],"post-date":"November 2026","excerpt":d['excerpt'],"body":body,"related-service":d['related-service'],"order":20-n,"meta-title":d['meta-title'],"meta-description":d['meta-description']},"isDraft":False})
json.dump(items,open('/tmp/items.json','w'),ensure_ascii=False)
print(len(items),[len(json.dumps(i)) for i in items])
