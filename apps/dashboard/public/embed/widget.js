var SupportAI=(function(T){"use strict";var er=Object.defineProperty;var tr=(T,v,H)=>v in T?er(T,v,{enumerable:!0,configurable:!0,writable:!0,value:H}):T[v]=H;var f=(T,v,H)=>tr(T,typeof v!="symbol"?v+"":v,H);var ne;class v extends Error{constructor(r,s){super(r);f(this,"status");f(this,"code");f(this,"details");this.name="SupportAIError",this.status=s?.status,this.code=s?.code,this.details=s?.details}}function H(t,e){if(!t||typeof t!="object")return e;const r=t,s=r.error&&typeof r.error=="object"?r.error:null;for(const n of[s?.message,r.message]){if(typeof n=="string"&&n.trim())return n;if(Array.isArray(n)&&n.length)return n.filter(i=>typeof i=="string").join(", ")||e}return e}function Ge(t){if(!t||typeof t!="object")return;const e=t,r=e.error&&typeof e.error=="object"?e.error:null;return typeof r?.code=="string"?r.code:typeof e.code=="string"?e.code:void 0}function Se(t){const e=t.split(`

`),r=e.pop()??"",s=[];for(const n of e){const i=n.split(`
`).filter(l=>l.startsWith("data:")).map(l=>l.slice(5).trimStart());if(i.length)try{const l=JSON.parse(i.join(`
`));s.push(l)}catch{}}return{events:s,rest:r}}function Ke(t){return t.replace(/\/+$/,"")}function We(t){return t&&typeof t=="object"&&"success"in t&&t.success===!0&&"data"in t?t.data:t}function Fe(t){const e=Ke(t.apiUrl),r=t.fetch??fetch;function s(a,o){return{Accept:a,"Content-Type":"application/json",Authorization:`Bearer ${t.apiKey}`,...t.headers,...o}}async function n(a){let o=`Request failed (${a.status})`,c,u;try{const p=await a.json();u=p,o=H(p,o),c=Ge(p)}catch{}throw new v(o,{status:a.status,code:c,details:u})}async function i(a){const o=await r(`${e}/public/agents/${t.agentId}`,{method:"GET",headers:s("application/json"),signal:a});o.ok||await n(o);const c=await o.json();return We(c)}async function l(a){const o=JSON.stringify({message:a.message,...a.conversationId?{conversationId:a.conversationId}:{}}),c=await r(`${e}/public/agents/${t.agentId}/chat`,{method:"POST",headers:s("text/event-stream"),body:o,signal:a.signal});if(c.ok||await n(c),!c.body)throw new v("Chat stream is empty.");const u=c.body.getReader(),p=new TextDecoder;let h="";const x=d=>{if(a.onEvent?.(d),d.type==="error")throw new v(d.data.message||"Chat stream error")};for(;;){const{done:d,value:m}=await u.read();if(d)break;h+=p.decode(m,{stream:!0});const $=Se(h);h=$.rest;for(const M of $.events)x(M)}if(h.trim()){const d=Se(`${h}

`);for(const m of d.events)x(m)}}return{config:{...t,apiUrl:e},getAgent:i,chat:l}}function ae(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var q=ae();function $e(t){q=t}var B={exec:()=>null};function Z(t){let e=[];return r=>{let s=Math.max(0,Math.min(3,r-1)),n=e[s];return n||(n=t(s),e[s]=n),n}}function g(t,e=""){let r=typeof t=="string"?t:t.source,s={replace:(n,i)=>{let l=typeof i=="string"?i:i.source;return l=l.replace(w.caret,"$1"),r=r.replace(n,l),s},getRegex:()=>new RegExp(r,e)};return s}var Xe=((t="")=>{try{return!!new RegExp("(?<=1)(?<!1)"+t)}catch{return!1}})(),w={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] +\S/,listReplaceTask:/^\[[ xX]\] +/,listTaskCheckbox:/\[[ xX]\]/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:t=>new RegExp(`^( {0,3}${t})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:Z(t=>new RegExp(`^ {0,${t}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)),hrRegex:Z(t=>new RegExp(`^ {0,${t}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`)),fencesBeginRegex:Z(t=>new RegExp(`^ {0,${t}}(?:\`\`\`|~~~)`)),headingBeginRegex:Z(t=>new RegExp(`^ {0,${t}}#`)),htmlBeginRegex:Z(t=>new RegExp(`^ {0,${t}}<(?:[a-z].*>|!--)`,"i")),blockquoteBeginRegex:Z(t=>new RegExp(`^ {0,${t}}>`))},Je=/^(?:[ \t]*(?:\n|$))+/,Ve=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,Ye=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,N=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,et=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,le=/ {0,3}(?:[*+-]|\d{1,9}[.)])/,ve=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,Re=g(ve).replace(/bull/g,le).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}(?:\s|$)/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),tt=g(ve).replace(/bull/g,le).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}(?:\s|$)/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),oe=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/,rt=/^[^\n]+/,ce=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,nt=g(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",ce).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),st=g(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g,le).getRegex(),Y="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",pe=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,it=g("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",pe).replace("tag",Y).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),Te=t=>g(oe).replace("hr",N).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~~~)[^\\n]*\\n").replace("list",t).replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Y).getRegex(),at=Te(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/),lt=Te(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/),ot=g(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",lt).getRegex(),ue={blockquote:ot,code:Ve,def:nt,fences:Ye,heading:et,hr:N,html:it,lheading:Re,list:st,newline:Je,paragraph:at,table:B,text:rt},ze=g("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",N).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~~~)[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Y).getRegex(),ct={...ue,lheading:tt,table:ze,paragraph:g(oe).replace("hr",N).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",ze).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~~~)[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",Y).getRegex()},pt={...ue,html:g(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",pe).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:B,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:g(oe).replace("hr",N).replace("heading",` *#{1,6} *[^
]`).replace("lheading",Re).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},ut=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,ht=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,Ae=/^( {2,}|\\)\n(?!\s*$)/,dt=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,P=/[\p{P}\p{S}]/u,O=/[\s\p{P}\p{S}]/u,U=/[^\s\p{P}\p{S}]/u,gt=g(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,O).getRegex(),ft=/[\p{Pi}\p{Ps}"']/u,_e=/(?!~)[\p{P}\p{S}]/u,kt=/(?!~)[\s\p{P}\p{S}]/u,bt=/(?:[^\s\p{P}\p{S}]|~)/u,xt=g(/link|precode-code|html/,"g").replace("link",/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-",Xe?"(?<!`)()":"(^^|[^`])").replace("code",/(?<b>`+)[^`]+\k<b>(?!`)/).replace("html",/<(?! )[^<>]*?>/).getRegex(),Ee=/^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/,mt=g(Ee,"u").replace(/punct/g,P).getRegex(),wt=g(Ee,"u").replace(/punct/g,_e).getRegex(),yt=/^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/,St=g(yt,"u").replace(/openQuote/g,ft).replace(/punct/g,P).getRegex(),Ce="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",$t=g(Ce,"gu").replace(/notPunctSpace/g,U).replace(/punctSpace/g,O).replace(/punct/g,P).getRegex(),vt=g(Ce,"gu").replace(/notPunctSpace/g,bt).replace(/punctSpace/g,kt).replace(/punct/g,_e).getRegex(),Rt="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)",Tt=g(Rt,"gu").replace(/notPunctSpace/g,U).replace(/punctSpace/g,O).replace(/punct/g,P).getRegex(),zt=g("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,U).replace(/punctSpace/g,O).replace(/punct/g,P).getRegex(),At="^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)",_t=g(At,"gu").replace(/notPunctSpace/g,U).replace(/punctSpace/g,O).replace(/punct/g,P).getRegex(),Et=g(/^~~?(?:((?!~)punct)|[^\s~])/,"u").replace(/punct/g,P).getRegex(),Ct="^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)",Pt=g(Ct,"gu").replace(/notPunctSpace/g,U).replace(/punctSpace/g,O).replace(/punct/g,P).getRegex(),It=g(/\\(punct)/,"gu").replace(/punct/g,P).getRegex(),Lt=g(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),qt=g(pe).replace("(?:-->|$)","-->").getRegex(),Bt=g("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",qt).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),ee=/(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/,Dt=g(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/).replace("label",ee).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),Pe=g(/^!?\[(label)\]\[(ref)\]/).replace("label",ee).replace("ref",ce).getRegex(),Ie=g(/^!?\[(ref)\](?:\[\])?/).replace("ref",ce).getRegex(),Mt=g("reflink|nolink(?!\\()","g").replace("reflink",Pe).replace("nolink",Ie).getRegex(),Le=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,he={_backpedal:B,anyPunctuation:It,autolink:Lt,blockSkip:xt,br:Ae,code:ht,del:B,delLDelim:B,delRDelim:B,emStrongLDelim:mt,emStrongRDelimAst:$t,emStrongRDelimUnd:zt,escape:ut,link:Dt,nolink:Ie,punctuation:gt,reflink:Pe,reflinkSearch:Mt,tag:Bt,text:dt,url:B},jt={...he,emStrongLDelim:St,emStrongRDelimAst:Tt,emStrongRDelimUnd:_t,link:g(/^!?\[(label)\]\((.*?)\)/).replace("label",ee).getRegex(),reflink:g(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",ee).getRegex()},de={...he,emStrongRDelimAst:vt,emStrongLDelim:wt,delLDelim:Et,delRDelim:Pt,url:g(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol",Le).replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:g(/^(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol",Le).getRegex()},Ht={...de,br:g(Ae).replace("{2,}","*").getRegex(),text:g(de.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},te={normal:ue,gfm:ct,pedantic:pt},G={normal:he,gfm:de,breaks:Ht,pedantic:jt},Zt={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},qe=t=>Zt[t];function C(t,e){if(e){if(w.escapeTest.test(t))return t.replace(w.escapeReplace,qe)}else if(w.escapeTestNoEncode.test(t))return t.replace(w.escapeReplaceNoEncode,qe);return t}function Be(t){try{t=encodeURI(t).replace(w.percentDecode,"%")}catch{return null}return t}function De(t,e){let r=t.replace(w.findPipe,(i,l,a)=>{let o=!1,c=l;for(;--c>=0&&a[c]==="\\";)o=!o;return o?"|":" |"}),s=r.split(w.splitPipe),n=0;if(s[0].trim()||s.shift(),s.length>0&&!s.at(-1)?.trim()&&s.pop(),e)if(s.length>e)s.splice(e);else for(;s.length<e;)s.push("");for(;n<s.length;n++)s[n]=s[n].trim().replace(w.slashPipe,"|");return s}function I(t,e,r){let s=t.length;if(s===0)return"";let n=0;for(;n<s&&t.charAt(s-n-1)===e;)n++;return t.slice(0,s-n)}function Me(t){let e=t.split(`
`),r=e.length-1;for(;r>=0&&w.blankLine.test(e[r]);)r--;return e.length-r<=2?t:e.slice(0,r+1).join(`
`)}function Ot(t,e){if(t.indexOf(e[1])===-1)return-1;let r=0;for(let s=0;s<t.length;s++)if(t[s]==="\\")s++;else if(t[s]===e[0])r++;else if(t[s]===e[1]&&(r--,r<0))return s;return r>0?-2:-1}function Qt(t,e=0){let r=e,s="";for(let n of t)if(n==="	"){let i=4-r%4;s+=" ".repeat(i),r+=i}else s+=n,r++;return s}function je(t,e,r,s,n){let i=e.href,l=e.title||null,a=t[1].replace(n.other.outputLinkReplace,"$1");s.state.inLink=!0;let o={type:t[0].charAt(0)==="!"?"image":"link",raw:r,href:i,title:l,text:a,tokens:s.inlineTokens(a)};return s.state.inLink=!1,o}function Nt(t,e,r){let s=t.match(r.other.indentCodeCompensation);if(s===null)return e;let n=s[1];return e.split(`
`).map(i=>{let l=i.match(r.other.beginningSpace);if(l===null)return i;let[a]=l;return a.length>=n.length?i.slice(n.length):i}).join(`
`)}var re=class{constructor(t){f(this,"options");f(this,"rules");f(this,"lexer");this.options=t||q}space(t){let e=this.rules.block.newline.exec(t);if(e&&e[0].length>0)return{type:"space",raw:e[0]}}code(t){let e=this.rules.block.code.exec(t);if(e){let r=this.options.pedantic?e[0]:Me(e[0]),s=r.replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:r,codeBlockStyle:"indented",text:s}}}fences(t){let e=this.rules.block.fences.exec(t);if(e){let r=e[0],s=Nt(r,e[3]||"",this.rules);return{type:"code",raw:r,lang:e[2]?e[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):e[2],text:s}}}heading(t){let e=this.rules.block.heading.exec(t);if(e){let r=e[2].trim();if(this.rules.other.endingHash.test(r)){let s=I(r,"#");(this.options.pedantic||!s||this.rules.other.endingSpaceChar.test(s))&&(r=s.trim())}return{type:"heading",raw:I(e[0],`
`),depth:e[1].length,text:r,tokens:this.lexer.inline(r)}}}hr(t){let e=this.rules.block.hr.exec(t);if(e)return{type:"hr",raw:I(e[0],`
`)}}blockquote(t){let e=this.rules.block.blockquote.exec(t);if(e){let r=I(e[0],`
`).split(`
`),s="",n="",i=[];for(;r.length>0;){let l=!1,a=[],o;for(o=0;o<r.length;o++)if(this.rules.other.blockquoteStart.test(r[o]))a.push(r[o]),l=!0;else if(!l)a.push(r[o]);else break;r=r.slice(o);let c=a.join(`
`),u=c.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");s=s?`${s}
${c}`:c,n=n?`${n}
${u}`:u;let p=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(u,i,!0),this.lexer.state.top=p,r.length===0)break;let h=i.at(-1);if(h?.type==="code")break;if(h?.type==="blockquote"){let x=h,d=r.join(`
`),m=x.raw+`
`+d.replace(this.rules.other.blockquoteSetextReplace2,""),$=this.blockquote(m);i[i.length-1]=$,s=`${s}
${d}`,n=n.substring(0,n.length-x.text.length)+$.text;break}else if(h?.type==="list"){let x=h,d=x.raw+`
`+r.join(`
`),m=this.list(d);i[i.length-1]=m,s=s.substring(0,s.length-h.raw.length)+m.raw,n=n.substring(0,n.length-x.raw.length)+m.raw,r=d.substring(i.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:s,tokens:i,text:n}}}list(t){let e=this.rules.block.list.exec(t);if(e){let r=e[1].trim(),s=r.length>1,n={type:"list",raw:"",ordered:s,start:s?+r.slice(0,-1):"",loose:!1,items:[]};r=s?`\\d{1,9}\\${r.slice(-1)}`:`\\${r}`,this.options.pedantic&&(r=s?r:"[*+-]");let i=this.rules.other.listItemRegex(r),l=!1;for(;t;){let o=!1,c="",u="";if(!(e=i.exec(t))||this.rules.block.hr.test(t))break;c=e[0],t=t.substring(c.length);let p=Qt(e[2].split(`
`,1)[0],e[1].length),h=t.split(`
`,1)[0],x=!p.trim(),d=0;if(this.options.pedantic?(d=2,u=p.trimStart()):x?d=e[1].length+1:(d=p.search(this.rules.other.nonSpaceChar),d=d>4?1:d,u=p.slice(d),d+=e[1].length),x&&this.rules.other.blankLine.test(h)&&(c+=h+`
`,t=t.substring(h.length+1),o=!0),!o){let m=this.rules.other.nextBulletRegex(d),$=this.rules.other.hrRegex(d),M=this.rules.other.fencesBeginRegex(d),se=this.rules.other.headingBeginRegex(d),xe=this.rules.other.htmlBeginRegex(d),Q=this.rules.other.blockquoteBeginRegex(d);for(;t;){let j=t.split(`
`,1)[0],_;if(h=j,this.options.pedantic?(h=h.replace(this.rules.other.listReplaceNesting,"  "),_=h):_=h.replace(this.rules.other.tabCharGlobal,"    "),M.test(h)||se.test(h)||xe.test(h)||Q.test(h)||m.test(h)||$.test(h))break;if(_.search(this.rules.other.nonSpaceChar)>=d||!h.trim())u+=`
`+_.slice(d);else{if(x||p.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||M.test(p)||se.test(p)||$.test(p))break;u+=`
`+h}x=!h.trim(),c+=j+`
`,t=t.substring(j.length+1),p=_.slice(d)}}n.loose||(l?n.loose=!0:this.rules.other.doubleBlankLine.test(c)&&(l=!0)),n.items.push({type:"list_item",raw:c,task:!!this.options.gfm&&this.rules.other.listIsTask.test(u),loose:!1,text:u,tokens:[]}),n.raw+=c}let a=n.items.at(-1);if(a)a.raw=a.raw.trimEnd(),a.text=a.text.trimEnd();else return;n.raw=n.raw.trimEnd();for(let o of n.items){this.lexer.state.top=!1,o.tokens=this.lexer.blockTokens(o.text,[]);let c=o.tokens[0];if(o.task&&(c?.type==="text"||c?.type==="paragraph")){o.text=o.text.replace(this.rules.other.listReplaceTask,""),c.raw=c.raw.replace(this.rules.other.listReplaceTask,""),c.text=c.text.replace(this.rules.other.listReplaceTask,"");for(let p=this.lexer.inlineQueue.length-1;p>=0;p--)if(this.rules.other.listIsTask.test(this.lexer.inlineQueue[p].src)){this.lexer.inlineQueue[p].src=this.lexer.inlineQueue[p].src.replace(this.rules.other.listReplaceTask,"");break}let u=this.rules.other.listTaskCheckbox.exec(o.raw);if(u){let p={type:"checkbox",raw:u[0]+" ",checked:u[0]!=="[ ]"};o.checked=p.checked,n.loose?o.tokens[0]&&["paragraph","text"].includes(o.tokens[0].type)&&"tokens"in o.tokens[0]&&o.tokens[0].tokens?(o.tokens[0].raw=p.raw+o.tokens[0].raw,o.tokens[0].text=p.raw+o.tokens[0].text,o.tokens[0].tokens.unshift(p)):o.tokens.unshift({type:"paragraph",raw:p.raw,text:p.raw,tokens:[p]}):o.tokens.unshift(p)}}else o.task&&(o.task=!1);if(!n.loose){let u=o.tokens.filter(h=>h.type==="space"),p=u.length>0&&u.some(h=>this.rules.other.anyLine.test(h.raw));n.loose=p}}if(n.loose)for(let o of n.items){o.loose=!0;for(let c of o.tokens)c.type==="text"&&(c.type="paragraph")}return n}}html(t){let e=this.rules.block.html.exec(t);if(e){let r=Me(e[0]);return{type:"html",block:!0,raw:r,pre:e[1]==="pre"||e[1]==="script"||e[1]==="style",text:r}}}def(t){let e=this.rules.block.def.exec(t);if(e){let r=e[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),s=e[2]?e[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",n=e[3]?e[3].substring(1,e[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):e[3];return{type:"def",tag:r,raw:I(e[0],`
`),href:s,title:n}}}table(t){let e=this.rules.block.table.exec(t);if(!e||!this.rules.other.tableDelimiter.test(e[2]))return;let r=De(e[1]),s=e[2].replace(this.rules.other.tableAlignChars,"").split("|"),n=e[3]?.trim()?e[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],i={type:"table",raw:I(e[0],`
`),header:[],align:[],rows:[]};if(r.length===s.length){for(let l of s)this.rules.other.tableAlignRight.test(l)?i.align.push("right"):this.rules.other.tableAlignCenter.test(l)?i.align.push("center"):this.rules.other.tableAlignLeft.test(l)?i.align.push("left"):i.align.push(null);for(let l=0;l<r.length;l++)i.header.push({text:r[l],tokens:this.lexer.inline(r[l]),header:!0,align:i.align[l]});for(let l of n)i.rows.push(De(l,i.header.length).map((a,o)=>({text:a,tokens:this.lexer.inline(a),header:!1,align:i.align[o]})));return i}}lheading(t){let e=this.rules.block.lheading.exec(t);if(e){let r=e[1].trim();return{type:"heading",raw:I(e[0],`
`),depth:e[2].charAt(0)==="="?1:2,text:r,tokens:this.lexer.inline(r)}}}paragraph(t){let e=this.rules.block.paragraph.exec(t);if(e){let r=e[1].charAt(e[1].length-1)===`
`?e[1].slice(0,-1):e[1];return{type:"paragraph",raw:e[0],text:r,tokens:this.lexer.inline(r)}}}text(t){let e=this.rules.block.text.exec(t);if(e)return{type:"text",raw:e[0],text:e[0],tokens:this.lexer.inline(e[0])}}escape(t){let e=this.rules.inline.escape.exec(t);if(e)return{type:"escape",raw:e[0],text:e[1]}}tag(t){let e=this.rules.inline.tag.exec(t);if(e)return!this.lexer.state.inLink&&this.rules.other.startATag.test(e[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(e[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(e[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(e[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:e[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:e[0]}}link(t){let e=this.rules.inline.link.exec(t);if(e){let r=e[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(r)){if(!this.rules.other.endAngleBracket.test(r))return;let i=I(r.slice(0,-1),"\\");if((r.length-i.length)%2===0)return}else{let i=Ot(e[2],"()");if(i===-2)return;if(i>-1){let l=(e[0].indexOf("!")===0?5:4)+e[1].length+i;e[2]=e[2].substring(0,i),e[0]=e[0].substring(0,l).trim(),e[3]=""}}let s=e[2],n="";if(this.options.pedantic){let i=this.rules.other.pedanticHrefTitle.exec(s);i&&(s=i[1],n=i[3])}else n=e[3]?e[3].slice(1,-1):"";return s=s.trim(),this.rules.other.startAngleBracket.test(s)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(r)?s=s.slice(1):s=s.slice(1,-1)),je(e,{href:s&&s.replace(this.rules.inline.anyPunctuation,"$1"),title:n&&n.replace(this.rules.inline.anyPunctuation,"$1")},e[0],this.lexer,this.rules)}}reflink(t,e){let r;if((r=this.rules.inline.reflink.exec(t))||(r=this.rules.inline.nolink.exec(t))){let s=(r[2]||r[1]).replace(this.rules.other.multipleSpaceGlobal," "),n=e[s.toLowerCase()];if(!n){let i=r[0].charAt(0);return{type:"text",raw:i,text:i}}return je(r,n,r[0],this.lexer,this.rules)}}emStrong(t,e,r=""){let s=this.rules.inline.emStrongLDelim.exec(t);if(!(!s||!s[1]&&!s[2]&&!s[3]&&!s[4]||s[4]&&r.match(this.rules.other.unicodeAlphaNumeric))&&(!(s[1]||s[3])||!r||this.rules.inline.punctuation.exec(r))){let n=[...s[0]].length-1,i,l,a=n,o=0,c=s[0][0],u=r===c,p=c==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(p.lastIndex=0,e=e.slice(-1*t.length+n);(s=p.exec(e))!==null;){if(i=s[1]||s[2]||s[3]||s[4]||s[5]||s[6],!i)continue;if(l=[...i].length,s[3]||s[4]){a+=l;continue}else if(s[5]||s[6]){if(n%3&&!((n+l)%3)){o+=l;continue}if(u)break}if(a-=l,a>0)continue;l=Math.min(l,l+a+o);let h=[...s[0]][0].length,x=t.slice(0,n+s.index+h+l);if(Math.min(n,l)%2){let m=x.slice(1,-1);return{type:"em",raw:x,text:m,tokens:this.lexer.inlineTokens(m)}}let d=x.slice(2,-2);return{type:"strong",raw:x,text:d,tokens:this.lexer.inlineTokens(d)}}}}codespan(t){let e=this.rules.inline.code.exec(t);if(e){let r=e[2].replace(this.rules.other.newLineCharGlobal," "),s=this.rules.other.nonSpaceChar.test(r),n=this.rules.other.startingSpaceChar.test(r)&&this.rules.other.endingSpaceChar.test(r);return s&&n&&(r=r.substring(1,r.length-1)),{type:"codespan",raw:e[0],text:r}}}br(t){let e=this.rules.inline.br.exec(t);if(e)return{type:"br",raw:e[0]}}del(t,e,r=""){let s=this.rules.inline.delLDelim.exec(t);if(s&&(!s[1]||!r||this.rules.inline.punctuation.exec(r))){let n=[...s[0]].length-1,i,l,a=n,o=this.rules.inline.delRDelim;for(o.lastIndex=0,e=e.slice(-1*t.length+n);(s=o.exec(e))!==null;){if(i=s[1]||s[2]||s[3]||s[4]||s[5]||s[6],!i||(l=[...i].length,l!==n))continue;if(s[3]||s[4]){a+=l;continue}if(a-=l,a>0)continue;l=Math.min(l,l+a);let c=[...s[0]][0].length,u=t.slice(0,n+s.index+c+l),p=u.slice(n,-n);return{type:"del",raw:u,text:p,tokens:this.lexer.inlineTokens(p)}}}}autolink(t){let e=this.rules.inline.autolink.exec(t);if(e){let r,s;return e[2]==="@"?(r=e[1],s="mailto:"+r):(r=e[1],s=r),{type:"link",raw:e[0],text:r,href:s,tokens:[{type:"text",raw:r,text:r}]}}}url(t){let e;if(e=this.rules.inline.url.exec(t)){let r,s;if(e[2]==="@")r=e[0],s="mailto:"+r;else{let n;do n=e[0],e[0]=this.rules.inline._backpedal.exec(e[0])?.[0]??"";while(n!==e[0]);r=e[0],e[1]==="www."?s="http://"+e[0]:s=e[0]}return{type:"link",raw:e[0],text:r,href:s,tokens:[{type:"text",raw:r,text:r}]}}}inlineText(t){let e=this.rules.inline.text.exec(t);if(e){let r=this.lexer.state.inRawBlock;return{type:"text",raw:e[0],text:e[0],escaped:r}}}},z=class we{constructor(e){f(this,"tokens");f(this,"options");f(this,"state");f(this,"inlineQueue");f(this,"tokenizer");this.tokens=[],this.tokens.links=Object.create(null),this.options=e||q,this.options.tokenizer=this.options.tokenizer||new re,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let r={other:w,block:te.normal,inline:G.normal};this.options.pedantic?(r.block=te.pedantic,r.inline=G.pedantic):this.options.gfm&&(r.block=te.gfm,this.options.breaks?r.inline=G.breaks:r.inline=G.gfm),this.tokenizer.rules=r}static get rules(){return{block:te,inline:G}}static lex(e,r){return new we(r).lex(e)}static lexInline(e,r){return new we(r).inlineTokens(e)}lex(e){e=e.replace(w.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let r=0;r<this.inlineQueue.length;r++){let s=this.inlineQueue[r];this.inlineTokens(s.src,s.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,r=[],s=!1){this.tokenizer.lexer=this,this.options.pedantic&&(e=e.replace(w.tabCharGlobal,"    ").replace(w.spaceLine,""));let n=1/0;for(;e;){if(e.length<n)n=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}let i;if(this.options.extensions?.block?.some(a=>(i=a.call({lexer:this},e,r))?(e=e.substring(i.raw.length),r.push(i),!0):!1))continue;if(i=this.tokenizer.space(e)){e=e.substring(i.raw.length);let a=r.at(-1);i.raw.length===1&&a!==void 0?a.raw+=`
`:r.push(i);continue}if(i=this.tokenizer.code(e)){e=e.substring(i.raw.length);let a=r.at(-1);a?.type==="paragraph"||a?.type==="text"?(a.raw+=(a.raw.endsWith(`
`)?"":`
`)+i.raw,a.text+=`
`+i.text,this.inlineQueue.at(-1).src=a.text):r.push(i);continue}if(i=this.tokenizer.fences(e)){e=e.substring(i.raw.length),r.push(i);continue}if(i=this.tokenizer.heading(e)){e=e.substring(i.raw.length),r.push(i);continue}if(i=this.tokenizer.hr(e)){e=e.substring(i.raw.length),r.push(i);continue}if(i=this.tokenizer.blockquote(e)){e=e.substring(i.raw.length),r.push(i);continue}if(i=this.tokenizer.list(e)){e=e.substring(i.raw.length),r.push(i);continue}if(i=this.tokenizer.html(e)){e=e.substring(i.raw.length),r.push(i);continue}if(i=this.tokenizer.def(e)){e=e.substring(i.raw.length);let a=r.at(-1);a?.type==="paragraph"||a?.type==="text"?(a.raw+=(a.raw.endsWith(`
`)?"":`
`)+i.raw,a.text+=`
`+i.raw,this.inlineQueue.at(-1).src=a.text):this.tokens.links[i.tag]||(this.tokens.links[i.tag]={href:i.href,title:i.title},r.push(i));continue}if(i=this.tokenizer.table(e)){e=e.substring(i.raw.length),r.push(i);continue}if(i=this.tokenizer.lheading(e)){e=e.substring(i.raw.length),r.push(i);continue}let l=e;if(this.options.extensions?.startBlock){let a=1/0,o=e.slice(1),c;this.options.extensions.startBlock.forEach(u=>{c=u.call({lexer:this},o),typeof c=="number"&&c>=0&&(a=Math.min(a,c))}),a<1/0&&a>=0&&(l=e.substring(0,a+1))}if(this.state.top&&(i=this.tokenizer.paragraph(l))){let a=r.at(-1);s&&a?.type==="paragraph"?(a.raw+=(a.raw.endsWith(`
`)?"":`
`)+i.raw,a.text+=`
`+i.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=a.text):r.push(i),s=l.length!==e.length,e=e.substring(i.raw.length);continue}if(i=this.tokenizer.text(e)){e=e.substring(i.raw.length);let a=r.at(-1);a?.type==="text"?(a.raw+=(a.raw.endsWith(`
`)?"":`
`)+i.raw,a.text+=`
`+i.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=a.text):r.push(i);continue}if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return this.state.top=!0,r}inline(e,r=[]){return this.inlineQueue.push({src:e,tokens:r}),r}inlineTokens(e,r=[]){this.tokenizer.lexer=this;let s=e;if(this.tokens.links){let a=Object.keys(this.tokens.links);a.length>0&&(s=s.replace(this.tokenizer.rules.inline.reflinkSearch,o=>a.includes(o.slice(o.lastIndexOf("[")+1,-1))?"["+"a".repeat(o.length-2)+"]":o))}s=s.replace(this.tokenizer.rules.inline.anyPunctuation,"++"),s=s.replace(this.tokenizer.rules.inline.blockSkip,(a,o,c)=>{let u=c?c.length:0;return a.slice(0,u)+"["+"a".repeat(a.length-u-2)+"]"}),s=this.options.hooks?.emStrongMask?.call({lexer:this},s)??s;let n=!1,i="",l=1/0;for(;e;){if(e.length<l)l=e.length;else{this.infiniteLoopError(e.charCodeAt(0));break}n||(i=""),n=!1;let a;if(this.options.extensions?.inline?.some(c=>(a=c.call({lexer:this},e,r))?(e=e.substring(a.raw.length),r.push(a),!0):!1))continue;if(a=this.tokenizer.escape(e)){e=e.substring(a.raw.length),r.push(a);continue}if(a=this.tokenizer.tag(e)){e=e.substring(a.raw.length),r.push(a);continue}if(a=this.tokenizer.link(e)){e=e.substring(a.raw.length),r.push(a);continue}if(a=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(a.raw.length);let c=r.at(-1);a.type==="text"&&c?.type==="text"?(c.raw+=a.raw,c.text+=a.text):r.push(a);continue}if(a=this.tokenizer.emStrong(e,s,i)){e=e.substring(a.raw.length),r.push(a);continue}if(a=this.tokenizer.codespan(e)){e=e.substring(a.raw.length),r.push(a);continue}if(a=this.tokenizer.br(e)){e=e.substring(a.raw.length),r.push(a);continue}if(a=this.tokenizer.del(e,s,i)){e=e.substring(a.raw.length),r.push(a);continue}if(a=this.tokenizer.autolink(e)){e=e.substring(a.raw.length),r.push(a);continue}if(!this.state.inLink&&(a=this.tokenizer.url(e))){e=e.substring(a.raw.length),r.push(a);continue}let o=e;if(this.options.extensions?.startInline){let c=1/0,u=e.slice(1),p;this.options.extensions.startInline.forEach(h=>{p=h.call({lexer:this},u),typeof p=="number"&&p>=0&&(c=Math.min(c,p))}),c<1/0&&c>=0&&(o=e.substring(0,c+1))}if(a=this.tokenizer.inlineText(o)){e=e.substring(a.raw.length),a.raw.slice(-1)!=="_"&&(i=a.raw.slice(-1)),n=!0;let c=r.at(-1);c?.type==="text"?(c.raw+=a.raw,c.text+=a.text):r.push(a);continue}if(e){this.infiniteLoopError(e.charCodeAt(0));break}}return r}infiniteLoopError(e){let r="Infinite loop on byte: "+e;if(this.options.silent)console.error(r);else throw new Error(r)}},K=class{constructor(t){f(this,"options");f(this,"parser");this.options=t||q}space(t){return""}code({text:t,lang:e,escaped:r}){let s=(e||"").match(w.notSpaceStart)?.[0],n=t.replace(w.endingNewline,"")+`
`;return s?'<pre><code class="language-'+C(s)+'">'+(r?n:C(n,!0))+`</code></pre>
`:"<pre><code>"+(r?n:C(n,!0))+`</code></pre>
`}blockquote({tokens:t}){return`<blockquote>
${this.parser.parse(t)}</blockquote>
`}html({text:t}){return t}def(t){return""}heading({tokens:t,depth:e}){return`<h${e}>${this.parser.parseInline(t)}</h${e}>
`}hr(t){return`<hr>
`}list(t){let e=t.ordered,r=t.start,s="";for(let l=0;l<t.items.length;l++){let a=t.items[l];s+=this.listitem(a)}let n=e?"ol":"ul",i=e&&r!==1?' start="'+r+'"':"";return"<"+n+i+`>
`+s+"</"+n+`>
`}listitem(t){return`<li>${this.parser.parse(t.tokens)}</li>
`}checkbox({checked:t}){return"<input "+(t?'checked="" ':"")+'disabled="" type="checkbox"> '}paragraph({tokens:t}){return`<p>${this.parser.parseInline(t)}</p>
`}table(t){let e="",r="";for(let n=0;n<t.header.length;n++)r+=this.tablecell(t.header[n]);e+=this.tablerow({text:r});let s="";for(let n=0;n<t.rows.length;n++){let i=t.rows[n];r="";for(let l=0;l<i.length;l++)r+=this.tablecell(i[l]);s+=this.tablerow({text:r})}return s&&(s=`<tbody>${s}</tbody>`),`<table>
<thead>
`+e+`</thead>
`+s+`</table>
`}tablerow({text:t}){return`<tr>
${t}</tr>
`}tablecell(t){let e=this.parser.parseInline(t.tokens),r=t.header?"th":"td";return(t.align?`<${r} align="${t.align}">`:`<${r}>`)+e+`</${r}>
`}strong({tokens:t}){return`<strong>${this.parser.parseInline(t)}</strong>`}em({tokens:t}){return`<em>${this.parser.parseInline(t)}</em>`}codespan({text:t}){return`<code>${C(t,!0)}</code>`}br(t){return"<br>"}del({tokens:t}){return`<del>${this.parser.parseInline(t)}</del>`}link({href:t,title:e,tokens:r}){let s=this.parser.parseInline(r),n=Be(t);if(n===null)return s;t=n;let i='<a href="'+t+'"';return e&&(i+=' title="'+C(e)+'"'),i+=">"+s+"</a>",i}image({href:t,title:e,text:r,tokens:s}){s&&(r=this.parser.parseInline(s,this.parser.textRenderer));let n=Be(t);if(n===null)return C(r);t=n;let i=`<img src="${t}" alt="${C(r)}"`;return e&&(i+=` title="${C(e)}"`),i+=">",i}text(t){return"tokens"in t&&t.tokens?this.parser.parseInline(t.tokens):"escaped"in t&&t.escaped?t.text:C(t.text)}},ge=class{strong({text:t}){return t}em({text:t}){return t}codespan({text:t}){return t}del({text:t}){return t}html({text:t}){return t}text({text:t}){return t}link({text:t}){return""+t}image({text:t}){return""+t}br(){return""}checkbox({raw:t}){return t}},A=class ye{constructor(e){f(this,"options");f(this,"renderer");f(this,"textRenderer");this.options=e||q,this.options.renderer=this.options.renderer||new K,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new ge}static parse(e,r){return new ye(r).parse(e)}static parseInline(e,r){return new ye(r).parseInline(e)}parse(e){this.renderer.parser=this;let r="";for(let s=0;s<e.length;s++){let n=e[s];if(this.options.extensions?.renderers?.[n.type]){let l=n,a=this.options.extensions.renderers[l.type].call({parser:this},l);if(a!==!1||!["space","hr","heading","code","table","blockquote","list","checkbox","html","def","paragraph","text"].includes(l.type)){r+=a||"";continue}}let i=n;switch(i.type){case"space":{r+=this.renderer.space(i);break}case"hr":{r+=this.renderer.hr(i);break}case"heading":{r+=this.renderer.heading(i);break}case"code":{r+=this.renderer.code(i);break}case"table":{r+=this.renderer.table(i);break}case"blockquote":{r+=this.renderer.blockquote(i);break}case"list":{r+=this.renderer.list(i);break}case"checkbox":{r+=this.renderer.checkbox(i);break}case"html":{r+=this.renderer.html(i);break}case"def":{r+=this.renderer.def(i);break}case"paragraph":{r+=this.renderer.paragraph(i);break}case"text":{r+=this.renderer.text(i);break}default:{let l='Token with "'+i.type+'" type was not found.';if(this.options.silent)return console.error(l),"";throw new Error(l)}}}return r}parseInline(e,r=this.renderer){this.renderer.parser=this;let s="";for(let n=0;n<e.length;n++){let i=e[n];if(this.options.extensions?.renderers?.[i.type]){let a=this.options.extensions.renderers[i.type].call({parser:this},i);if(a!==!1||!["escape","html","link","image","checkbox","strong","em","codespan","br","del","text"].includes(i.type)){s+=a||"";continue}}let l=i;switch(l.type){case"escape":{s+=r.text(l);break}case"html":{s+=r.html(l);break}case"link":{s+=r.link(l);break}case"image":{s+=r.image(l);break}case"checkbox":{s+=r.checkbox(l);break}case"strong":{s+=r.strong(l);break}case"em":{s+=r.em(l);break}case"codespan":{s+=r.codespan(l);break}case"br":{s+=r.br(l);break}case"del":{s+=r.del(l);break}case"text":{s+=r.text(l);break}default:{let a='Token with "'+l.type+'" type was not found.';if(this.options.silent)return console.error(a),"";throw new Error(a)}}}return s}},W=(ne=class{constructor(t){f(this,"options");f(this,"block");this.options=t||q}preprocess(t){return t}postprocess(t){return t}processAllTokens(t){return t}emStrongMask(t){return t}provideLexer(t=this.block){return t?z.lex:z.lexInline}provideParser(t=this.block){return t?A.parse:A.parseInline}},f(ne,"passThroughHooks",new Set(["preprocess","postprocess","processAllTokens","emStrongMask"])),f(ne,"passThroughHooksRespectAsync",new Set(["preprocess","postprocess","processAllTokens"])),ne),Ut=class{constructor(...t){f(this,"defaults",ae());f(this,"options",this.setOptions);f(this,"parse",this.parseMarkdown(!0));f(this,"parseInline",this.parseMarkdown(!1));f(this,"Parser",A);f(this,"Renderer",K);f(this,"TextRenderer",ge);f(this,"Lexer",z);f(this,"Tokenizer",re);f(this,"Hooks",W);this.use(...t)}walkTokens(t,e){let r=[];for(let s of t)switch(r=r.concat(e.call(this,s)),s.type){case"table":{let n=s;for(let i of n.header)r=r.concat(this.walkTokens(i.tokens,e));for(let i of n.rows)for(let l of i)r=r.concat(this.walkTokens(l.tokens,e));break}case"list":{let n=s;r=r.concat(this.walkTokens(n.items,e));break}default:{let n=s;this.defaults.extensions?.childTokens?.[n.type]?this.defaults.extensions.childTokens[n.type].forEach(i=>{let l=n[i].flat(1/0);r=r.concat(this.walkTokens(l,e))}):n.tokens&&(r=r.concat(this.walkTokens(n.tokens,e)))}}return r}use(...t){let e=this.defaults.extensions||{renderers:{},childTokens:{}};return t.forEach(r=>{let s={...r};if(s.async=this.defaults.async||s.async||!1,r.extensions&&(r.extensions.forEach(n=>{if(!n.name)throw new Error("extension name required");if("renderer"in n){let i=e.renderers[n.name];i?e.renderers[n.name]=function(...l){let a=n.renderer.apply(this,l);return a===!1&&(a=i.apply(this,l)),a}:e.renderers[n.name]=n.renderer}if("tokenizer"in n){if(!n.level||n.level!=="block"&&n.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let i=e[n.level];i?i.unshift(n.tokenizer):e[n.level]=[n.tokenizer],n.start&&(n.level==="block"?e.startBlock?e.startBlock.push(n.start):e.startBlock=[n.start]:n.level==="inline"&&(e.startInline?e.startInline.push(n.start):e.startInline=[n.start]))}"childTokens"in n&&n.childTokens&&(e.childTokens[n.name]=n.childTokens)}),s.extensions=e),r.renderer){let n=this.defaults.renderer||new K(this.defaults);for(let i in r.renderer){if(!(i in n))throw new Error(`renderer '${i}' does not exist`);if(["options","parser"].includes(i))continue;let l=i,a=r.renderer[l],o=n[l];n[l]=(...c)=>{let u=a.apply(n,c);return u===!1&&(u=o.apply(n,c)),u||""}}s.renderer=n}if(r.tokenizer){let n=this.defaults.tokenizer||new re(this.defaults);for(let i in r.tokenizer){if(!(i in n))throw new Error(`tokenizer '${i}' does not exist`);if(["options","rules","lexer"].includes(i))continue;let l=i,a=r.tokenizer[l],o=n[l];n[l]=(...c)=>{let u=a.apply(n,c);return u===!1&&(u=o.apply(n,c)),u}}s.tokenizer=n}if(r.hooks){let n=this.defaults.hooks||new W;for(let i in r.hooks){if(!(i in n))throw new Error(`hook '${i}' does not exist`);if(["options","block"].includes(i))continue;let l=i,a=r.hooks[l],o=n[l];W.passThroughHooks.has(i)?n[l]=c=>{if(this.defaults.async&&W.passThroughHooksRespectAsync.has(i))return(async()=>{let p=await a.call(n,c);return o.call(n,p)})();let u=a.call(n,c);return o.call(n,u)}:n[l]=(...c)=>{if(this.defaults.async)return(async()=>{let p=await a.apply(n,c);return p===!1&&(p=await o.apply(n,c)),p})();let u=a.apply(n,c);return u===!1&&(u=o.apply(n,c)),u}}s.hooks=n}if(r.walkTokens){let n=this.defaults.walkTokens,i=r.walkTokens;s.walkTokens=function(l){let a=[];return a.push(i.call(this,l)),n&&(a=a.concat(n.call(this,l))),a}}this.defaults={...this.defaults,...s}}),this}setOptions(t){return this.defaults={...this.defaults,...t},this}lexer(t,e){return z.lex(t,e??this.defaults)}parser(t,e){return A.parse(t,e??this.defaults)}parseMarkdown(t){return(e,r)=>{let s={...r},n={...this.defaults,...s},i=this.onError(!!n.silent,!!n.async);if(this.defaults.async===!0&&s.async===!1)return i(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof e>"u"||e===null)return i(new Error("marked(): input parameter is undefined or null"));if(typeof e!="string")return i(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(e)+", string expected"));if(n.hooks&&(n.hooks.options=n,n.hooks.block=t),n.async)return(async()=>{let l=n.hooks?await n.hooks.preprocess(e):e,a=await(n.hooks?await n.hooks.provideLexer(t):t?z.lex:z.lexInline)(l,n),o=n.hooks?await n.hooks.processAllTokens(a):a;n.walkTokens&&await Promise.all(this.walkTokens(o,n.walkTokens));let c=await(n.hooks?await n.hooks.provideParser(t):t?A.parse:A.parseInline)(o,n);return n.hooks?await n.hooks.postprocess(c):c})().catch(i);try{n.hooks&&(e=n.hooks.preprocess(e));let l=(n.hooks?n.hooks.provideLexer(t):t?z.lex:z.lexInline)(e,n);n.hooks&&(l=n.hooks.processAllTokens(l)),n.walkTokens&&this.walkTokens(l,n.walkTokens);let a=(n.hooks?n.hooks.provideParser(t):t?A.parse:A.parseInline)(l,n);return n.hooks&&(a=n.hooks.postprocess(a)),a}catch(l){return i(l)}}}onError(t,e){return r=>{if(r.message+=`
Please report this to https://github.com/markedjs/marked.`,t){let s="<p>An error occurred:</p><pre>"+C(r.message+"",!0)+"</pre>";return e?Promise.resolve(s):s}if(e)return Promise.reject(r);throw r}}},D=new Ut;function b(t,e){return D.parse(t,e)}b.options=b.setOptions=function(t){return D.setOptions(t),b.defaults=D.defaults,$e(b.defaults),b},b.getDefaults=ae,b.defaults=q;function Gt(...t){return D.use(...t),b.defaults=D.defaults,$e(b.defaults),b}b.use=Gt,b.walkTokens=function(t,e){return D.walkTokens(t,e)},b.parseInline=D.parseInline,b.Parser=A,b.parser=A.parse,b.Renderer=K,b.TextRenderer=ge,b.Lexer=z,b.lexer=z.lex,b.Tokenizer=re,b.Hooks=W,b.parse=b,b.options,b.setOptions,b.walkTokens,b.parseInline,A.parse,z.lex;const He=new K;He.html=()=>"",b.setOptions({gfm:!0,breaks:!0,renderer:He});function Kt(t){return t.replace(/<br\s*\/?>/gi,`
`).replace(/<\/?b>/gi,"**").replace(/<\/?strong>/gi,"**").replace(/<\/?i>/gi,"_").replace(/<\/?em>/gi,"_")}function Wt(t){const e=Kt(t);return b.parse(e,{async:!1})}const Ft=`
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
  --sai-on-primary: #ffffff;
  --sai-shadow: 0 18px 50px rgba(0, 0, 0, 0.16);
  position: fixed;
  z-index: 2147483000;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.sai-root[data-position="bottom-left"] {
  left: 20px;
  align-items: flex-start;
}

.sai-root[data-position="bottom-right"] {
  right: 20px;
}

.sai-panel {
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
  /* Hardcoded so panel’s dark text can’t win if a CSS variable fails */
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

.sai-header-sub[hidden] {
  display: none;
}

.sai-icon-btn {
  appearance: none;
  border: 0;
  background: rgba(255,255,255,0.12);
  color: #ffffff;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
}

.sai-icon-btn:hover { background: rgba(255,255,255,0.22); }

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
  background: #fff;
  border: 1px solid var(--sai-border);
  border-bottom-left-radius: 4px;
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
  background: #fff;
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
  background: #fff;
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
  color: #b91c1c;
  font-size: 12px;
  padding: 0 16px 8px;
}
`;function fe(){return crypto.randomUUID()}function Ze(t){return`support-ai:conversation:${t.storageKey??t.agentId}`}function Oe(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function ke(t){if(typeof document>"u")throw new Error("SupportAI widget requires a browser environment.");const e=Fe({agentId:t.agentId,apiKey:t.apiKey,apiUrl:t.apiUrl,headers:t.headers}),r=t.position??"bottom-right",s=t.primaryColor??"#111111",n=t.greeting??"Hi! Ask me anything about this product.",i=document.createElement("div");i.setAttribute("data-support-ai-widget",""),(t.container??document.body).appendChild(i);const l=i.attachShadow({mode:"open"}),a=document.createElement("style");a.textContent=Ft,l.appendChild(a);const o=document.createElement("div");o.className="sai-root",o.dataset.position=r,o.style.setProperty("--sai-primary",s),o.style.setProperty("--sai-user",s),l.appendChild(o),o.innerHTML=`
    <div class="sai-panel" data-open="false" part="panel">
      <div class="sai-header">
        <div>
          <p class="sai-header-title">${Oe(t.title??"Support")}</p>
          <p class="sai-header-sub" data-role="header-sub" hidden></p>
        </div>
        <button type="button" class="sai-icon-btn" data-action="close" aria-label="Close chat">×</button>
      </div>
      <div class="sai-messages" data-role="messages"></div>
      <div class="sai-status" data-role="status"></div>
      <div class="sai-error" data-role="error" hidden></div>
      <form class="sai-composer" data-role="form">
        <textarea class="sai-input" data-role="input" rows="1" placeholder="Type your message…"></textarea>
        <button class="sai-send" type="submit" data-role="send">Send</button>
      </form>
    </div>
    <button type="button" class="sai-launcher" data-action="toggle" aria-label="Open chat">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>
    </button>
  `;const c=o.querySelector(".sai-panel"),u=o.querySelector(".sai-header-title"),p=o.querySelector("[data-role=header-sub]"),h=o.querySelector("[data-role=messages]"),x=o.querySelector("[data-role=status]"),d=o.querySelector("[data-role=error]"),m=o.querySelector("[data-role=form]"),$=o.querySelector("[data-role=input]"),M=o.querySelector("[data-role=send]"),se=o.querySelector('[data-action="toggle"]'),xe=o.querySelector('[data-action="close"]');let Q=!1,j=!1,_=null,X=null;const L=[];try{_=localStorage.getItem(Ze(t))}catch{_=null}function J(k){Q=k,c.dataset.open=k?"true":"false",k&&$.focus()}function Ne(k){if(!k){d.hidden=!0,d.textContent="";return}d.hidden=!1,d.textContent=k}function Jt(k){return k.role==="assistant"?`<div class="sai-bubble" data-role="assistant">${k.content?`<div class="sai-md">${Wt(k.content)}</div>`:"…"}</div>`:`<div class="sai-bubble" data-role="${k.role}">${Oe(k.content)}</div>`}function Ue(){h.innerHTML=L.map(Jt).join(""),h.querySelectorAll(".sai-md a[href]").forEach(k=>{k.setAttribute("target","_blank"),k.setAttribute("rel","noreferrer noopener")}),h.scrollTop=h.scrollHeight}function me(k){L.push(k),Ue()}function ie(k,R){const S=L.find(y=>y.id===k);S&&(S.content=R,Ue())}async function Vt(){try{const k=await e.getAgent(),R=k.name?.trim()||"Support";if(u.textContent=t.title?.trim()||R,t.title?.trim()&&t.title.trim()!==R)p.textContent=R,p.hidden=!1;else{const S=k.description?.trim();S?(p.textContent=S,p.hidden=!1):(p.textContent="",p.hidden=!0)}}catch{}L.length===0&&me({id:fe(),role:"system",content:n})}async function Yt(k){const R=k.trim();if(!R||j)return;Ne(null),j=!0,M.disabled=!0,x.textContent="Thinking…",me({id:fe(),role:"user",content:R});const S=fe();me({id:S,role:"assistant",content:""}),X?.abort(),X=new AbortController;try{await e.chat({message:R,conversationId:_,signal:X.signal,onEvent:y=>{if(y.type==="status"){const E=y.data.stage;x.textContent=E==="retrieving"?"Searching knowledge…":E==="generating"||E==="first_token"?"Writing reply…":E==="started"?"Starting…":E;return}if(y.type==="meta"){_=y.data.conversationId;try{localStorage.setItem(Ze(t),_)}catch{}return}if(y.type==="token"){const E=L.find(V=>V.id===S);ie(S,`${E?.content??""}${y.data.content}`);return}y.type==="done"&&ie(S,y.data.message.content||L.find(E=>E.id===S)?.content||"")}})}catch(y){if(y?.name==="AbortError")return;const E=y instanceof v||y instanceof Error?y.message:"Something went wrong";Ne(E),ie(S,L.find(V=>V.id===S)?.content||"…"),L.find(V=>V.id===S)?.content||ie(S,"(failed to get a reply)")}finally{j=!1,M.disabled=!1,x.textContent="",X=null}}return m.addEventListener("submit",k=>{k.preventDefault();const R=$.value;$.value="",Yt(R)}),$.addEventListener("keydown",k=>{k.key==="Enter"&&!k.shiftKey&&(k.preventDefault(),m.requestSubmit())}),se.addEventListener("click",()=>J(!Q)),xe.addEventListener("click",()=>J(!1)),Vt(),{open:()=>J(!0),close:()=>J(!1),toggle:()=>J(!Q),isOpen:()=>Q,destroy:()=>{X?.abort(),i.remove()}}}let F=null;function Xt(){const t=document.currentScript instanceof HTMLScriptElement?document.currentScript:document.querySelector("script[data-agent-id][data-api-key]");if(!t)return{};const e=t.dataset;return{agentId:e.agentId,apiKey:e.apiKey,apiUrl:e.apiUrl,primaryColor:e.primaryColor,title:e.title,greeting:e.greeting,position:e.position==="bottom-left"||e.position==="bottom-right"?e.position:void 0}}function be(t){return F?.destroy(),F=ke(t),F}function Qe(){F?.destroy(),F=null}return typeof window<"u"&&(window.SupportAI={init:be,destroy:Qe,mountWidget:ke},queueMicrotask(()=>{const t=Xt();t.agentId&&t.apiKey&&t.apiUrl&&be(t)})),T.destroy=Qe,T.init=be,T.mountWidget=ke,Object.defineProperty(T,Symbol.toStringTag,{value:"Module"}),T})({});
//# sourceMappingURL=widget.js.map
