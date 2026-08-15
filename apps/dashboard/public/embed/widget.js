var SupportAI=(function(E){"use strict";var zr=Object.defineProperty;var _r=(E,_,G)=>_ in E?zr(E,_,{enumerable:!0,configurable:!0,writable:!0,value:G}):E[_]=G;var b=(E,_,G)=>_r(E,typeof _!="symbol"?_+"":_,G);var de;class _ extends Error{constructor(r,s){super(r);b(this,"status");b(this,"code");b(this,"details");this.name="SupportAIError",this.status=s?.status,this.code=s?.code,this.details=s?.details}}function G(t,e){if(!t||typeof t!="object")return e;const r=t,s=r.error&&typeof r.error=="object"?r.error:null;for(const n of[s?.message,r.message]){if(typeof n=="string"&&n.trim())return n;if(Array.isArray(n)&&n.length)return n.filter(i=>typeof i=="string").join(", ")||e}return e}function st(t){if(!t||typeof t!="object")return;const e=t,r=e.error&&typeof e.error=="object"?e.error:null;return typeof r?.code=="string"?r.code:typeof e.code=="string"?e.code:void 0}function Ce(t){const e=t.split(`

`),r=e.pop()??"",s=[];for(const n of e){const i=n.split(`
`).filter(o=>o.startsWith("data:")).map(o=>o.slice(5).trimStart());if(i.length)try{const o=JSON.parse(i.join(`
`));s.push(o)}catch{}}return{events:s,rest:r}}function it(t){return t.replace(/\/+$/,"")}function at(t){return t&&typeof t=="object"&&"success"in t&&t.success===!0&&"data"in t?t.data:t}function ot(t){const e=it(t.apiUrl),r=t.fetch??fetch;function s(a,l){return{Accept:a,"Content-Type":"application/json",Authorization:`Bearer ${t.apiKey}`,...t.headers,...l}}async function n(a){let l=`Request failed (${a.status})`,c,p;try{const u=await a.json();p=u,l=G(u,l),c=st(u)}catch{}throw new _(l,{status:a.status,code:c,details:p})}async function i(a){const l=await r(`${e}/public/agents/${t.agentId}`,{method:"GET",headers:s("application/json"),signal:a});l.ok||await n(l);const c=await l.json();return at(c)}async function o(a){const l=JSON.stringify({message:a.message,...a.conversationId?{conversationId:a.conversationId}:{}}),c=await r(`${e}/public/agents/${t.agentId}/chat`,{method:"POST",headers:s("text/event-stream"),body:l,signal:a.signal});if(c.ok||await n(c),!c.body)throw new _("Chat stream is empty.");const p=c.body.getReader(),u=new TextDecoder;let d="";const w=g=>{if(a.onEvent?.(g),g.type==="error")throw new _(g.data.message||"Chat stream error")};for(;;){const{done:g,value:y}=await p.read();if(g)break;d+=u.decode(y,{stream:!0});const z=Ce(d);d=z.rest;for(const N of z.events)w(N)}if(d.trim()){const g=Ce(`${d}

`);for(const y of g.events)w(y)}}return{config:{...t,apiUrl:e},getAgent:i,chat:o}}const lt="support-ai:conversations:v1:",Pe="support-ai:conversation:";function Le(t){return`${lt}${t}`}function qe(){return{version:1,activeId:null,conversations:[]}}function Be(){return typeof localStorage<"u"}function F(t){if(!Be())return qe();try{const e=localStorage.getItem(Le(t));if(e){const s=JSON.parse(e);if(s?.version===1&&Array.isArray(s.conversations))return{version:1,activeId:s.activeId??null,conversations:s.conversations}}const r=localStorage.getItem(`${Pe}${t}`);if(r){const s={version:1,activeId:r,conversations:[{id:r,title:"Previous chat",updatedAt:Date.now(),messages:[]}]};return V(t,s),localStorage.removeItem(`${Pe}${t}`),s}}catch{}return qe()}function V(t,e){if(Be())try{localStorage.setItem(Le(t),JSON.stringify(e))}catch{}}function ct(t){const e=t.trim().replace(/\s+/g," ");return e?e.length>80?`${e.slice(0,77)}…`:e:"New chat"}function pt(t,e){const r=t.conversations.filter(s=>s.id!==e.id);return{...t,activeId:e.id,conversations:[e,...r].sort((s,n)=>n.updatedAt-s.updatedAt)}}function ut(t){return t.activeId?t.conversations.find(e=>e.id===t.activeId)??null:null}function be(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var M=be();function De(t){M=t}var j={exec:()=>null};function K(t){let e=[];return r=>{let s=Math.max(0,Math.min(3,r-1)),n=e[s];return n||(n=t(s),e[s]=n),n}}function f(t,e=""){let r=typeof t=="string"?t:t.source,s={replace:(n,i)=>{let o=typeof i=="string"?i:i.source;return o=o.replace(S.caret,"$1"),r=r.replace(n,o),s},getRegex:()=>new RegExp(r,e)};return s}var ht=((t="")=>{try{return!!new RegExp("(?<=1)(?<!1)"+t)}catch{return!1}})(),S={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] +\S/,listReplaceTask:/^\[[ xX]\] +/,listTaskCheckbox:/\[[ xX]\]/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:t=>new RegExp(`^( {0,3}${t})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:K(t=>new RegExp(`^ {0,${t}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)),hrRegex:K(t=>new RegExp(`^ {0,${t}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`)),fencesBeginRegex:K(t=>new RegExp(`^ {0,${t}}(?:\`\`\`|~~~)`)),headingBeginRegex:K(t=>new RegExp(`^ {0,${t}}#`)),htmlBeginRegex:K(t=>new RegExp(`^ {0,${t}}<(?:[a-z].*>|!--)`,"i")),blockquoteBeginRegex:K(t=>new RegExp(`^ {0,${t}}>`))},dt=/^(?:[ \t]*(?:\n|$))+/,gt=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,ft=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,Y=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,kt=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,xe=/ {0,3}(?:[*+-]|\d{1,9}[.)])/,Me=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,je=f(Me).replace(/bull/g,xe).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}(?:\s|$)/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),bt=f(Me).replace(/bull/g,xe).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}(?:\s|$)/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),me=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/,xt=/^[^\n]+/,we=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,mt=f(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",we).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),wt=f(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g,xe).getRegex(),le="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",ye=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,yt=f("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",ye).replace("tag",le).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),He=t=>f(me).replace("hr",Y).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~~~)[^\\n]*\\n").replace("list",t).replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",le).getRegex(),vt=He(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/),St=He(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/),$t=f(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",St).getRegex(),ve={blockquote:$t,code:gt,def:mt,fences:ft,heading:kt,hr:Y,html:yt,lheading:je,list:wt,newline:dt,paragraph:vt,table:j,text:xt},Ne=f("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",Y).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~~~)[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",le).getRegex(),Rt={...ve,lheading:bt,table:Ne,paragraph:f(me).replace("hr",Y).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",Ne).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~~~)[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",le).getRegex()},At={...ve,html:f(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",ye).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:j,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:f(me).replace("hr",Y).replace("heading",` *#{1,6} *[^
]`).replace("lheading",je).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},Tt=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,zt=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,Ze=/^( {2,}|\\)\n(?!\s*$)/,_t=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,L=/[\p{P}\p{S}]/u,W=/[\s\p{P}\p{S}]/u,ee=/[^\s\p{P}\p{S}]/u,Et=f(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,W).getRegex(),It=/[\p{Pi}\p{Ps}"']/u,Oe=/(?!~)[\p{P}\p{S}]/u,Ct=/(?!~)[\s\p{P}\p{S}]/u,Pt=/(?:[^\s\p{P}\p{S}]|~)/u,Lt=f(/link|precode-code|html/,"g").replace("link",/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-",ht?"(?<!`)()":"(^^|[^`])").replace("code",/(?<b>`+)[^`]+\k<b>(?!`)/).replace("html",/<(?! )[^<>]*?>/).getRegex(),Qe=/^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/,qt=f(Qe,"u").replace(/punct/g,L).getRegex(),Bt=f(Qe,"u").replace(/punct/g,Oe).getRegex(),Dt=/^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/,Mt=f(Dt,"u").replace(/openQuote/g,It).replace(/punct/g,L).getRegex(),Ue="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",jt=f(Ue,"gu").replace(/notPunctSpace/g,ee).replace(/punctSpace/g,W).replace(/punct/g,L).getRegex(),Ht=f(Ue,"gu").replace(/notPunctSpace/g,Pt).replace(/punctSpace/g,Ct).replace(/punct/g,Oe).getRegex(),Nt="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)",Zt=f(Nt,"gu").replace(/notPunctSpace/g,ee).replace(/punctSpace/g,W).replace(/punct/g,L).getRegex(),Ot=f("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,ee).replace(/punctSpace/g,W).replace(/punct/g,L).getRegex(),Qt="^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)",Ut=f(Qt,"gu").replace(/notPunctSpace/g,ee).replace(/punctSpace/g,W).replace(/punct/g,L).getRegex(),Gt=f(/^~~?(?:((?!~)punct)|[^\s~])/,"u").replace(/punct/g,L).getRegex(),Ft="^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)",Kt=f(Ft,"gu").replace(/notPunctSpace/g,ee).replace(/punctSpace/g,W).replace(/punct/g,L).getRegex(),Wt=f(/\\(punct)/,"gu").replace(/punct/g,L).getRegex(),Xt=f(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),Jt=f(ye).replace("(?:-->|$)","-->").getRegex(),Vt=f("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",Jt).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),ce=/(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/,Yt=f(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/).replace("label",ce).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),Ge=f(/^!?\[(label)\]\[(ref)\]/).replace("label",ce).replace("ref",we).getRegex(),Fe=f(/^!?\[(ref)\](?:\[\])?/).replace("ref",we).getRegex(),er=f("reflink|nolink(?!\\()","g").replace("reflink",Ge).replace("nolink",Fe).getRegex(),Ke=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,Se={_backpedal:j,anyPunctuation:Wt,autolink:Xt,blockSkip:Lt,br:Ze,code:zt,del:j,delLDelim:j,delRDelim:j,emStrongLDelim:qt,emStrongRDelimAst:jt,emStrongRDelimUnd:Ot,escape:Tt,link:Yt,nolink:Fe,punctuation:Et,reflink:Ge,reflinkSearch:er,tag:Vt,text:_t,url:j},tr={...Se,emStrongLDelim:Mt,emStrongRDelimAst:Zt,emStrongRDelimUnd:Ut,link:f(/^!?\[(label)\]\((.*?)\)/).replace("label",ce).getRegex(),reflink:f(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",ce).getRegex()},$e={...Se,emStrongRDelimAst:Ht,emStrongLDelim:Bt,delLDelim:Gt,delRDelim:Kt,url:f(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol",Ke).replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:f(/^(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol",Ke).getRegex()},rr={...$e,br:f(Ze).replace("{2,}","*").getRegex(),text:f($e.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},pe={normal:ve,gfm:Rt,pedantic:At},te={normal:Se,gfm:$e,breaks:rr,pedantic:tr},nr={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},We=t=>nr[t];function P(t,e){if(e){if(S.escapeTest.test(t))return t.replace(S.escapeReplace,We)}else if(S.escapeTestNoEncode.test(t))return t.replace(S.escapeReplaceNoEncode,We);return t}function Xe(t){try{t=encodeURI(t).replace(S.percentDecode,"%")}catch{return null}return t}function Je(t,e){let r=t.replace(S.findPipe,(i,o,a)=>{let l=!1,c=o;for(;--c>=0&&a[c]==="\\";)l=!l;return l?"|":" |"}),s=r.split(S.splitPipe),n=0;if(s[0].trim()||s.shift(),s.length>0&&!s.at(-1)?.trim()&&s.pop(),e)if(s.length>e)s.splice(e);else for(;s.length<e;)s.push("");for(;n<s.length;n++)s[n]=s[n].trim().replace(S.slashPipe,"|");return s}function B(t,e,r){let s=t.length;if(s===0)return"";let n=0;for(;n<s&&t.charAt(s-n-1)===e;)n++;return t.slice(0,s-n)}function Ve(t){let e=t.split(`
`),r=e.length-1;for(;r>=0&&S.blankLine.test(e[r]);)r--;return e.length-r<=2?t:e.slice(0,r+1).join(`
`)}function sr(t,e){if(t.indexOf(e[1])===-1)return-1;let r=0;for(let s=0;s<t.length;s++)if(t[s]==="\\")s++;else if(t[s]===e[0])r++;else if(t[s]===e[1]&&(r--,r<0))return s;return r>0?-2:-1}function ir(t,e=0){let r=e,s="";for(let n of t)if(n==="	"){let i=4-r%4;s+=" ".repeat(i),r+=i}else s+=n,r++;return s}function Ye(t,e,r,s,n){let i=e.href,o=e.title||null,a=t[1].replace(n.other.outputLinkReplace,"$1");s.state.inLink=!0;let l={type:t[0].charAt(0)==="!"?"image":"link",raw:r,href:i,title:o,text:a,tokens:s.inlineTokens(a)};return s.state.inLink=!1,l}function ar(t,e,r){let s=t.match(r.other.indentCodeCompensation);if(s===null)return e;let n=s[1];return e.split(`
`).map(i=>{let o=i.match(r.other.beginningSpace);if(o===null)return i;let[a]=o;return a.length>=n.length?i.slice(n.length):i}).join(`
`)}var ue=class{constructor(t){b(this,"options");b(this,"rules");b(this,"lexer");this.options=t||M}space(t){let e=this.rules.block.newline.exec(t);if(e&&e[0].length>0)return{type:"space",raw:e[0]}}code(t){let e=this.rules.block.code.exec(t);if(e){let r=this.options.pedantic?e[0]:Ve(e[0]),s=r.replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:r,codeBlockStyle:"indented",text:s}}}fences(t){let e=this.rules.block.fences.exec(t);if(e){let r=e[0],s=ar(r,e[3]||"",this.rules);return{type:"code",raw:r,lang:e[2]?e[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):e[2],text:s}}}heading(t){let e=this.rules.block.heading.exec(t);if(e){let r=e[2].trim();if(this.rules.other.endingHash.test(r)){let s=B(r,"#");(this.options.pedantic||!s||this.rules.other.endingSpaceChar.test(s))&&(r=s.trim())}return{type:"heading",raw:B(e[0],`
`),depth:e[1].length,text:r,tokens:this.lexer.inline(r)}}}hr(t){let e=this.rules.block.hr.exec(t);if(e)return{type:"hr",raw:B(e[0],`
`)}}blockquote(t){let e=this.rules.block.blockquote.exec(t);if(e){let r=B(e[0],`
`).split(`
`),s="",n="",i=[];for(;r.length>0;){let o=!1,a=[],l;for(l=0;l<r.length;l++)if(this.rules.other.blockquoteStart.test(r[l]))a.push(r[l]),o=!0;else if(!o)a.push(r[l]);else break;r=r.slice(l);let c=a.join(`
`),p=c.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");s=s?`${s}
${c}`:c,n=n?`${n}
${p}`:p;let u=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(p,i,!0),this.lexer.state.top=u,r.length===0)break;let d=i.at(-1);if(d?.type==="code")break;if(d?.type==="blockquote"){let w=d,g=r.join(`
`),y=w.raw+`
`+g.replace(this.rules.other.blockquoteSetextReplace2,""),z=this.blockquote(y);i[i.length-1]=z,s=`${s}
${g}`,n=n.substring(0,n.length-w.text.length)+z.text;break}else if(d?.type==="list"){let w=d,g=w.raw+`
`+r.join(`
`),y=this.list(g);i[i.length-1]=y,s=s.substring(0,s.length-d.raw.length)+y.raw,n=n.substring(0,n.length-w.raw.length)+y.raw,r=g.substring(i.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:s,tokens:i,text:n}}}list(t){let e=this.rules.block.list.exec(t);if(e){let r=e[1].trim(),s=r.length>1,n={type:"list",raw:"",ordered:s,start:s?+r.slice(0,-1):"",loose:!1,items:[]};r=s?`\\d{1,9}\\${r.slice(-1)}`:`\\${r}`,this.options.pedantic&&(r=s?r:"[*+-]");let i=this.rules.other.listItemRegex(r),o=!1;for(;t;){let l=!1,c="",p="";if(!(e=i.exec(t))||this.rules.block.hr.test(t))break;c=e[0],t=t.substring(c.length);let u=ir(e[2].split(`
`,1)[0],e[1].length),d=t.split(`
`,1)[0],w=!u.trim(),g=0;if(this.options.pedantic?(g=2,p=u.trimStart()):w?g=e[1].length+1:(g=u.search(this.rules.other.nonSpaceChar),g=g>4?1:g,p=u.slice(g),g+=e[1].length),w&&this.rules.other.blankLine.test(d)&&(c+=d+`
`,t=t.substring(d.length+1),l=!0),!l){let y=this.rules.other.nextBulletRegex(g),z=this.rules.other.hrRegex(g),N=this.rules.other.fencesBeginRegex(g),Z=this.rules.other.headingBeginRegex(g),X=this.rules.other.htmlBeginRegex(g),ze=this.rules.other.blockquoteBeginRegex(g);for(;t;){let D=t.split(`
`,1)[0],O;if(d=D,this.options.pedantic?(d=d.replace(this.rules.other.listReplaceNesting,"  "),O=d):O=d.replace(this.rules.other.tabCharGlobal,"    "),N.test(d)||Z.test(d)||X.test(d)||ze.test(d)||y.test(d)||z.test(d))break;if(O.search(this.rules.other.nonSpaceChar)>=g||!d.trim())p+=`
`+O.slice(g);else{if(w||u.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||N.test(u)||Z.test(u)||z.test(u))break;p+=`
`+d}w=!d.trim(),c+=D+`
`,t=t.substring(D.length+1),u=O.slice(g)}}n.loose||(o?n.loose=!0:this.rules.other.doubleBlankLine.test(c)&&(o=!0)),n.items.push({type:"list_item",raw:c,task:!!this.options.gfm&&this.rules.other.listIsTask.test(p),loose:!1,text:p,tokens:[]}),n.raw+=c}let a=n.items.at(-1);if(a)a.raw=a.raw.trimEnd(),a.text=a.text.trimEnd();else return;n.raw=n.raw.trimEnd();for(let l of n.items){this.lexer.state.top=!1,l.tokens=this.lexer.blockTokens(l.text,[]);let c=l.tokens[0];if(l.task&&(c?.type==="text"||c?.type==="paragraph")){l.text=l.text.replace(this.rules.other.listReplaceTask,""),c.raw=c.raw.replace(this.rules.other.listReplaceTask,""),c.text=c.text.replace(this.rules.other.listReplaceTask,"");for(let u=this.lexer.inlineQueue.length-1;u>=0;u--)if(this.rules.other.listIsTask.test(this.lexer.inlineQueue[u].src)){this.lexer.inlineQueue[u].src=this.lexer.inlineQueue[u].src.replace(this.rules.other.listReplaceTask,"");break}let p=this.rules.other.listTaskCheckbox.exec(l.raw);if(p){let u={type:"checkbox",raw:p[0]+" ",checked:p[0]!=="[ ]"};l.checked=u.checked,n.loose?l.tokens[0]&&["paragraph","text"].includes(l.tokens[0].type)&&"tokens"in l.tokens[0]&&l.tokens[0].tokens?(l.tokens[0].raw=u.raw+l.tokens[0].raw,l.tokens[0].text=u.raw+l.tokens[0].text,l.tokens[0].tokens.unshift(u)):l.tokens.unshift({type:"paragraph",raw:u.raw,text:u.raw,tokens:[u]}):l.tokens.unshift(u)}}else l.task&&(l.task=!1);if(!n.loose){let p=l.tokens.filter(d=>d.type==="space"),u=p.length>0&&p.some(d=>this.rules.other.anyLine.test(d.raw));n.loose=u}}if(n.loose)for(let l of n.items){l.loose=!0;for(let c of l.tokens)c.type==="text"&&(c.type="paragraph")}return n}}html(t){let e=this.rules.block.html.exec(t);if(e){let r=Ve(e[0]);return{type:"html",block:!0,raw:r,pre:e[1]==="pre"||e[1]==="script"||e[1]==="style",text:r}}}def(t){let e=this.rules.block.def.exec(t);if(e){let r=e[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),s=e[2]?e[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",n=e[3]?e[3].substring(1,e[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):e[3];return{type:"def",tag:r,raw:B(e[0],`
`),href:s,title:n}}}table(t){let e=this.rules.block.table.exec(t);if(!e||!this.rules.other.tableDelimiter.test(e[2]))return;let r=Je(e[1]),s=e[2].replace(this.rules.other.tableAlignChars,"").split("|"),n=e[3]?.trim()?e[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],i={type:"table",raw:B(e[0],`
`),header:[],align:[],rows:[]};if(r.length===s.length){for(let o of s)this.rules.other.tableAlignRight.test(o)?i.align.push("right"):this.rules.other.tableAlignCenter.test(o)?i.align.push("center"):this.rules.other.tableAlignLeft.test(o)?i.align.push("left"):i.align.push(null);for(let o=0;o<r.length;o++)i.header.push({text:r[o],tokens:this.lexer.inline(r[o]),header:!0,align:i.align[o]});for(let o of n)i.rows.push(Je(o,i.header.length).map((a,l)=>({text:a,tokens:this.lexer.inline(a),header:!1,align:i.align[l]})));return i}}lheading(t){let e=this.rules.block.lheading.exec(t);if(e){let r=e[1].trim();return{type:"heading",raw:B(e[0],`
`),depth:e[2].charAt(0)==="="?1:2,text:r,tokens:this.lexer.inline(r)}}}paragraph(t){let e=this.rules.block.paragraph.exec(t);if(e){let r=e[1].charAt(e[1].length-1)===`
`?e[1].slice(0,-1):e[1];return{type:"paragraph",raw:e[0],text:r,tokens:this.lexer.inline(r)}}}text(t){let e=this.rules.block.text.exec(t);if(e)return{type:"text",raw:e[0],text:e[0],tokens:this.lexer.inline(e[0])}}escape(t){let e=this.rules.inline.escape.exec(t);if(e)return{type:"escape",raw:e[0],text:e[1]}}tag(t){let e=this.rules.inline.tag.exec(t);if(e)return!this.lexer.state.inLink&&this.rules.other.startATag.test(e[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(e[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(e[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(e[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:e[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:e[0]}}link(t){let e=this.rules.inline.link.exec(t);if(e){let r=e[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(r)){if(!this.rules.other.endAngleBracket.test(r))return;let i=B(r.slice(0,-1),"\\");if((r.length-i.length)%2===0)return}else{let i=sr(e[2],"()");if(i===-2)return;if(i>-1){let o=(e[0].indexOf("!")===0?5:4)+e[1].length+i;e[2]=e[2].substring(0,i),e[0]=e[0].substring(0,o).trim(),e[3]=""}}let s=e[2],n="";if(this.options.pedantic){let i=this.rules.other.pedanticHrefTitle.exec(s);i&&(s=i[1],n=i[3])}else n=e[3]?e[3].slice(1,-1):"";return s=s.trim(),this.rules.other.startAngleBracket.test(s)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(r)?s=s.slice(1):s=s.slice(1,-1)),Ye(e,{href:s&&s.replace(this.rules.inline.anyPunctuation,"$1"),title:n&&n.replace(this.rules.inline.anyPunctuation,"$1")},e[0],this.lexer,this.rules)}}reflink(t,e){let r;if((r=this.rules.inline.reflink.exec(t))||(r=this.rules.inline.nolink.exec(t))){let s=(r[2]||r[1]).replace(this.rules.other.multipleSpaceGlobal," "),n=e[s.toLowerCase()];if(!n){let i=r[0].charAt(0);return{type:"text",raw:i,text:i}}return Ye(r,n,r[0],this.lexer,this.rules)}}emStrong(t,e,r=""){let s=this.rules.inline.emStrongLDelim.exec(t);if(!(!s||!s[1]&&!s[2]&&!s[3]&&!s[4]||s[4]&&r.match(this.rules.other.unicodeAlphaNumeric))&&(!(s[1]||s[3])||!r||this.rules.inline.punctuation.exec(r))){let n=[...s[0]].length-1,i,o,a=n,l=0,c=s[0][0],p=r===c,u=c==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(u.lastIndex=0,e=e.slice(-1*t.length+n);(s=u.exec(e))!==null;){if(i=s[1]||s[2]||s[3]||s[4]||s[5]||s[6],!i)continue;if(o=[...i].length,s[3]||s[4]){a+=o;continue}else if(s[5]||s[6]){if(n%3&&!((n+o)%3)){l+=o;continue}if(p)break}if(a-=o,a>0)continue;o=Math.min(o,o+a+l);let d=[...s[0]][0].length,w=t.slice(0,n+s.index+d+o);if(Math.min(n,o)%2){let y=w.slice(1,-1);return{type:"em",raw:w,text:y,tokens:this.lexer.inlineTokens(y)}}let g=w.slice(2,-2);return{type:"strong",raw:w,text:g,tokens:this.lexer.inlineTokens(g)}}}}codespan(t){let e=this.rules.inline.code.exec(t);if(e){let r=e[2].replace(this.rules.other.newLineCharGlobal," "),s=this.rules.other.nonSpaceChar.test(r),n=this.rules.other.startingSpaceChar.test(r)&&this.rules.other.endingSpaceChar.test(r);return s&&n&&(r=r.substring(1,r.length-1)),{type:"codespan",raw:e[0],text:r}}}br(t){let e=this.rules.inline.br.exec(t);if(e)return{type:"br",raw:e[0]}}del(t,e,r=""){let s=this.rules.inline.delLDelim.exec(t);if(s&&(!s[1]||!r||this.rules.inline.punctuation.exec(r))){let n=[...s[0]].length-1,i,o,a=n,l=this.rules.inline.delRDelim;for(l.lastIndex=0,e=e.slice(-1*t.length+n);(s=l.exec(e))!==null;){if(i=s[1]||s[2]||s[3]||s[4]||s[5]||s[6],!i||(o=[...i].length,o!==n))continue;if(s[3]||s[4]){a+=o;continue}if(a-=o,a>0)continue;o=Math.min(o,o+a);let c=[...s[0]][0].length,p=t.slice(0,n+s.index+c+o),u=p.slice(n,-n);return{type:"del",raw:p,text:u,tokens:this.lexer.inlineTokens(u)}}}}autolink(t){let e=this.rules.inline.autolink.exec(t);if(e){let r,s;return e[2]==="@"?(r=e[1],s="mailto:"+r):(r=e[1],s=r),{type:"link",raw:e[0],text:r,href:s,tokens:[{type:"text",raw:r,text:r}]}}}url(t){let e;if(e=this.rules.inline.url.exec(t)){let r,s;if(e[2]==="@")r=e[0],s="mailto:"+r;else{let n;do n=e[0],e[0]=this.rules.inline._backpedal.exec(e[0])?.[0]??"";while(n!==e[0]);r=e[0],e[1]==="www."?s="http://"+e[0]:s=e[0]}return{type:"link",raw:e[0],text:r,href:s,tokens:[{type:"text",raw:r,text:r}]}}}inlineText(t){let e=this.rules.inline.text.exec(t);if(e){let r=this.lexer.state.inRawBlock;return{type:"text",raw:e[0],text:e[0],escaped:r}}}},I=class Ee{constructor(e){b(this,"tokens");b(this,"options");b(this,"state");b(this,"inlineQueue");b(this,"tokenizer");this.tokens=[],this.tokens.links=Object.create(null),this.options=e||M,this.options.tokenizer=this.options.tokenizer||new ue,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let r={other:S,block:pe.normal,inline:te.normal};this.options.pedantic?(r.block=pe.pedantic,r.inline=te.pedantic):this.options.gfm&&(r.block=pe.gfm,this.options.breaks?r.inline=te.breaks:r.inline=te.gfm),this.tokenizer.rules=r}static get rules(){return{block:pe,inline:te}}static lex(e,r){return new Ee(r).lex(e)}static lexInline(e,r){return new Ee(r).inlineTokens(e)}lex(e){e=e.replace(S.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let r=0;r<this.inlineQueue.length;r++){let s=this.inlineQueue[r];this.inlineTokens(s.src,s.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,r=[],s=!1){this.tokenizer.lexer=this,this.options.pedantic&&(e=e.replace(S.tabCharGlobal,"    ").replace(S.spaceLine,""));let n=1/0;for(;e;){if(e.length<n)n=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}let i;if(this.options.extensions?.block?.some(a=>(i=a.call({lexer:this},e,r))?(e=e.substring(i.raw.length),r.push(i),!0):!1))continue;if(i=this.tokenizer.space(e)){e=e.substring(i.raw.length);let a=r.at(-1);i.raw.length===1&&a!==void 0?a.raw+=`
`:r.push(i);continue}if(i=this.tokenizer.code(e)){e=e.substring(i.raw.length);let a=r.at(-1);a?.type==="paragraph"||a?.type==="text"?(a.raw+=(a.raw.endsWith(`
`)?"":`
`)+i.raw,a.text+=`
`+i.text,this.inlineQueue.at(-1).src=a.text):r.push(i);continue}if(i=this.tokenizer.fences(e)){e=e.substring(i.raw.length),r.push(i);continue}if(i=this.tokenizer.heading(e)){e=e.substring(i.raw.length),r.push(i);continue}if(i=this.tokenizer.hr(e)){e=e.substring(i.raw.length),r.push(i);continue}if(i=this.tokenizer.blockquote(e)){e=e.substring(i.raw.length),r.push(i);continue}if(i=this.tokenizer.list(e)){e=e.substring(i.raw.length),r.push(i);continue}if(i=this.tokenizer.html(e)){e=e.substring(i.raw.length),r.push(i);continue}if(i=this.tokenizer.def(e)){e=e.substring(i.raw.length);let a=r.at(-1);a?.type==="paragraph"||a?.type==="text"?(a.raw+=(a.raw.endsWith(`
`)?"":`
`)+i.raw,a.text+=`
`+i.raw,this.inlineQueue.at(-1).src=a.text):this.tokens.links[i.tag]||(this.tokens.links[i.tag]={href:i.href,title:i.title},r.push(i));continue}if(i=this.tokenizer.table(e)){e=e.substring(i.raw.length),r.push(i);continue}if(i=this.tokenizer.lheading(e)){e=e.substring(i.raw.length),r.push(i);continue}let o=e;if(this.options.extensions?.startBlock){let a=1/0,l=e.slice(1),c;this.options.extensions.startBlock.forEach(p=>{c=p.call({lexer:this},l),typeof c=="number"&&c>=0&&(a=Math.min(a,c))}),a<1/0&&a>=0&&(o=e.substring(0,a+1))}if(this.state.top&&(i=this.tokenizer.paragraph(o))){let a=r.at(-1);s&&a?.type==="paragraph"?(a.raw+=(a.raw.endsWith(`
`)?"":`
`)+i.raw,a.text+=`
`+i.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=a.text):r.push(i),s=o.length!==e.length,e=e.substring(i.raw.length);continue}if(i=this.tokenizer.text(e)){e=e.substring(i.raw.length);let a=r.at(-1);a?.type==="text"?(a.raw+=(a.raw.endsWith(`
`)?"":`
`)+i.raw,a.text+=`
`+i.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=a.text):r.push(i);continue}if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return this.state.top=!0,r}inline(e,r=[]){return this.inlineQueue.push({src:e,tokens:r}),r}inlineTokens(e,r=[]){this.tokenizer.lexer=this;let s=e;if(this.tokens.links){let a=Object.keys(this.tokens.links);a.length>0&&(s=s.replace(this.tokenizer.rules.inline.reflinkSearch,l=>a.includes(l.slice(l.lastIndexOf("[")+1,-1))?"["+"a".repeat(l.length-2)+"]":l))}s=s.replace(this.tokenizer.rules.inline.anyPunctuation,"++"),s=s.replace(this.tokenizer.rules.inline.blockSkip,(a,l,c)=>{let p=c?c.length:0;return a.slice(0,p)+"["+"a".repeat(a.length-p-2)+"]"}),s=this.options.hooks?.emStrongMask?.call({lexer:this},s)??s;let n=!1,i="",o=1/0;for(;e;){if(e.length<o)o=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}n||(i=""),n=!1;let a;if(this.options.extensions?.inline?.some(c=>(a=c.call({lexer:this},e,r))?(e=e.substring(a.raw.length),r.push(a),!0):!1))continue;if(a=this.tokenizer.escape(e)){e=e.substring(a.raw.length),r.push(a);continue}if(a=this.tokenizer.tag(e)){e=e.substring(a.raw.length),r.push(a);continue}if(a=this.tokenizer.link(e)){e=e.substring(a.raw.length),r.push(a);continue}if(a=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(a.raw.length);let c=r.at(-1);a.type==="text"&&c?.type==="text"?(c.raw+=a.raw,c.text+=a.text):r.push(a);continue}if(a=this.tokenizer.emStrong(e,s,i)){e=e.substring(a.raw.length),r.push(a);continue}if(a=this.tokenizer.codespan(e)){e=e.substring(a.raw.length),r.push(a);continue}if(a=this.tokenizer.br(e)){e=e.substring(a.raw.length),r.push(a);continue}if(a=this.tokenizer.del(e,s,i)){e=e.substring(a.raw.length),r.push(a);continue}if(a=this.tokenizer.autolink(e)){e=e.substring(a.raw.length),r.push(a);continue}if(!this.state.inLink&&(a=this.tokenizer.url(e))){e=e.substring(a.raw.length),r.push(a);continue}let l=e;if(this.options.extensions?.startInline){let c=1/0,p=e.slice(1),u;this.options.extensions.startInline.forEach(d=>{u=d.call({lexer:this},p),typeof u=="number"&&u>=0&&(c=Math.min(c,u))}),c<1/0&&c>=0&&(l=e.substring(0,c+1))}if(a=this.tokenizer.inlineText(l)){e=e.substring(a.raw.length),a.raw.slice(-1)!=="_"&&(i=a.raw.slice(-1)),n=!0;let c=r.at(-1);c?.type==="text"?(c.raw+=a.raw,c.text+=a.text):r.push(a);continue}if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return r}infiniteLoopError(e){let r="Infinite loop on byte: "+e;if(this.options.silent)console.error(r);else throw new Error(r)}},re=class{constructor(t){b(this,"options");b(this,"parser");this.options=t||M}space(t){return""}code({text:t,lang:e,escaped:r}){let s=(e||"").match(S.notSpaceStart)?.[0],n=t.replace(S.endingNewline,"")+`
`;return s?'<pre><code class="language-'+P(s)+'">'+(r?n:P(n,!0))+`</code></pre>
`:"<pre><code>"+(r?n:P(n,!0))+`</code></pre>
`}blockquote({tokens:t}){return`<blockquote>
${this.parser.parse(t)}</blockquote>
`}html({text:t}){return t}def(t){return""}heading({tokens:t,depth:e}){return`<h${e}>${this.parser.parseInline(t)}</h${e}>
`}hr(t){return`<hr>
`}list(t){let e=t.ordered,r=t.start,s="";for(let o=0;o<t.items.length;o++){let a=t.items[o];s+=this.listitem(a)}let n=e?"ol":"ul",i=e&&r!==1?' start="'+r+'"':"";return"<"+n+i+`>
`+s+"</"+n+`>
`}listitem(t){return`<li>${this.parser.parse(t.tokens)}</li>
`}checkbox({checked:t}){return"<input "+(t?'checked="" ':"")+'disabled="" type="checkbox"> '}paragraph({tokens:t}){return`<p>${this.parser.parseInline(t)}</p>
`}table(t){let e="",r="";for(let n=0;n<t.header.length;n++)r+=this.tablecell(t.header[n]);e+=this.tablerow({text:r});let s="";for(let n=0;n<t.rows.length;n++){let i=t.rows[n];r="";for(let o=0;o<i.length;o++)r+=this.tablecell(i[o]);s+=this.tablerow({text:r})}return s&&(s=`<tbody>${s}</tbody>`),`<table>
<thead>
`+e+`</thead>
`+s+`</table>
`}tablerow({text:t}){return`<tr>
${t}</tr>
`}tablecell(t){let e=this.parser.parseInline(t.tokens),r=t.header?"th":"td";return(t.align?`<${r} align="${t.align}">`:`<${r}>`)+e+`</${r}>
`}strong({tokens:t}){return`<strong>${this.parser.parseInline(t)}</strong>`}em({tokens:t}){return`<em>${this.parser.parseInline(t)}</em>`}codespan({text:t}){return`<code>${P(t,!0)}</code>`}br(t){return"<br>"}del({tokens:t}){return`<del>${this.parser.parseInline(t)}</del>`}link({href:t,title:e,tokens:r}){let s=this.parser.parseInline(r),n=Xe(t);if(n===null)return s;t=n;let i='<a href="'+t+'"';return e&&(i+=' title="'+P(e)+'"'),i+=">"+s+"</a>",i}image({href:t,title:e,text:r,tokens:s}){s&&(r=this.parser.parseInline(s,this.parser.textRenderer));let n=Xe(t);if(n===null)return P(r);t=n;let i=`<img src="${t}" alt="${P(r)}"`;return e&&(i+=` title="${P(e)}"`),i+=">",i}text(t){return"tokens"in t&&t.tokens?this.parser.parseInline(t.tokens):"escaped"in t&&t.escaped?t.text:P(t.text)}},Re=class{strong({text:t}){return t}em({text:t}){return t}codespan({text:t}){return t}del({text:t}){return t}html({text:t}){return t}text({text:t}){return t}link({text:t}){return""+t}image({text:t}){return""+t}br(){return""}checkbox({raw:t}){return t}},C=class Ie{constructor(e){b(this,"options");b(this,"renderer");b(this,"textRenderer");this.options=e||M,this.options.renderer=this.options.renderer||new re,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new Re}static parse(e,r){return new Ie(r).parse(e)}static parseInline(e,r){return new Ie(r).parseInline(e)}parse(e){this.renderer.parser=this;let r="";for(let s=0;s<e.length;s++){let n=e[s];if(this.options.extensions?.renderers?.[n.type]){let o=n,a=this.options.extensions.renderers[o.type].call({parser:this},o);if(a!==!1||!["space","hr","heading","code","table","blockquote","list","checkbox","html","def","paragraph","text"].includes(o.type)){r+=a||"";continue}}let i=n;switch(i.type){case"space":{r+=this.renderer.space(i);break}case"hr":{r+=this.renderer.hr(i);break}case"heading":{r+=this.renderer.heading(i);break}case"code":{r+=this.renderer.code(i);break}case"table":{r+=this.renderer.table(i);break}case"blockquote":{r+=this.renderer.blockquote(i);break}case"list":{r+=this.renderer.list(i);break}case"checkbox":{r+=this.renderer.checkbox(i);break}case"html":{r+=this.renderer.html(i);break}case"def":{r+=this.renderer.def(i);break}case"paragraph":{r+=this.renderer.paragraph(i);break}case"text":{r+=this.renderer.text(i);break}default:{let o='Token with "'+i.type+'" type was not found.';if(this.options.silent)return console.error(o),"";throw new Error(o)}}}return r}parseInline(e,r=this.renderer){this.renderer.parser=this;let s="";for(let n=0;n<e.length;n++){let i=e[n];if(this.options.extensions?.renderers?.[i.type]){let a=this.options.extensions.renderers[i.type].call({parser:this},i);if(a!==!1||!["escape","html","link","image","checkbox","strong","em","codespan","br","del","text"].includes(i.type)){s+=a||"";continue}}let o=i;switch(o.type){case"escape":{s+=r.text(o);break}case"html":{s+=r.html(o);break}case"link":{s+=r.link(o);break}case"image":{s+=r.image(o);break}case"checkbox":{s+=r.checkbox(o);break}case"strong":{s+=r.strong(o);break}case"em":{s+=r.em(o);break}case"codespan":{s+=r.codespan(o);break}case"br":{s+=r.br(o);break}case"del":{s+=r.del(o);break}case"text":{s+=r.text(o);break}default:{let a='Token with "'+o.type+'" type was not found.';if(this.options.silent)return console.error(a),"";throw new Error(a)}}}return s}},ne=(de=class{constructor(t){b(this,"options");b(this,"block");this.options=t||M}preprocess(t){return t}postprocess(t){return t}processAllTokens(t){return t}emStrongMask(t){return t}provideLexer(t=this.block){return t?I.lex:I.lexInline}provideParser(t=this.block){return t?C.parse:C.parseInline}},b(de,"passThroughHooks",new Set(["preprocess","postprocess","processAllTokens","emStrongMask"])),b(de,"passThroughHooksRespectAsync",new Set(["preprocess","postprocess","processAllTokens"])),de),or=class{constructor(...t){b(this,"defaults",be());b(this,"options",this.setOptions);b(this,"parse",this.parseMarkdown(!0));b(this,"parseInline",this.parseMarkdown(!1));b(this,"Parser",C);b(this,"Renderer",re);b(this,"TextRenderer",Re);b(this,"Lexer",I);b(this,"Tokenizer",ue);b(this,"Hooks",ne);this.use(...t)}walkTokens(t,e){let r=[];for(let s of t)switch(r=r.concat(e.call(this,s)),s.type){case"table":{let n=s;for(let i of n.header)r=r.concat(this.walkTokens(i.tokens,e));for(let i of n.rows)for(let o of i)r=r.concat(this.walkTokens(o.tokens,e));break}case"list":{let n=s;r=r.concat(this.walkTokens(n.items,e));break}default:{let n=s;this.defaults.extensions?.childTokens?.[n.type]?this.defaults.extensions.childTokens[n.type].forEach(i=>{let o=n[i].flat(1/0);r=r.concat(this.walkTokens(o,e))}):n.tokens&&(r=r.concat(this.walkTokens(n.tokens,e)))}}return r}use(...t){let e=this.defaults.extensions||{renderers:{},childTokens:{}};return t.forEach(r=>{let s={...r};if(s.async=this.defaults.async||s.async||!1,r.extensions&&(r.extensions.forEach(n=>{if(!n.name)throw new Error("extension name required");if("renderer"in n){let i=e.renderers[n.name];i?e.renderers[n.name]=function(...o){let a=n.renderer.apply(this,o);return a===!1&&(a=i.apply(this,o)),a}:e.renderers[n.name]=n.renderer}if("tokenizer"in n){if(!n.level||n.level!=="block"&&n.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let i=e[n.level];i?i.unshift(n.tokenizer):e[n.level]=[n.tokenizer],n.start&&(n.level==="block"?e.startBlock?e.startBlock.push(n.start):e.startBlock=[n.start]:n.level==="inline"&&(e.startInline?e.startInline.push(n.start):e.startInline=[n.start]))}"childTokens"in n&&n.childTokens&&(e.childTokens[n.name]=n.childTokens)}),s.extensions=e),r.renderer){let n=this.defaults.renderer||new re(this.defaults);for(let i in r.renderer){if(!(i in n))throw new Error(`renderer '${i}' does not exist`);if(["options","parser"].includes(i))continue;let o=i,a=r.renderer[o],l=n[o];n[o]=(...c)=>{let p=a.apply(n,c);return p===!1&&(p=l.apply(n,c)),p||""}}s.renderer=n}if(r.tokenizer){let n=this.defaults.tokenizer||new ue(this.defaults);for(let i in r.tokenizer){if(!(i in n))throw new Error(`tokenizer '${i}' does not exist`);if(["options","rules","lexer"].includes(i))continue;let o=i,a=r.tokenizer[o],l=n[o];n[o]=(...c)=>{let p=a.apply(n,c);return p===!1&&(p=l.apply(n,c)),p}}s.tokenizer=n}if(r.hooks){let n=this.defaults.hooks||new ne;for(let i in r.hooks){if(!(i in n))throw new Error(`hook '${i}' does not exist`);if(["options","block"].includes(i))continue;let o=i,a=r.hooks[o],l=n[o];ne.passThroughHooks.has(i)?n[o]=c=>{if(this.defaults.async&&ne.passThroughHooksRespectAsync.has(i))return(async()=>{let u=await a.call(n,c);return l.call(n,u)})();let p=a.call(n,c);return l.call(n,p)}:n[o]=(...c)=>{if(this.defaults.async)return(async()=>{let u=await a.apply(n,c);return u===!1&&(u=await l.apply(n,c)),u})();let p=a.apply(n,c);return p===!1&&(p=l.apply(n,c)),p}}s.hooks=n}if(r.walkTokens){let n=this.defaults.walkTokens,i=r.walkTokens;s.walkTokens=function(o){let a=[];return a.push(i.call(this,o)),n&&(a=a.concat(n.call(this,o))),a}}this.defaults={...this.defaults,...s}}),this}setOptions(t){return this.defaults={...this.defaults,...t},this}lexer(t,e){return I.lex(t,e??this.defaults)}parser(t,e){return C.parse(t,e??this.defaults)}parseMarkdown(t){return(e,r)=>{let s={...r},n={...this.defaults,...s},i=this.onError(!!n.silent,!!n.async);if(this.defaults.async===!0&&s.async===!1)return i(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof e>"u"||e===null)return i(new Error("marked(): input parameter is undefined or null"));if(typeof e!="string")return i(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(e)+", string expected"));if(n.hooks&&(n.hooks.options=n,n.hooks.block=t),n.async)return(async()=>{let o=n.hooks?await n.hooks.preprocess(e):e,a=await(n.hooks?await n.hooks.provideLexer(t):t?I.lex:I.lexInline)(o,n),l=n.hooks?await n.hooks.processAllTokens(a):a;n.walkTokens&&await Promise.all(this.walkTokens(l,n.walkTokens));let c=await(n.hooks?await n.hooks.provideParser(t):t?C.parse:C.parseInline)(l,n);return n.hooks?await n.hooks.postprocess(c):c})().catch(i);try{n.hooks&&(e=n.hooks.preprocess(e));let o=(n.hooks?n.hooks.provideLexer(t):t?I.lex:I.lexInline)(e,n);n.hooks&&(o=n.hooks.processAllTokens(o)),n.walkTokens&&this.walkTokens(o,n.walkTokens);let a=(n.hooks?n.hooks.provideParser(t):t?C.parse:C.parseInline)(o,n);return n.hooks&&(a=n.hooks.postprocess(a)),a}catch(o){return i(o)}}}onError(t,e){return r=>{if(r.message+=`
Please report this to https://github.com/markedjs/marked.`,t){let s="<p>An error occurred:</p><pre>"+P(r.message+"",!0)+"</pre>";return e?Promise.resolve(s):s}if(e)return Promise.reject(r);throw r}}},H=new or;function x(t,e){return H.parse(t,e)}x.options=x.setOptions=function(t){return H.setOptions(t),x.defaults=H.defaults,De(x.defaults),x},x.getDefaults=be,x.defaults=M;function lr(...t){return H.use(...t),x.defaults=H.defaults,De(x.defaults),x}x.use=lr,x.walkTokens=function(t,e){return H.walkTokens(t,e)},x.parseInline=H.parseInline,x.Parser=C,x.parser=C.parse,x.Renderer=re,x.TextRenderer=Re,x.Lexer=I,x.lexer=I.lex,x.Tokenizer=ue,x.Hooks=ne,x.parse=x,x.options,x.setOptions,x.walkTokens,x.parseInline,C.parse,I.lex;const et=new re;et.html=()=>"",x.setOptions({gfm:!0,breaks:!0,renderer:et});function cr(t){return t.replace(/<br\s*\/?>/gi,`
`).replace(/<\/?b>/gi,"**").replace(/<\/?strong>/gi,"**").replace(/<\/?i>/gi,"_").replace(/<\/?em>/gi,"_")}function pr(t){const e=cr(t);return x.parse(e,{async:!1})}const ur=`
:host {
  all: initial;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
}

*, *::before, *::after { box-sizing: border-box; }

.sai-root {
  --sai-primary: #111111;
  --sai-bg: #ffffff;
  --sai-surface: #f5f5f5;
  --sai-border: #e5e5e5;
  --sai-text: #111111;
  --sai-muted: #737373;
  --sai-user: #111111;
  --sai-assistant: #ffffff;
  --sai-input: #ffffff;
  --sai-on-primary: #ffffff;
  --sai-danger: #b91c1c;
  --sai-shadow: 0 18px 50px rgba(0, 0, 0, 0.16);
  position: fixed;
  z-index: 2147483000;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.sai-root[data-theme="dark"] {
  --sai-bg: #141414;
  --sai-surface: #1c1c1c;
  --sai-border: #2e2e2e;
  --sai-text: #f4f4f5;
  --sai-muted: #a1a1aa;
  --sai-assistant: #242424;
  --sai-input: #111111;
  --sai-danger: #f87171;
  --sai-shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
}

.sai-root[data-position="bottom-left"] {
  left: 20px;
  align-items: flex-start;
}

.sai-root[data-position="bottom-right"] {
  right: 20px;
}

.sai-panel {
  position: relative;
  width: min(380px, calc(100vw - 32px));
  height: min(560px, calc(100vh - 100px));
  background: var(--sai-bg);
  color: var(--sai-text);
  border: 1px solid var(--sai-border);
  border-radius: 16px;
  box-shadow: var(--sai-shadow);
  display: none;
  flex-direction: column;
  overflow: hidden;
}

.sai-panel[data-open="true"] {
  display: flex;
}

.sai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: var(--sai-primary);
  color: #ffffff;
}

.sai-header-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
  margin: 0;
  color: #ffffff;
}

.sai-header-sub {
  font-size: 12px;
  margin: 2px 0 0;
  color: rgba(255, 255, 255, 0.85);
}

.sai-header-sub[hidden] { display: none; }

.sai-header-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.sai-icon-btn, .sai-text-btn {
  appearance: none;
  border: 0;
  background: rgba(255,255,255,0.15);
  color: #ffffff;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
}

.sai-icon-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
}

.sai-text-btn {
  padding: 6px 10px;
  font-size: 12px;
}

.sai-icon-btn:hover, .sai-text-btn:hover { background: rgba(255,255,255,0.22); }

.sai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: var(--sai-surface);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sai-bubble {
  max-width: 85%;
  padding: 10px 12px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.45;
  word-break: break-word;
}

.sai-bubble[data-role="user"] {
  align-self: flex-end;
  background: var(--sai-user);
  color: var(--sai-on-primary);
  border-bottom-right-radius: 4px;
  white-space: pre-wrap;
}

.sai-bubble[data-role="assistant"] {
  align-self: flex-start;
  background: var(--sai-assistant);
  border: 1px solid var(--sai-border);
  border-bottom-left-radius: 4px;
  color: var(--sai-text);
}

.sai-bubble[data-role="system"] {
  align-self: center;
  background: transparent;
  color: var(--sai-muted);
  font-size: 13px;
  text-align: center;
  max-width: 100%;
  white-space: pre-wrap;
}

.sai-md > *:first-child { margin-top: 0; }
.sai-md > *:last-child { margin-bottom: 0; }
.sai-md p { margin: 0.5em 0; line-height: 1.5; }
.sai-md ul, .sai-md ol { margin: 0.5em 0; padding-left: 1.25em; }
.sai-md ul { list-style: disc; }
.sai-md ol { list-style: decimal; }
.sai-md li { margin: 0.2em 0; }
.sai-md strong { font-weight: 600; }
.sai-md em { font-style: italic; }
.sai-md a { color: var(--sai-text); font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }
.sai-md blockquote {
  margin: 0.5em 0;
  padding-left: 0.75em;
  border-left: 2px solid var(--sai-border);
  color: var(--sai-muted);
}
.sai-md hr { margin: 0.75em 0; border: 0; border-top: 1px solid var(--sai-border); }
.sai-md h1, .sai-md h2, .sai-md h3, .sai-md h4 {
  margin: 0.65em 0 0.35em;
  font-weight: 600;
  line-height: 1.3;
}
.sai-md h1 { font-size: 1.05em; }
.sai-md h2, .sai-md h3, .sai-md h4 { font-size: 1em; }
.sai-md code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.85em;
  background: var(--sai-surface);
  padding: 0.1em 0.35em;
  border-radius: 4px;
}
.sai-md pre {
  margin: 0.5em 0;
  padding: 0.75em;
  overflow-x: auto;
  border-radius: 8px;
  background: var(--sai-surface);
  font-size: 0.8em;
}
.sai-md pre code { background: transparent; padding: 0; }
.sai-md table {
  display: block;
  width: 100%;
  margin: 0.5em 0;
  overflow-x: auto;
  border-collapse: collapse;
  font-size: 0.85em;
}
.sai-md th, .sai-md td {
  border: 1px solid var(--sai-border);
  padding: 0.35em 0.5em;
  text-align: left;
}
.sai-md th { background: var(--sai-surface); font-weight: 600; }

.sai-status {
  font-size: 12px;
  color: var(--sai-muted);
  padding: 0 16px 8px;
  min-height: 18px;
}

.sai-composer {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--sai-border);
  background: var(--sai-bg);
}

.sai-input {
  flex: 1;
  resize: none;
  border: 1px solid var(--sai-border);
  border-radius: 10px;
  padding: 10px 12px;
  font: inherit;
  font-size: 14px;
  color: var(--sai-text);
  background: var(--sai-input);
  min-height: 44px;
  max-height: 120px;
}

.sai-input:focus {
  outline: 2px solid rgba(17, 17, 17, 0.2);
  border-color: var(--sai-primary);
}

.sai-send {
  appearance: none;
  border: 0;
  border-radius: 10px;
  background: var(--sai-primary);
  color: var(--sai-on-primary);
  padding: 0 14px;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.sai-send:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.sai-launcher {
  appearance: none;
  border: 0;
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: var(--sai-primary);
  color: var(--sai-on-primary);
  box-shadow: var(--sai-shadow);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sai-launcher svg { width: 26px; height: 26px; fill: currentColor; }

.sai-error {
  color: var(--sai-danger);
  font-size: 12px;
  padding: 0 16px 8px;
}

.sai-history {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: var(--sai-bg);
  display: none;
  flex-direction: column;
}

.sai-history[data-open="true"] {
  display: flex;
}

.sai-history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--sai-border);
  font-weight: 600;
  font-size: 15px;
}

.sai-history-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.sai-history-item {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
}

.sai-history-main {
  flex: 1;
  text-align: left;
  appearance: none;
  border: 1px solid var(--sai-border);
  background: transparent;
  color: var(--sai-text);
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
  font: inherit;
}

.sai-history-main[data-active="true"] {
  border-color: var(--sai-primary);
  background: var(--sai-surface);
}

.sai-history-title {
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sai-history-meta {
  font-size: 11px;
  color: var(--sai-muted);
  margin-top: 4px;
}

.sai-history-new {
  margin: 12px;
  appearance: none;
  border: 0;
  border-radius: 10px;
  background: var(--sai-primary);
  color: #fff;
  padding: 10px 12px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.sai-ghost-btn {
  appearance: none;
  border: 1px solid var(--sai-border);
  background: var(--sai-surface);
  color: var(--sai-text);
  border-radius: 8px;
  padding: 6px 10px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
`;function se(){return crypto.randomUUID()}function hr(t){return t.storageKey??t.agentId}function he(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function dr(t){try{return new Date(t).toLocaleString(void 0,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}catch{return""}}function gr(t){return t.filter(e=>e.role==="user"||e.role==="assistant").map(e=>({id:e.id,role:e.role,content:e.content}))}function Ae(t){if(typeof document>"u")throw new Error("SupportAI widget requires a browser environment.");const e=ot({agentId:t.agentId,apiKey:t.apiKey,apiUrl:t.apiUrl,headers:t.headers}),r=t.position??"bottom-right",s=t.theme??"light",n=t.primaryColor??"#111111",i=t.greeting??"Hi! Ask me anything about this product.",o=hr(t),a=document.createElement("div");a.setAttribute("data-support-ai-widget",""),(t.container??document.body).appendChild(a);const l=a.attachShadow({mode:"open"}),c=document.createElement("style");c.textContent=ur,l.appendChild(c);const p=document.createElement("div");p.className="sai-root",p.dataset.position=r,p.dataset.theme=s,p.style.setProperty("--sai-primary",n),p.style.setProperty("--sai-user",n),l.appendChild(p),p.innerHTML=`
    <div class="sai-panel" data-open="false" part="panel">
      <div class="sai-header">
        <div>
          <p class="sai-header-title">${he(t.title??"Support")}</p>
          <p class="sai-header-sub" data-role="header-sub" hidden></p>
        </div>
        <div class="sai-header-actions">
          <button type="button" class="sai-text-btn" data-action="history">Chats</button>
          <button type="button" class="sai-text-btn" data-action="new">New</button>
          <button type="button" class="sai-icon-btn" data-action="close" aria-label="Close chat">×</button>
        </div>
      </div>
      <div class="sai-messages" data-role="messages"></div>
      <div class="sai-status" data-role="status"></div>
      <div class="sai-error" data-role="error" hidden></div>
      <form class="sai-composer" data-role="form">
        <textarea class="sai-input" data-role="input" rows="1" placeholder="Type your message…"></textarea>
        <button class="sai-send" type="submit" data-role="send">Send</button>
      </form>
      <div class="sai-history" data-role="history" data-open="false">
        <div class="sai-history-header">
          <span>Conversations</span>
          <button type="button" class="sai-ghost-btn" data-action="history-back">Back</button>
        </div>
        <button type="button" class="sai-history-new" data-action="history-new">+ New conversation</button>
        <div class="sai-history-list" data-role="history-list"></div>
      </div>
    </div>
    <button type="button" class="sai-launcher" data-action="toggle" aria-label="Open chat">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>
    </button>
  `;const u=p.querySelector(".sai-panel"),d=p.querySelector(".sai-header-title"),w=p.querySelector("[data-role=header-sub]"),g=p.querySelector("[data-role=messages]"),y=p.querySelector("[data-role=status]"),z=p.querySelector("[data-role=error]"),N=p.querySelector("[data-role=form]"),Z=p.querySelector("[data-role=input]"),X=p.querySelector("[data-role=send]"),ze=p.querySelector("[data-role=history]"),D=p.querySelector("[data-role=history-list]"),O=p.querySelector('[data-action="toggle"]'),kr=p.querySelector('[data-action="close"]'),br=p.querySelector('[data-action="history"]'),xr=p.querySelector('[data-action="new"]'),mr=p.querySelector('[data-action="history-back"]'),wr=p.querySelector('[data-action="history-new"]');let ge=!1,ae=!1,R=null,J="New chat",q=null;const v=[];function oe(h){ge=h,u.dataset.open=h?"true":"false",h&&Z.focus()}function fe(h){ze.dataset.open=h?"true":"false",h&&nt()}function ke(h){if(!h){z.hidden=!0,z.textContent="";return}z.hidden=!1,z.textContent=h}function yr(h){return h.role==="assistant"?`<div class="sai-bubble" data-role="assistant">${h.content?`<div class="sai-md">${pr(h.content)}</div>`:"…"}</div>`:`<div class="sai-bubble" data-role="${h.role}">${he(h.content)}</div>`}function Q(){g.innerHTML=v.map(yr).join(""),g.querySelectorAll(".sai-md a[href]").forEach(h=>{h.setAttribute("target","_blank"),h.setAttribute("rel","noreferrer noopener")}),g.scrollTop=g.scrollHeight}function rt(){if(!R)return;const h=F(o),k=pt(h,{id:R,title:J,updatedAt:Date.now(),messages:gr(v)});V(o,k)}function vr(){const h=F(o),k=ut(h);if(v.length=0,k){R=k.id,J=k.title;for(const m of k.messages)v.push({id:m.id,role:m.role,content:m.content})}else R=null,J="New chat",v.push({id:se(),role:"system",content:i});Q()}function _e(){q?.abort(),q=null,ae=!1,X.disabled=!1,y.textContent="",ke(null),R=null,J="New chat",v.length=0,v.push({id:se(),role:"system",content:i}),Q();const h=F(o);V(o,{...h,activeId:null}),fe(!1)}function Sr(h){const k=F(o),m=k.conversations.find(A=>A.id===h);if(m){q?.abort(),q=null,ae=!1,X.disabled=!1,y.textContent="",ke(null),V(o,{...k,activeId:h}),R=m.id,J=m.title,v.length=0;for(const A of m.messages)v.push({id:A.id,role:A.role,content:A.content});v.length===0&&v.push({id:se(),role:"system",content:i}),Q(),fe(!1)}}function $r(h){const k=F(o),m=k.conversations.filter($=>$.id!==h),A=k.activeId===h?null:k.activeId;V(o,{version:1,activeId:A,conversations:m}),R===h?_e():nt()}function nt(){const h=F(o);if(!h.conversations.length){D.innerHTML='<div class="sai-bubble" data-role="system">No conversations yet.</div>';return}D.innerHTML=h.conversations.map(k=>`<div class="sai-history-item">
          <button type="button" class="sai-history-main" data-active="${k.id===R?"true":"false"}" data-select="${k.id}">
            <div class="sai-history-title">${he(k.title)}</div>
            <div class="sai-history-meta">${he(dr(k.updatedAt))} · ${k.messages.length} messages</div>
          </button>
          <button type="button" class="sai-ghost-btn" data-delete="${k.id}" aria-label="Delete">×</button>
        </div>`).join(""),D.querySelectorAll("[data-select]").forEach(k=>{k.addEventListener("click",()=>{const m=k.getAttribute("data-select");m&&Sr(m)})}),D.querySelectorAll("[data-delete]").forEach(k=>{k.addEventListener("click",()=>{const m=k.getAttribute("data-delete");m&&$r(m)})})}async function Rr(){try{const h=await e.getAgent(),k=h.name?.trim()||"Support";if(t.title?.trim())d.textContent=t.title.trim(),w.textContent=k,w.hidden=!1;else{d.textContent=k;const m=h.description?.trim();m?(w.textContent=m,w.hidden=!1):w.hidden=!0}}catch{}vr()}async function Ar(h){const k=h.trim();if(!k||ae)return;ke(null),ae=!0,X.disabled=!0,y.textContent="Thinking…",v.length===1&&v[0]?.role==="system"&&(v.length=0),v.push({id:se(),role:"user",content:k});const m=se();v.push({id:m,role:"assistant",content:""}),Q(),R||(J=ct(k)),q?.abort(),q=new AbortController;let A=R;try{await e.chat({message:k,conversationId:R,signal:q.signal,onEvent:$=>{if($.type==="status"){const T=$.data.stage;y.textContent=T==="retrieving"?"Searching knowledge…":T==="generating"||T==="first_token"?"Writing reply…":T==="started"?"Starting…":T;return}if($.type==="meta"){A=$.data.conversationId,R=A;return}if($.type==="token"){const T=v.find(U=>U.id===m);T&&(T.content+=$.data.content,Q());return}if($.type==="done"){const T=v.find(U=>U.id===m);T&&(T.content=$.data.message.content||T.content,Q())}}}),A&&(R=A,rt())}catch($){if($?.name==="AbortError")return;const T=$ instanceof _||$ instanceof Error?$.message:"Something went wrong";ke(T);const U=v.find(Tr=>Tr.id===m);U&&!U.content&&(U.content="(failed to get a reply)",Q()),A&&(R=A,rt())}finally{ae=!1,X.disabled=!1,y.textContent="",q=null}}return N.addEventListener("submit",h=>{h.preventDefault();const k=Z.value;Z.value="",Ar(k)}),Z.addEventListener("keydown",h=>{h.key==="Enter"&&!h.shiftKey&&(h.preventDefault(),N.requestSubmit())}),O.addEventListener("click",()=>oe(!ge)),kr.addEventListener("click",()=>oe(!1)),br.addEventListener("click",()=>fe(!0)),xr.addEventListener("click",()=>_e()),mr.addEventListener("click",()=>fe(!1)),wr.addEventListener("click",()=>_e()),Rr(),{open:()=>oe(!0),close:()=>oe(!1),toggle:()=>oe(!ge),isOpen:()=>ge,destroy:()=>{q?.abort(),a.remove()}}}let ie=null;function fr(){const t=document.currentScript instanceof HTMLScriptElement?document.currentScript:document.querySelector("script[data-agent-id][data-api-key]");if(!t)return{};const e=t.dataset;return{agentId:e.agentId,apiKey:e.apiKey,apiUrl:e.apiUrl,primaryColor:e.primaryColor,title:e.title,greeting:e.greeting,theme:e.theme==="dark"||e.theme==="light"?e.theme:void 0,position:e.position==="bottom-left"||e.position==="bottom-right"?e.position:void 0}}function Te(t){return ie?.destroy(),ie=Ae(t),ie}function tt(){ie?.destroy(),ie=null}return typeof window<"u"&&(window.SupportAI={init:Te,destroy:tt,mountWidget:Ae},queueMicrotask(()=>{const t=fr();t.agentId&&t.apiKey&&t.apiUrl&&Te(t)})),E.destroy=tt,E.init=Te,E.mountWidget=Ae,Object.defineProperty(E,Symbol.toStringTag,{value:"Module"}),E})({});
//# sourceMappingURL=widget.js.map
