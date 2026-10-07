"""Small source-only release checks; never substitutes for browser execution."""
import hashlib
import json
import pathlib
import re
from html.parser import HTMLParser

SOURCE = pathlib.Path(__file__).resolve().parents[1]

class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.nodes=[]; self.ids=[]; self.labels=set(); self.stack=[]; self.feed(text)
    def handle_starttag(self, tag, attrs):
        a=dict(attrs); node={'tag':tag, **a}; self.nodes.append(node)
        if 'id' in a:self.ids.append(a['id'])
        if tag=='label' and a.get('for'):self.labels.add(a['for'])

html=(SOURCE/'index.html').read_text();js=(SOURCE/'app.js').read_text();doc=Document(html)
checks=[]
def check(name, condition):
    checks.append({'name':name,'status':'PASS' if condition else 'FAIL'})

textareas=[n for n in doc.nodes if n['tag']=='textarea']
check('Exactly three short-response textareas',len(textareas)==3)
check('Response IDs/names match the v2 API', {(n.get('id'),n.get('name')) for n in textareas}=={('initial-position','initialPosition'),('final-reason','finalReason'),('tradeoff','tradeoff')})
check('Each response cap matches the 1800-character backend',all(n.get('maxlength')=='1800' for n in textareas))
check('Every textarea has a native associated label',all(n.get('id') in doc.labels for n in textareas))
check('No duplicate HTML IDs',len(doc.ids)==len(set(doc.ids)))
check('Initial and final proposals expose all three choices',all({n.get('value') for n in doc.nodes if n.get('name')==name}=={'cup','open','showcase'} for name in ['initialChoice','finalChoice']))
check('Only the three approved adjustments are offered',{n.get('value') for n in doc.nodes if n.get('name')=='adjustment'}=={'orientation','extra_host','rotations'})
check('New information starts hidden',any(n.get('id')=='revision-stage' and 'hidden' in n for n in doc.nodes))
check('Guest consent is opt-in by default',any(n.get('id')=='guest-consent' and 'checked' not in n for n in doc.nodes))
check('Manual grading, full-credit retention and instructor-only scores are explicit','Your instructor scores the reasoning' in html and 'Keeping your original format can earn full credit' in html and 'score kept in instructor records' in js)
check('10–15 minute individual activity is explicit','10–15' in html and 'Individual' in html)
check('No Andrew dependency in student prompt',not re.search(r'Andrew',html,re.I) and 'No outside research or guest interview is required' in html)
check('Audience uncertainty precedes the update','experience is not yet confirmed' in html and 'are new to gaming PCs' in html and 'supported hands-on turn' in html)
check('Orientation replaces ten minutes and rotations lose uninterrupted play','Replace 10 minutes' in html and '60 minutes' in html and 'Give up some uninterrupted play' in html)
check('Names, email and individual-work inputs exist',all(any(n.get('id')==x and n.get('name')==x for n in doc.nodes) for x in ['firstName','lastName','email','individualWork']))
check('Driver targets the separate v2 endpoint','/spm343-tap-lab2-v2' in js)
check('Driver uses native text insertion for frozen writing',"$('original-plan').textContent=" in js)
check('Fixed synthetic test identity is used by driver',"firstName:'Synthetic',lastName:'Fixture',email:'tap-v2@example.invalid',individualWork:true" in js)
report={'scope':'Source-only assertions; no browser layout, interaction, or production key claim','checks':checks,'sourceSHA256':{name:hashlib.sha256((SOURCE/name).read_bytes()).hexdigest() for name in ['index.html','app.js','styles.css']}}
print(json.dumps(report,indent=2))
raise SystemExit(any(c['status']!='PASS' for c in checks))
