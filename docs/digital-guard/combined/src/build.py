"""Combine the design doc into one Word file (+ PDF via LibreOffice).
Usage: python3 build.py  ->  raw.docx -> book_fixed.docx ; then soffice --convert-to pdf, python3 pages.py, python3 build.py again to fill TOC page numbers.
Needs: pandoc, python3-lxml, LibreOffice."""
import re,subprocess,sys,json,os
import pathlib
HERE=pathlib.Path(__file__).resolve().parent
os.chdir(HERE)
D=str(HERE.parent.parent)+'/'
ORDER=['README.md','01-overview.md','02-screens.md','03-cases.md','04-levels-and-scoring.md','05-visual-themes.md','06-unity-architecture.md','07-ux-accessibility.md','08-save-and-errors.md','09-roadmap-and-tests.md','11-modes-and-ui.md','10-appendix.md','play-guide.md','HANDOFF.md']
F='<w:rFonts w:ascii="맑은 고딕" w:eastAsia="맑은 고딕" w:hAnsi="맑은 고딕" w:cs="맑은 고딕" w:hint="eastAsia"/>'
PB='\n\n```{=openxml}\n<w:p><w:r><w:br w:type="page"/></w:r></w:p>\n```\n\n'
def esc(t): return t.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
def para(text,sz,color='22201F',bold=False,before=0,after=120):
    return f'<w:p><w:pPr><w:spacing w:before="{before}" w:after="{after}"/><w:jc w:val="center"/></w:pPr><w:r><w:rPr>{F}{"<w:b/>" if bold else ""}<w:color w:val="{color}"/><w:sz w:val="{sz}"/><w:szCs w:val="{sz}"/></w:rPr><w:t xml:space="preserve">{esc(text)}</w:t></w:r></w:p>'
parts=[];heads=[]
for f in ORDER:
    s=open(D+f,encoding='utf-8').read()
    s=re.sub(r'^\[← [^\]]*\]\([^)]*\)\s*$','',s,flags=re.M)
    s=re.sub(r'\[([^\]]+)\]\((?!https?://)[^)]*\)',r'\1',s)
    if f=='README.md': s=s.replace('# Data, Please.','# 개요',1)
    if f=='HANDOFF.md': s=s.replace('# Data, Please. — 작업 인계 노트','# 부록 · 작업 인계 노트',1)
    if f=='play-guide.md': s=s.replace('# Data, Please. 플레이 가이드 (게임 밖 설명)','# 부록 · 플레이 가이드 (게임 밖 설명)',1)
    s=s.strip(); heads.append(re.match(r'# (.+)',s).group(1)); parts.append(s)
pages=json.load(open('pages.json')) if os.path.exists('pages.json') else {}
cover=''.join([para('Data, Please.',80,'1F2A4A',True,3200,200),para('게임 기획서 · 합본',40,'2A8C88',True,0,600),
  para('추리 퍼즐 · 심사 시뮬레이션  |  Unity 6 · Android / iOS · 세로 화면',22,'3A4E7A'),
  para('기획 v0.4  ·  2026. 10. 16.',22,'3A4E7A',False,0,1600),
  para('팀 셜록홈즈',26,'22201F',True),para('소프트웨어창의설계1 (캡스톤디자인)',22,'22201F'),
  para('※ 게임 속 인물·기관·번호·주소는 모두 가상입니다. Unity 구현 전 기획 단계 문서이며, 화면은 HTML 시제품 기준입니다.',16,'6B6560',False,2400)])
toc=[f'<w:p><w:pPr><w:spacing w:after="240"/></w:pPr><w:r><w:rPr>{F}<w:b/><w:color w:val="1F2A4A"/><w:sz w:val="36"/></w:rPr><w:t>목차</w:t></w:r></w:p>']
for i,h in enumerate(heads):
    pg=str(pages.get(h,'?'))
    fld_begin=('<w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> TOC \\o "1-1" \\h \\z \\u </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r>') if i==0 else ''
    fld_end='<w:r><w:fldChar w:fldCharType="end"/></w:r>' if i==len(heads)-1 else ''
    toc.append(f'<w:p><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9590"/></w:tabs><w:spacing w:after="80"/></w:pPr>{fld_begin}<w:r><w:rPr>{F}<w:sz w:val="21"/></w:rPr><w:t xml:space="preserve">{esc(h)}</w:t></w:r><w:r><w:rPr>{F}<w:sz w:val="21"/></w:rPr><w:tab/><w:t>{pg}</w:t></w:r>{fld_end}</w:p>')
toc.append(para('쪽수는 PDF 기준입니다. Word에서는 목차를 마우스 오른쪽 → 필드 업데이트로 다시 맞출 수 있습니다.',16,'6B6560',False,300))
front='```{=openxml}\n'+cover+'\n```'+PB+'```{=openxml}\n'+''.join(toc)+'\n```'
open('book.md','w',encoding='utf-8').write(front+PB+PB.join(parts)+'\n')
subprocess.run(['pandoc','book.md','-f','markdown-yaml_metadata_block','-o','raw.docx','--reference-doc','reference.docx'],check=True)
subprocess.run(['python3','fixdocx.py','raw.docx','book_fixed.docx'],check=True)
print('heads',len(heads))
json.dump(heads,open('heads.json','w'),ensure_ascii=False)
