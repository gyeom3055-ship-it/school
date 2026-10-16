import json,subprocess,re
heads=json.load(open('heads.json'))
n=int(re.search(r'Pages:\s+(\d+)',subprocess.run(['pdfinfo','book_fixed.pdf'],capture_output=True,text=True).stdout).group(1))
norm=lambda x:re.sub(r'\s+','',x)
txt={p:subprocess.run(['pdftotext','-f',str(p),'-l',str(p),'book_fixed.pdf','-'],capture_output=True,text=True).stdout for p in range(1,n+1)}
pages={}
for h in heads:
    key=norm(h)[:14]
    for p in range(3,n+1):
        if key in norm(''.join(txt[p].strip().splitlines()[:3])): pages[h]=p; break
print(n,[pages.get(h) for h in heads])
json.dump(pages,open('pages.json','w'),ensure_ascii=False)
