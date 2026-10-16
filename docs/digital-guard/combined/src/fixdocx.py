"""Post-process pandoc docx: schema child order, A4 section + page-number footer, updateFields."""
import re,sys,zipfile
from lxml import etree
W='http://schemas.openxmlformats.org/wordprocessingml/2006/main'
SET=['writeProtection', 'view', 'zoom', 'removePersonalInformation', 'removeDateAndTime', 'doNotDisplayPageBoundaries', 'displayBackgroundShape', 'printPostScriptOverText', 'printFractionalCharacterWidth', 'printFormsData', 'embedTrueTypeFonts', 'embedSystemFonts', 'saveSubsetFonts', 'saveFormsData', 'mirrorMargins', 'alignBordersAndEdges', 'bordersDoNotSurroundHeader', 'bordersDoNotSurroundFooter', 'gutterAtTop', 'hideSpellingErrors', 'hideGrammaticalErrors', 'activeWritingStyle', 'proofState', 'formsDesign', 'attachedTemplate', 'linkStyles', 'stylePaneFormatFilter', 'stylePaneSortMethod', 'documentType', 'mailMerge', 'revisionView', 'trackRevisions', 'doNotTrackMoves', 'doNotTrackFormatting', 'documentProtection', 'autoFormatOverride', 'styleLockTheme', 'styleLockQFSet', 'defaultTabStop', 'autoHyphenation', 'consecutiveHyphenLimit', 'hyphenationZone', 'doNotHyphenateCaps', 'showEnvelope', 'summaryLength', 'clickAndTypeStyle', 'defaultTableStyle', 'evenAndOddHeaders', 'bookFoldRevPrinting', 'bookFoldPrinting', 'bookFoldPrintingSheets', 'drawingGridHorizontalSpacing', 'drawingGridVerticalSpacing', 'displayHorizontalDrawingGridEvery', 'displayVerticalDrawingGridEvery', 'doNotUseMarginsForDrawingGridOrigin', 'drawingGridHorizontalOrigin', 'drawingGridVerticalOrigin', 'doNotShadeFormData', 'noPunctuationKerning', 'characterSpacingControl', 'printTwoOnOne', 'strictFirstAndLastChars', 'noLineBreaksAfter', 'noLineBreaksBefore', 'savePreviewPicture', 'doNotValidateAgainstSchema', 'saveInvalidXml', 'ignoreMixedContent', 'alwaysShowPlaceholderText', 'doNotDemarcateInvalidXml', 'saveXmlDataOnly', 'useXSLTWhenSaving', 'saveThroughXslt', 'showXMLTags', 'alwaysMergeEmptyNamespace', 'updateFields', 'hdrShapeDefaults', 'footnotePr', 'endnotePr', 'compat', 'docVars', 'rsids', 'mathPr', 'attachedSchema', 'themeFontLang', 'clrSchemeMapping', 'doNotIncludeSubdocsInStats', 'doNotAutoCompressPictures', 'forceUpgrade', 'captions', 'readModeInkLockDown', 'smartTagType', 'schemaLibrary', 'shapeDefaults', 'doNotEmbedSmartTags', 'decimalSymbol', 'listSeparator']  # CT_Settings child order (ECMA-376 transitional)
STY=['name','aliases','basedOn','next','link','autoRedefine','hidden','uiPriority','semiHidden','unhideWhenUsed','qFormat','locked','personal','personalCompose','personalReply','rsid','pPr','rPr','tblPr','trPr','tcPr','tblStylePr']
def reorder(el,order):
    kids=list(el); idx={n:i for i,n in enumerate(order)}
    keyed=sorted(enumerate(kids),key=lambda t:(idx.get(etree.QName(t[1]).localname,len(order)) if isinstance(t[1].tag,str) else len(order),t[0]))
    for k in kids: el.remove(k)
    for _,k in keyed: el.append(k)
src,dst=sys.argv[1],sys.argv[2]
z=zipfile.ZipFile(src); files={n:z.read(n) for n in z.namelist()}
# styles
s=files['word/styles.xml'].decode().replace('<w:color w:val="345A8A" />&gt;','<w:color w:val="345A8A" />')
root=etree.fromstring(s.encode())
for st in root.iter('{%s}style'%W): reorder(st,STY)
for ppr in root.iter('{%s}pPr'%W):
    j=ppr.find('{%s}jc'%W); sp=ppr.find('{%s}spacing'%W)
    if j is not None and sp is not None and list(ppr).index(j)<list(ppr).index(sp): ppr.remove(j); sp.addnext(j)
files['word/styles.xml']=etree.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True)
# settings
root=etree.fromstring(files['word/settings.xml']); reorder(root,SET)
files['word/settings.xml']=etree.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True)
# numbering nsid
n=files['word/numbering.xml'].decode()
files['word/numbering.xml']=re.sub(r'(<w:nsid w:val=")([0-9A-Fa-f]+)(")',lambda m:m.group(1)+m.group(2).upper().zfill(8)[-8:]+m.group(3),n).encode()
# document
d=files['word/document.xml'].decode()
d=re.sub(r'<w:pPr>(<w:numPr>.*?</w:numPr>)(<w:pStyle [^>]*/>)',r'<w:pPr>\2\1',d)
d=re.sub(r'(<w:tblW [^>]*/>)(<w:tblLook [^>]*/>)(<w:jc [^>]*/>)',r'\1\3\2',d)
FTR='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:color w:val="7F8BA3"/><w:sz w:val="16"/></w:rPr><w:t xml:space="preserve">Data, Please. 게임 기획서  ·  </w:t></w:r><w:r><w:rPr><w:color w:val="7F8BA3"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:color w:val="7F8BA3"/><w:sz w:val="16"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:rPr><w:color w:val="7F8BA3"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:rPr><w:color w:val="7F8BA3"/><w:sz w:val="16"/></w:rPr><w:t>1</w:t></w:r><w:r><w:rPr><w:color w:val="7F8BA3"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>\n'.encode()
files['word/footer1.xml']=FTR
d=re.sub(r'<w:sectPr\s*/>|<w:sectPr.*?</w:sectPr>','',d,flags=re.S)
d=d.replace('</w:body>','<w:sectPr><w:footerReference w:type="default" r:id="rIdFtr1"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1250" w:right="1150" w:bottom="1250" w:left="1150" w:header="700" w:footer="600" w:gutter="0"/></w:sectPr></w:body>',1)
if 'xmlns:r=' not in d[:3000]: d=d.replace('<w:document ','<w:document xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ',1)
files['word/document.xml']=d.encode()
rel=files['word/_rels/document.xml.rels'].decode()
if 'rIdFtr1' not in rel: rel=rel.replace('</Relationships>','<Relationship Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Id="rIdFtr1" Target="footer1.xml"/></Relationships>')
files['word/_rels/document.xml.rels']=rel.encode()
ct=files['[Content_Types].xml'].decode()
if 'footer1.xml' not in ct: ct=ct.replace('</Types>','<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>')
files['[Content_Types].xml']=ct.encode()
st=etree.fromstring(files['word/settings.xml'])
if st.find('{%s}updateFields'%W) is None:
    u=etree.SubElement(st,'{%s}updateFields'%W); u.set('{%s}val'%W,'true'); reorder(st,SET)
files['word/settings.xml']=etree.tostring(st,xml_declaration=True,encoding='UTF-8',standalone=True)
with zipfile.ZipFile(dst,'w',zipfile.ZIP_DEFLATED) as o:
    for nm in files: o.writestr(nm,files[nm])
