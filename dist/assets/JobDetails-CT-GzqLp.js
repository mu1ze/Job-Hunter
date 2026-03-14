import{c as F,r as b,j as e,e as Z,X as O,F as W,f as ae,b as le,d as oe,s as I,U as $}from"./index-DF6nk6BY.js";import{B as _,I as P}from"./Input-ChnXVsb_.js";import{C as M}from"./Card-CJnrRAx6.js";import{s as S,t as ce}from"./toast-CKZar2jD.js";import{D as T}from"./download-DmBPRdjD.js";import{S as ee}from"./save-atvScG0V.js";import{C as de}from"./chevron-left-NuT0UCqx.js";import{P as H}from"./pen-VdmpGzzK.js";import{T as J}from"./trash-2-SSJgtfzf.js";import{B as me}from"./briefcase-38OOj0n0.js";import{M as he}from"./map-pin-Bam80gEI.js";import{C as pe}from"./calendar-BvWacnOv.js";import{T as xe,G as U}from"./trophy-e2ek1WtK.js";import{D as ue}from"./dollar-sign-CoheAtAs.js";import{E as fe,M as ge}from"./index-BeuID1Iq.js";import{E as we}from"./eye-I795v291.js";import{M as q}from"./mail-DM50FH2n.js";import{P as Y,L as G}from"./phone-C0yBpCgm.js";import{C as K}from"./circle-check-big-BuJtvwqp.js";import{C as be}from"./circle-alert-BwMxpe1k.js";/**
 * @license lucide-react v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const je=[["path",{d:"M3 12h.01",key:"nlz23k"}],["path",{d:"M3 18h.01",key:"1tta3j"}],["path",{d:"M3 6h.01",key:"1rqtza"}],["path",{d:"M8 12h13",key:"1za7za"}],["path",{d:"M8 18h13",key:"1lx6n3"}],["path",{d:"M8 6h13",key:"ik3vkj"}]],ye=F("List",je);/**
 * @license lucide-react v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ve=[["path",{d:"M12 20h9",key:"t2du7b"}],["path",{d:"M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z",key:"1ykcvy"}]],V=F("PenLine",ve);/**
 * @license lucide-react v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ne=[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]],ke=F("RotateCcw",Ne);function Ce({document:i,variant:d="preview"}){const s=b.useRef(null),m=()=>{const g=s.current;if(!g)return;const o=window.open("","_blank");if(!o){S.error("Please allow popups to print/download resume");return}o.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Professional Resume</title>
                    
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@700&family=Inter:wght@400;500;600;700&display=swap');
                
                * { 
                    margin: 0; 
                    padding: 0; 
                    box-sizing: border-box; 
                }
                
                body { 
                    font-family: 'Inter', -apple-system, system-ui, sans-serif; 
                    font-size: 10pt;
                    line-height: 1.4; 
                    color: #000;
                    background: #fff;
                    -webkit-print-color-adjust: exact;
                }
                
                .resume-container {
                    width: 8.5in;
                    min-height: 11in;
                    margin: 0 auto;
                    padding: 0.4in 0.6in;
                    background: #fff;
                }
                
                .resume-header { 
                    text-align: center; 
                    margin-bottom: 0.2in;
                }
                
                .resume-name { 
                    font-family: 'Libre Baskerville', serif;
                    font-size: 24pt; 
                    font-weight: 700; 
                    color: #000;
                    margin-bottom: 0.05in;
                    letter-spacing: -0.5pt;
                    line-height: 1.1;
                }
                
                .resume-contact { 
                    font-size: 9pt; 
                    color: #333;
                    line-height: 1.4;
                    font-weight: 400;
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 8pt;
                }
                
                .resume-contact-item {
                    display: flex;
                    align-items: center;
                }
                
                .resume-section { 
                    margin-bottom: 0.18in; 
                }
                
                .resume-section-title { 
                    font-size: 10.5pt; 
                    font-weight: 700; 
                    color: #000; 
                    text-transform: uppercase; 
                    letter-spacing: 1.5pt;
                    margin-bottom: 0.06in;
                    padding-bottom: 1.5pt;
                    border-bottom: 1pt solid #000;
                    font-family: 'Inter', sans-serif;
                }
                
                .resume-summary { 
                    font-size: 10pt;
                    color: #000;
                    line-height: 1.45;
                    margin-bottom: 0.08in;
                    text-align: justify;
                }
                
                .resume-entry {
                    margin-bottom: 0.12in;
                }
                
                .resume-entry:last-child {
                    margin-bottom: 0;
                }
                
                .resume-entry-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    margin-bottom: 1.5pt;
                }
                
                .resume-entry-title {
                    font-size: 10.5pt;
                    font-weight: 700;
                    color: #000;
                }
                
                .resume-entry-subtitle {
                    font-size: 10pt;
                    color: #000;
                    font-weight: 600;
                }
                
                .resume-entry-date {
                    font-size: 9.5pt;
                    color: #222;
                    font-weight: 500;
                    white-space: nowrap;
                }
                
                .resume-bullets {
                    margin-top: 1.5pt;
                    padding-left: 14pt;
                    list-style-type: disc;
                }
                
                .resume-bullet {
                    margin-bottom: 2pt;
                    font-size: 9.5pt;
                    color: #111;
                    line-height: 1.4;
                }
                
                .resume-skill-line {
                    font-size: 9.5pt;
                    color: #111;
                    line-height: 1.4;
                    margin-bottom: 3pt;
                    display: flex;
                }
                
                .resume-skill-label {
                    font-weight: 700;
                    color: #000;
                    min-width: 1.2in;
                    flex-shrink: 0;
                }
                
                @media print {
                    @page {
                        size: letter;
                        margin: 0;
                    }
                    body { 
                        width: 8.5in;
                        height: 11in;
                        padding: 0;
                        margin: 0;
                    }
                    .no-print { display: none !important; }
                }
            </style>
        
                </head>
                <body>
                    <div class="resume-container">
                        ${g.innerHTML}
                    </div>
                    <script>
                        window.onload = function() {
                            setTimeout(() => window.print(), 100);
                        }
                    <\/script>
                </body>
            </html>
        `),o.document.close()},x=(g=>{const c=g.replace(/\*\*/g,"").replace(/^#+\s+/gm,"").replace(/\s+\|$/gm,"").replace(/^\|\s+/gm,"").replace(/•/g,"-").trim().split(`
`),h=[];let p=null,f=[],N=!1;const E=["SUMMARY","PROFESSIONAL SUMMARY","PROFILE","OBJECTIVE","CAREER OBJECTIVE","EXPERIENCE","WORK EXPERIENCE","PROFESSIONAL EXPERIENCE","EMPLOYMENT HISTORY","EDUCATION","ACADEMIC BACKGROUND","SKILLS","TECHNICAL SKILLS","CORE COMPETENCIES","KEY SKILLS","CERTIFICATIONS","CERTIFICATES","PROJECTS","AWARDS","VOLUNTEER","REFERENCES"];for(let k=0;k<c.length;k++){const j=c[k].trim();if(!j)continue;const w=j.toUpperCase().replace(/^#+\s+/,"").replace(/:$/,"").trim();if(E.some(u=>w===u||w.startsWith(u))){p&&h.push(p),N=!0;let u="other";/SUMMARY|PROFILE|OBJECTIVE/.test(w)?u="summary":/EXPERIENCE|WORK|EMPLOYMENT/.test(w)?u="experience":/EDUCATION|ACADEMIC/.test(w)?u="education":/SKILLS|COMPETENCIES/.test(w)?u="skills":/CERTIFICATIONS|CERTIFICATES/.test(w)&&(u="certifications"),p={type:u,title:j.replace(/:$/,"").trim(),content:[]}}else N?p&&p.content.push(j):f.push(j)}return p&&h.push(p),f.length>0&&h.unshift({type:"header",title:"Contact Information",content:f}),h})(i.content);return d==="print"?e.jsxs("div",{className:"hidden",children:[e.jsx("div",{ref:s,className:"resume-container",children:e.jsx(X,{sections:x})}),e.jsxs(_,{onClick:m,className:"fixed bottom-6 right-6 bg-blue-700 hover:bg-blue-800 text-white shadow-xl z-50 no-print",children:[e.jsx(T,{className:"w-4 h-4 mr-2"}),"Download PDF"]})]}):e.jsxs("div",{className:"w-full max-w-full space-y-4",children:[e.jsx("div",{className:"flex justify-end gap-2 no-print",children:e.jsxs(_,{onClick:m,className:"bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 shadow-lg",size:"sm",children:[e.jsx(T,{className:"w-4 h-4 mr-2"}),"Download PDF"]})}),e.jsx("div",{className:"bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden",children:e.jsx("div",{ref:s,className:"resume-preview-container bg-white",style:{maxWidth:"8.5in",width:"100%",minHeight:"auto",padding:"0.5in 0.65in",fontFamily:"'Inter', sans-serif",fontSize:"10.5pt",lineHeight:1.4,color:"#111",margin:"0 auto"},children:e.jsx(X,{sections:x})})})]})}function X({sections:i}){const d=i.find(t=>t.type==="header"),s=i.filter(t=>t.type!=="header"),m=()=>{if(!d||d.content.length===0)return{name:"",contactItems:[]};const g=d.content.join(" | ").split("|").map(h=>h.trim()).filter(h=>h);let o="";const c=[];for(const h of g)!o&&!h.includes("@")&&!h.includes(".com")&&!h.match(/^\d/)&&!h.includes("http")&&!h.includes("linkedin")?o=h:c.push(h);return{name:o,contactItems:c}},{name:r,contactItems:x}=m();return e.jsxs("div",{style:{padding:"0"},children:[d&&d.content.length>0&&e.jsxs("div",{style:{textAlign:"center",marginBottom:"0.25in"},children:[r&&e.jsx("h1",{style:{fontFamily:"'Libre Baskerville', serif",fontSize:"26pt",fontWeight:700,color:"#000",margin:"0 0 0.08in 0",letterSpacing:"-0.5pt",lineHeight:1.1},children:r}),x.length>0&&e.jsx("div",{style:{fontSize:"9pt",color:"#444",lineHeight:1.4,display:"flex",flexWrap:"wrap",justifyContent:"center",alignItems:"center",fontWeight:400},children:x.map((t,g)=>e.jsxs("span",{style:{display:"inline",whiteSpace:"nowrap"},children:[t,g<x.length-1&&e.jsx("span",{style:{color:"#999",margin:"0 0.08in"},children:"|"})]},g))})]}),s.map((t,g)=>e.jsxs("div",{style:{marginBottom:"0.2in"},children:[e.jsx("h2",{style:{fontSize:"11pt",fontWeight:700,color:"#000",textTransform:"uppercase",letterSpacing:"1.2pt",margin:"0 0 0.08in 0",paddingBottom:"2pt",borderBottom:"1.5pt solid #333",fontFamily:"'Inter', sans-serif",textAlign:"left"},children:t.title}),e.jsx("div",{style:{color:"#111",fontSize:"10pt",lineHeight:1.45,textAlign:"left",fontFamily:"'Inter', sans-serif"},children:_e(t)})]},g))]})}function _e(i){const d=i.content;switch(i.type){case"summary":return e.jsx("p",{style:{fontSize:"10pt",color:"#222",lineHeight:"1.5",textAlign:"justify",margin:0,padding:0},children:d.map(s=>s.replace(/Summary\s*\|\s*/i,"")).join(" ")});case"experience":{const s=[];let m=0;for(;m<d.length;){const r=d[m].trim();if(!r){m++;continue}if(r.startsWith("-")||r.startsWith("•")||r.startsWith("–"))s.length>0?s[s.length-1].bullets.push(r.replace(/^[-•–]\s*/,"")):s.push({title:"Professional Highlights",company:"",date:"",location:"",bullets:[r.replace(/^[-•–]\s*/,"")]}),m++;else{const t=r.split("|").map(f=>f.trim());let g=t[0],o=t[1]||"",c=t.find(f=>f.match(/\d{4}|Present|Current/i))||"",h=t.length>3?t[t.length-1]:"";if(t.length===1){const f=r.match(/(.*)(\b\d{4}.*|Present.*|Current.*)/i);f&&(g=f[1].trim().replace(/,$/,""),c=f[2].trim())}const p={title:g,company:o,date:c,location:h,bullets:[]};for(m++;m<d.length;){const f=d[m].trim();if(!f){m++;continue}if(!(f.startsWith("-")||f.startsWith("•")||f.startsWith("–"))){const E=f.includes("|")||f.match(/\b\d{4}|Present|Current/i),k=m>0&&(d[m-1].trim().startsWith("-")||d[m-1].trim().startsWith("•"));if(E||k||f.length<60)break}p.bullets.push(f.replace(/^[-•–]\s*/,"")),m++}s.push(p)}}return s.map((r,x)=>e.jsxs("div",{style:{marginBottom:x===s.length-1?0:"0.15in",padding:0},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"2pt",padding:0},children:[e.jsxs("div",{style:{flex:1,padding:0},children:[e.jsx("span",{style:{fontWeight:700,fontSize:"10.5pt",color:"#000"},children:r.title}),r.company&&e.jsxs("span",{style:{fontWeight:600,color:"#333"},children:[" | ",r.company]}),r.location&&e.jsxs("span",{style:{fontWeight:600,color:"#444"},children:[" — ",r.location]})]}),e.jsx("div",{style:{fontWeight:600,fontSize:"9.5pt",color:"#444",textAlign:"right"},children:r.date})]}),r.bullets.length>0&&e.jsx("ul",{style:{margin:"1pt 0 0 0",paddingLeft:"0.15in",listStyleType:"disc"},children:r.bullets.map((t,g)=>e.jsx("li",{style:{marginBottom:"2pt",fontSize:"10pt",color:"#333",lineHeight:"1.4",textAlign:"left"},children:t},g))})]},x))}case"education":return d.map((s,m)=>{const r=s.split("|").map(t=>t.trim());if(r.length>=2)return e.jsxs("div",{style:{marginBottom:"0.1in",display:"flex",justifyContent:"space-between",alignItems:"baseline"},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:700,fontSize:"10.5pt"},children:r[0]}),r[1]&&e.jsx("div",{style:{fontWeight:500,color:"#444"},children:r[1]})]}),e.jsx("div",{style:{fontWeight:600,fontSize:"9.5pt",color:"#444"},children:r[2]||""})]},m);const x=s.replace(/^[-•–]\s*/,"");return e.jsx("div",{style:{marginBottom:"2pt",paddingLeft:s.startsWith("-")?"0.15in":0},children:s.startsWith("-")?`• ${x}`:s},m)});case"skills":return d.map((s,m)=>{const r=s.replace(/^[-•–]\s*/,"").trim(),x=r.indexOf(":");if(x>0){const t=r.substring(0,x),g=r.substring(x+1).trim();return e.jsxs("div",{style:{marginBottom:"4pt",display:"flex",alignItems:"flex-start",padding:0},children:[e.jsxs("span",{style:{fontWeight:700,color:"#000",marginRight:"8pt",minWidth:"1.4in",display:"inline-block"},children:[t,":"]}),e.jsx("span",{style:{color:"#222",flex:1},children:g})]},m)}return e.jsx("div",{style:{marginBottom:"2pt",padding:0},children:r},m)});default:return d.map((s,m)=>e.jsx("div",{style:{marginBottom:"4px",padding:0},children:s.startsWith("-")||s.startsWith("•")?e.jsxs("div",{style:{display:"flex",gap:"8px"},children:[e.jsx("span",{children:"•"}),e.jsx("span",{children:s.replace(/^[-•]\s*/,"")})]}):s},m))}}function Se({document:i,variant:d="preview",contactInfo:s}){const m=b.useRef(null),r=()=>{const o=m.current;if(!o)return;const c=window.open("","_blank");if(!c){S.error("Please allow popups to print/download cover letter");return}const h=`
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@400;500;600&display=swap');
                
                * { 
                    margin: 0; 
                    padding: 0; 
                    box-sizing: border-box; 
                }
                
                body { 
                    font-family: 'Crimson Pro', Georgia, 'Times New Roman', serif;
                    font-size: 11.5pt;
                    line-height: 1.5; 
                    color: #000;
                    background: #fff;
                    -webkit-print-color-adjust: exact;
                }
                
                .cover-letter-container {
                    width: 8.5in;
                    min-height: 11in;
                    margin: 0 auto;
                    padding: 0.5in 0.8in;
                    background: #fff;
                }
                
                .sender-info {
                    margin-bottom: 0.3in;
                    font-family: 'Inter', sans-serif;
                }
                
                .sender-name {
                    font-size: 14pt;
                    font-weight: 600;
                    margin-bottom: 2pt;
                }
                
                .sender-line {
                    font-size: 9pt;
                    color: #333;
                }
                
                .date-line {
                    margin: 0.2in 0;
                    font-size: 11pt;
                }
                
                .recipient-info {
                    margin-bottom: 0.25in;
                    font-size: 11pt;
                }
                
                .salutation {
                    margin-bottom: 0.15in;
                    font-weight: 500;
                }
                
                .letter-body {
                    text-align: justify;
                }
                
                .letter-paragraph {
                    margin-bottom: 0.12in;
                    text-indent: 0;
                }
                
                .closing-block {
                    margin-top: 0.3in;
                }
                
                .signature {
                    font-weight: 600;
                    margin-top: 5pt;
                }
                
                @media print {
                    @page {
                        size: letter;
                        margin: 0;
                    }
                    body { 
                        width: 8.5in;
                        height: 11in;
                        padding: 0;
                        margin: 0;
                    }
                    .no-print { display: none !important; }
                }
            </style>
        `,p=(s==null?void 0:s.full_name)||i.content.split(`
`)[0]||"Your Name";c.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Cover Letter - ${p}</title>
                    ${h}
                </head>
                <body>
                    <div class="cover-letter-container">
                        ${o.innerHTML}
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                        }
                    <\/script>
                </body>
            </html>
        `),c.document.close()},x=d==="print",g=(()=>{const c=i.content.replace(/\*\*/g,"").split(`
`),h=[];let p="";const f=[];let N="";const E=[];let k="",j="",w="sender";for(let v=0;v<c.length;v++){const u=c[v].trim();if(!u){w==="sender"&&h.length>0?w="date":w==="date"&&p?w="recipient":w==="recipient"&&f.length>0&&(w="salutation");continue}if(u.match(/^(Dear|Hello|Hi|To|Attention|Hiring Manager)/i)){N=u,w="body";continue}if(u.match(/^(Sincerely|Best regards|Kind regards|Regards|Thank you|Yours truly|Yours sincerely|Cordially|Respectfully|Warm regards|With best regards)/i)){k=u,w="signature";continue}if((w==="sender"||w==="date")&&u.match(/^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})$/i)){p=u,w="recipient";continue}switch(w){case"sender":h.push(u);break;case"date":p?(p=u,w="recipient"):p=u;break;case"recipient":f.push(u);break;case"body":E.push(u);break;case"signature":j?j+=" "+u:j=u;break}}return{sender:h,date:p,recipient:f,salutation:N,body:E,closing:k,signature:j}})();return x?e.jsxs("div",{className:"hidden",children:[e.jsx("div",{ref:m,className:"cover-letter-container",children:e.jsx(Q,{letterData:g,contactInfo:s})}),e.jsxs(_,{onClick:r,className:"fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white shadow-xl z-50 no-print",children:[e.jsx(T,{className:"w-4 h-4 mr-2"}),"Download PDF"]})]}):e.jsxs("div",{className:"w-full max-w-full space-y-4",children:[e.jsx("div",{className:"flex justify-end gap-2",children:e.jsxs(_,{onClick:r,className:"bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 shadow-lg",size:"sm",children:[e.jsx(T,{className:"w-4 h-4 mr-2"}),"Download PDF"]})}),e.jsx("div",{className:"bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden",children:e.jsx("div",{ref:m,style:{maxWidth:"8.5in",width:"100%",minHeight:"auto",padding:"clamp(1rem, 4vw, 0.75in) clamp(1rem, 5vw, 1in)",fontFamily:"'Crimson Pro', Georgia, 'Times New Roman', serif",fontSize:"clamp(10pt, 1.5vw, 11.5pt)",lineHeight:1.6,color:"#1a1a1a",backgroundColor:"#fff",margin:"0 auto"},children:e.jsx(Q,{letterData:g,contactInfo:s})})})]})}const C={senderInfo:{marginBottom:"0.25in",textAlign:"left"},senderName:{fontSize:"clamp(12pt, 2.5vw, 15pt)",fontWeight:600,color:"#1e293b",marginBottom:"0.05in",letterSpacing:"0.3pt"},senderLine:{fontSize:"clamp(10pt, 1.4vw, 11pt)",color:"#374151",lineHeight:1.4,marginBottom:"0.02in"},date:{fontSize:"clamp(10pt, 1.5vw, 12pt)",color:"#1e293b",margin:"0.25in 0"},recipientInfo:{marginBottom:"0.25in",fontSize:"clamp(10pt, 1.5vw, 12pt)",color:"#1e293b",lineHeight:1.4},recipientLine:{marginBottom:"0.02in"},salutation:{fontSize:"clamp(11pt, 1.5vw, 12pt)",color:"#1e293b",marginBottom:"0.2in",fontWeight:500},body:{fontSize:"clamp(11pt, 1.5vw, 12.5pt)",lineHeight:1.6,color:"#1e293b",textAlign:"left"},paragraph:{marginBottom:"0.15in",textAlign:"left"},closingBlock:{marginTop:"0.3in"},closing:{fontSize:"clamp(10.5pt, 1.4vw, 12pt)",color:"#1e293b",marginBottom:"0.4in"},signature:{fontSize:"clamp(10.5pt, 1.4vw, 12pt)",color:"#1e293b",fontWeight:600,marginTop:"0.1in"}};function Q({letterData:i,contactInfo:d}){const s=d||{},m=Object.values(s).some(o=>o&&o.trim());let r=[];m?(s.full_name&&r.push(s.full_name),s.location&&r.push(s.location),s.phone&&r.push(s.phone),s.email&&r.push(s.email),s.linkedin_url&&r.push(s.linkedin_url),s.portfolio_url&&r.push(s.portfolio_url)):r=i.sender;const x=[];let t="";for(const o of i.body)o.trim()===""?t.trim()&&(x.push(t.trim()),t=""):(t&&(t+=" "),t+=o);if(t.trim()&&x.push(t.trim()),!(r.length>0||i.salutation||x.length>0)&&i.sender.concat(i.body).length===0){const c=(d==null?void 0:d.__rawContent)||"";return c?e.jsx("div",{style:C.body,children:e.jsx("p",{style:C.paragraph,children:c})}):e.jsx("div",{style:{textAlign:"center",padding:"2rem",color:"#9ca3af"},children:e.jsx("p",{children:"No content available for this cover letter."})})}return e.jsxs(e.Fragment,{children:[r.length>0&&e.jsx("div",{style:C.senderInfo,children:r.map((o,c)=>c===0?e.jsx("div",{style:C.senderName,children:o.split("|").map((h,p)=>e.jsxs("span",{children:[p>0&&e.jsx("span",{style:{color:"#9ca3af",margin:"0 0.1in"},children:"|"}),h.trim()]},p))},c):e.jsx("div",{style:C.senderLine,children:o.split("|").map((h,p)=>e.jsxs("span",{children:[p>0&&e.jsx("span",{style:{color:"#9ca3af",margin:"0 0.1in"},children:"|"}),h.trim()]},p))},c))}),i.date&&e.jsx("div",{style:C.date,children:i.date}),i.recipient.length>0&&e.jsx("div",{style:C.recipientInfo,children:i.recipient.map((o,c)=>e.jsx("div",{style:C.recipientLine,children:o},c))}),i.salutation&&e.jsxs("div",{style:C.salutation,children:[i.salutation,","]}),x.length>0&&e.jsx("div",{style:C.body,children:x.map((o,c)=>e.jsx("p",{style:{...C.paragraph,textIndent:c>0?"0.3in":"0"},children:o},c))}),(i.closing||i.signature||m&&s.full_name)&&e.jsxs("div",{style:C.closingBlock,children:[i.closing&&e.jsxs("div",{style:C.closing,children:[i.closing,","]}),(i.signature||m&&s.full_name)&&e.jsx("div",{style:C.signature,children:i.signature||s.full_name})]})]})}const Ee=({document:i,isOpen:d,onClose:s,jobTitle:m,companyName:r,jobId:x,onUpdate:t})=>{const g=Z(),[o,c]=b.useState(!1),[h,p]=b.useState(""),[f,N]=b.useState(!1);b.useEffect(()=>{i&&p(i.content)},[i,d]),b.useEffect(()=>{d||c(!1)},[d]),b.useEffect(()=>(d?document.body.style.overflow="hidden":document.body.style.overflow="unset",()=>{document.body.style.overflow="unset"}),[d]),b.useEffect(()=>{const v=u=>{u.key==="Escape"&&(o?c(!1):s())};return window.addEventListener("keydown",v),()=>window.removeEventListener("keydown",v)},[s,o]);const E=b.useCallback(()=>{if(!i)return;const v=new Blob([i.content],{type:"text/plain"}),u=URL.createObjectURL(v),l=window.document.createElement("a");l.href=u;const z=`${i.document_type}_${m.replace(/\s+/g,"_")}_${r.replace(/\s+/g,"_")}.txt`;l.download=z,l.click(),URL.revokeObjectURL(u),S.success("Document downloaded")},[i,m,r]),k=b.useCallback(()=>{i&&(navigator.clipboard.writeText(i.content),S.success("Content copied to clipboard"))},[i]),j=async()=>{if(t){N(!0);try{await t(h),c(!1),S.success("Document updated")}catch(v){console.error("Error saving document:",v),S.error("Failed to save changes")}finally{N(!1)}}},w=b.useCallback(()=>{s(),g("/generate",{state:{jobId:x}})},[s,g,x]);return!d||!i?null:e.jsxs("div",{className:"fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200",role:"dialog","aria-modal":"true","aria-labelledby":"modal-title",children:[e.jsx("div",{className:"absolute inset-0",onClick:o?()=>c(!1):s}),e.jsxs("div",{className:"relative bg-[#0A0A0A] border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-5xl h-[92dvh] sm:h-auto sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden m-0 sm:m-4 animate-in slide-in-from-bottom duration-300",children:[e.jsxs("div",{className:"flex items-center justify-between px-5 py-3 sm:px-8 sm:py-6 border-b border-white/5 flex-shrink-0",children:[e.jsxs("div",{className:"min-w-0 flex-1 pr-4",children:[e.jsxs("h3",{id:"modal-title",className:"text-lg sm:text-xl font-semibold text-white truncate capitalize tracking-tight flex items-center gap-2",children:[o&&e.jsx(V,{className:"w-4 h-4 text-purple-400"}),o?`Editing ${i.document_type}`:i.document_type.replace("_"," ")]}),!o&&i.ats_score&&e.jsxs("div",{className:"flex items-center gap-2 mt-0.5",children:[e.jsx("div",{className:`h-1.5 w-1.5 rounded-full ${i.ats_score>=80?"bg-green-400":"bg-yellow-400"}`}),e.jsxs("span",{className:"text-[10px] font-medium text-white/40 uppercase tracking-widest",children:[i.ats_score,"% ATS Optimized"]})]}),o&&e.jsx("span",{className:"text-[10px] font-medium text-white/30 uppercase tracking-widest mt-0.5 block",children:"Markdown supported"})]}),e.jsx("button",{onClick:o?()=>c(!1):s,className:"h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all active:scale-90","aria-label":"Close modal",children:e.jsx(O,{className:"w-5 h-5 sm:w-6 sm:h-6"})})]}),e.jsx("div",{className:"p-2 sm:p-4 border-b border-white/5 bg-black/40 backdrop-blur-xl flex-shrink-0",children:e.jsx("div",{className:"grid grid-cols-4 gap-2 sm:gap-4 max-w-4xl mx-auto",children:o?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"hidden sm:block"})," ",e.jsxs("button",{onClick:()=>c(!1),className:"col-span-2 sm:col-span-1 flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-[10px] sm:text-sm active:scale-95",children:[e.jsx(O,{className:"w-4 h-4"}),e.jsx("span",{children:"Cancel"})]}),e.jsxs("button",{onClick:j,disabled:f,className:"col-span-2 sm:col-span-1 flex flex-col items-center justify-center gap-1 p-2 sm:py-3.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-all font-semibold text-[10px] sm:text-sm active:scale-95 group shadow-lg disabled:opacity-50",children:[f?e.jsx("div",{className:"w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"}):e.jsx(ee,{className:"w-4 h-4"}),e.jsx("span",{children:f?"Saving...":"Save Changes"})]}),e.jsx("div",{className:"hidden sm:block"})," "]}):e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:E,className:"flex flex-col items-center justify-center gap-1 p-2 sm:py-3.5 rounded-xl bg-white text-black hover:bg-white/90 transition-all font-semibold text-[10px] sm:text-sm active:scale-95 group shadow-lg shadow-white/5",children:[e.jsx(T,{className:"w-4 h-4"}),e.jsx("span",{className:"truncate w-full text-center px-1",children:"Download"})]}),e.jsxs("button",{onClick:k,className:"flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all text-[10px] sm:text-sm active:scale-95",children:[e.jsx(W,{className:"w-4 h-4"}),e.jsx("span",{className:"truncate w-full text-center px-1",children:"Copy"})]}),e.jsxs("button",{onClick:()=>c(!0),className:"flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all text-[10px] sm:text-sm active:scale-95",children:[e.jsx(V,{className:"w-4 h-4"}),e.jsx("span",{className:"truncate w-full text-center px-1",children:"Edit"})]}),e.jsxs("button",{onClick:w,className:"flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-[10px] sm:text-sm active:scale-95",children:[e.jsx(ke,{className:"w-4 h-4"}),e.jsx("span",{className:"truncate w-full text-center px-1",children:"Remix"})]})]})})}),e.jsx("div",{className:"flex-1 overflow-y-auto overflow-x-hidden bg-[#0A0A0A] relative scrollbar-thin scrollbar-thumb-white/10",children:e.jsx("div",{className:"min-h-full w-full max-w-4xl mx-auto flex flex-col",children:o?e.jsx("div",{className:"flex-1 p-4 sm:p-8 flex flex-col",children:e.jsx("textarea",{value:h,onChange:v=>p(v.target.value),className:"flex-1 w-full min-h-[50vh] bg-zinc-900/50 border border-white/10 rounded-2xl p-4 sm:p-6 text-white font-mono text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none leading-relaxed transition-all",placeholder:"Edit your document here...",spellCheck:!1})}):e.jsx("div",{className:"p-4 sm:p-8",style:{wordBreak:"break-word",overflowWrap:"anywhere"},children:i.document_type==="resume"?e.jsx(Ce,{document:i,variant:"preview"}):e.jsx(Se,{document:i,variant:"preview"})})})})]})]})};function Ke(){const{id:i}=ae(),d=Z(),{savedJobs:s,updateJob:m,removeSavedJob:r}=le(),{primaryResume:x}=oe(),[t,g]=b.useState(null),[o,c]=b.useState(!0),[h,p]=b.useState(!1),[f,N]=b.useState(!1),[E,k]=b.useState([]),[j,w]=b.useState(null),[v,u]=b.useState(null),[l,z]=b.useState({contact_name:"",contact_email:"",recruiter_phone:"",recruiter_linkedin:"",company_url:"",notes:""}),L=b.useMemo(()=>{if(!t||!x||!x.extracted_skills)return null;const n=t.skills_required.map(R=>R.toLowerCase()),a=x.extracted_skills.map(R=>R.toLowerCase());if(n.length===0)return{score:0,matched:[],missing:[]};const y=t.skills_required.filter(R=>a.includes(R.toLowerCase())),A=t.skills_required.filter(R=>!a.includes(R.toLowerCase()));return{score:Math.round(y.length/n.length*100),matched:y,missing:A}},[t,x]);b.useEffect(()=>{if(!i)return;const n=s.find(a=>a.id===i);n?(g(n),z({contact_name:n.contact_name||"",contact_email:n.contact_email||"",recruiter_phone:n.recruiter_phone||"",recruiter_linkedin:n.recruiter_linkedin||"",company_url:n.company_url||"",notes:n.notes||""}),c(!1),D(i)):(te(i),D(i))},[i,s]);const D=async n=>{try{const{data:a,error:y}=await I.from("generated_documents").select("*").eq("job_id",n).order("created_at",{ascending:!1});if(y)throw y;k(a||[])}catch(a){console.error("Error fetching documents:",a)}},te=async n=>{try{const{data:a,error:y}=await I.from("saved_jobs").select("*").eq("id",n).single();if(y)throw y;a&&(g(a),z({contact_name:a.contact_name||"",contact_email:a.contact_email||"",recruiter_phone:a.recruiter_phone||"",recruiter_linkedin:a.recruiter_linkedin||"",company_url:a.company_url||"",notes:a.notes||""}))}catch(a){console.error("Error fetching job:",a),S.error(ce.error.noJobsFound),d("/jobs")}finally{c(!1)}},se=async()=>{if(!t)return;N(!0);const n={contact_name:l.contact_name||null,contact_email:l.contact_email||null,recruiter_phone:l.recruiter_phone||null,recruiter_linkedin:l.recruiter_linkedin||null,company_url:l.company_url||null,notes:l.notes||null,updated_at:new Date().toISOString()};try{const{error:a}=await I.from("saved_jobs").update(n).eq("id",t.id);if(a)throw a;const y={...t,...n};m(y),g(y),p(!1),S.success("Job details updated")}catch(a){console.error("Error updating job:",a),S.error("Failed to update job")}finally{N(!1)}},ne=async n=>{if(window.confirm("Are you sure you want to delete this document?")){u(n);try{const{error:a}=await I.from("generated_documents").delete().eq("id",n);if(a)throw a;k(y=>y.filter(A=>A.id!==n)),S.success("Document deleted")}catch(a){console.error("Error deleting document:",a),S.error("Failed to delete document")}finally{u(null)}}},ie=async()=>{if(!(!t||!window.confirm("Are you sure you want to delete this job? This will also permanently remove all tailored resumes and cover letters associated with it."))){N(!0);try{await I.from("generated_documents").delete().eq("job_id",t.id);const{error:a}=await I.from("saved_jobs").delete().eq("id",t.id);if(a)throw a;r(t.id),S.success("Job and documents deleted successfully"),d("/jobs")}catch(a){console.error("Error deleting job:",a),S.error("Failed to delete job")}finally{N(!1)}}},re=async n=>{if(j)try{const{error:a}=await I.from("generated_documents").update({content:n}).eq("id",j.id);if(a)throw a;const y={...j,content:n};k(A=>A.map(B=>B.id===j.id?y:B)),w(y)}catch(a){throw console.error("Error updating documentContent:",a),a}};return o?e.jsx("div",{className:"min-h-[60vh] flex items-center justify-center text-white/40",children:"Loading job details..."}):t?e.jsxs("div",{className:"animate-fade-in font-['General_Sans',_sans-serif] max-w-5xl mx-auto px-3 md:px-4 lg:px-0 pb-12 md:pb-16",children:[e.jsxs("div",{className:"flex items-center justify-between mb-4 md:mb-6",children:[e.jsxs(_,{variant:"ghost",onClick:()=>d(-1),className:"text-white/60 hover:text-white h-9 md:h-10 px-3",children:[e.jsx(de,{className:"w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2"}),e.jsx("span",{className:"hidden sm:inline",children:"Back"})]}),e.jsx("div",{className:"flex gap-2",children:h?e.jsxs("div",{className:"flex gap-2",children:[e.jsx(_,{variant:"ghost",onClick:()=>p(!1),className:"text-white/60 h-9 md:h-10 px-3 text-xs md:text-sm",children:"Cancel"}),e.jsxs(_,{onClick:se,isLoading:f,className:"bg-white text-black hover:bg-white/90 h-9 md:h-10 px-4 text-xs md:text-sm",children:[e.jsx(ee,{className:"w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2"}),e.jsx("span",{className:"hidden sm:inline",children:"Save"}),e.jsx("span",{className:"sm:hidden",children:"Save"})]})]}):e.jsxs(e.Fragment,{children:[e.jsxs(_,{variant:"secondary",onClick:()=>p(!0),className:"bg-white/5 border border-white/10 text-white h-9 md:h-10 px-3 text-xs md:text-sm",children:[e.jsx(H,{className:"w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2"}),e.jsx("span",{className:"hidden sm:inline",children:"Edit"}),e.jsx("span",{className:"sm:hidden",children:"Edit"})]}),e.jsx(_,{variant:"secondary",onClick:ie,className:"bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 h-9 md:h-10 px-3 text-xs md:text-sm",children:e.jsx(J,{className:"w-3.5 h-3.5 md:w-4 md:h-4"})})]})})]}),e.jsxs("div",{className:"grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6",children:[e.jsxs("div",{className:"md:col-span-2 space-y-4 md:space-y-6",children:[e.jsxs(M,{className:"border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-xl",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 mb-4",children:[e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("h1",{className:"text-xl md:text-2xl font-semibold text-white mb-2 leading-tight break-words",children:t.title}),e.jsxs("div",{className:"flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-white/60",children:[e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx(me,{className:"w-3.5 h-3.5 md:w-4 md:h-4 text-white/40 flex-shrink-0"}),e.jsx("span",{className:"text-white truncate",children:t.company})]}),e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx(he,{className:"w-3.5 h-3.5 md:w-4 md:h-4 text-white/40 flex-shrink-0"}),e.jsx("span",{className:"truncate",children:t.location})]}),t.posted_at&&e.jsxs("div",{className:"flex items-center gap-1.5",children:[e.jsx(pe,{className:"w-3.5 h-3.5 md:w-4 md:h-4 text-white/40 flex-shrink-0"}),e.jsxs("span",{className:"whitespace-nowrap",children:["Posted ",new Date(t.posted_at).toLocaleDateString()]})]})]})]}),e.jsxs("div",{className:"flex flex-col items-end gap-2 flex-shrink-0",children:[e.jsx("span",{className:`
                                    px-2.5 py-1 md:px-3 md:py-1 rounded-full text-xs font-medium border whitespace-nowrap
                                    ${t.status==="applied"?"bg-purple-500/10 text-purple-300 border-purple-500/20":t.status==="interviewing"?"bg-yellow-500/10 text-yellow-300 border-yellow-500/20":t.status==="offer"?"bg-green-500/10 text-green-300 border-green-500/20":t.status==="rejected"?"bg-red-500/10 text-red-300 border-red-500/20":"bg-blue-500/10 text-blue-300 border-blue-500/20"}
                                `,children:t.status.charAt(0).toUpperCase()+t.status.slice(1)}),L&&e.jsxs("div",{className:`
                                        px-2.5 py-1 md:px-3 md:py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border whitespace-nowrap
                                        ${L.score>=80?"bg-green-500/10 text-green-300 border-green-500/20":L.score>=60?"bg-blue-500/10 text-blue-300 border-blue-500/20":"bg-white/5 text-white/40 border-white/10"}
                                    `,children:[L.score>=85&&e.jsx(xe,{className:"w-3 h-3"}),L.score,"% Match"]})]})]}),e.jsxs("div",{className:"flex flex-wrap gap-2 mb-4 md:mb-6",children:[(t.salary_min||t.salary_max||t.salary_range)&&e.jsxs("div",{className:"inline-flex items-center px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs md:text-sm",children:[e.jsx(ue,{className:"w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 text-green-400 flex-shrink-0"}),e.jsx("span",{className:"text-white truncate max-w-[150px] md:max-w-none",children:t.salary_range||(t.salary_min&&t.salary_max?`$${(t.salary_min/1e3).toFixed(0)}k - $${(t.salary_max/1e3).toFixed(0)}k`:`$${((t.salary_min||0)/1e3).toFixed(0)}k+`)})]}),t.job_type&&e.jsx("div",{className:"inline-flex items-center px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs md:text-sm text-white capitalize",children:t.job_type.replace("-"," ")}),t.remote!==void 0&&e.jsx("div",{className:"inline-flex items-center px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs md:text-sm text-white",children:t.remote?"Remote":"On-site"})]}),e.jsxs("div",{className:"flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 md:pt-6 border-t border-white/5",children:[e.jsxs(_,{onClick:()=>window.open(t.job_url,"_blank"),className:"bg-white text-black hover:bg-white/90 h-10 sm:h-9 text-xs md:text-sm w-full sm:w-auto",children:[e.jsx(fe,{className:"w-3.5 h-3.5 md:w-4 md:h-4 mr-2"}),"Apply Now"]}),(l.company_url||t.company)&&e.jsxs(_,{variant:"secondary",onClick:()=>{const n=l.company_url||`https://www.google.com/search?q=${encodeURIComponent(t.company)}`;window.open(n,"_blank")},className:"bg-white/5 text-white border-white/10 hover:bg-white/10 h-10 sm:h-9 text-xs md:text-sm w-full sm:w-auto",children:[e.jsx(U,{className:"w-3.5 h-3.5 md:w-4 md:h-4 mr-2"}),l.company_url?"Company Website":"Search Company"]})]})]}),e.jsxs(M,{className:"border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-xl",children:[e.jsxs("h3",{className:"text-base md:text-lg font-medium text-white mb-3 md:mb-4 flex items-center gap-2",children:[e.jsx(ye,{className:"w-4 h-4 md:w-5 md:h-5 text-white/50"}),"Description"]}),e.jsx("div",{className:"prose prose-invert prose-xs md:prose-sm max-w-none text-white/70",children:e.jsx(ge,{children:t.description})}),t.requirements.length>0&&e.jsxs("div",{className:"mt-4 md:mt-6 pt-4 md:pt-6 border-t border-white/5",children:[e.jsx("h4",{className:"font-medium text-white mb-2 md:mb-3 text-sm md:text-base",children:"Requirements"}),e.jsx("ul",{className:"list-disc list-inside space-y-1 text-xs md:text-sm text-white/70",children:t.requirements.map((n,a)=>e.jsx("li",{className:"break-words",children:n},a))})]})]}),e.jsxs(M,{className:"border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-xl",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-3 md:mb-4",children:[e.jsxs("h3",{className:"text-base md:text-lg font-medium text-white flex items-center gap-2",children:[e.jsx(W,{className:"w-4 h-4 md:w-5 md:h-5 text-white/50"}),"Tailored Documents"]}),e.jsx(_,{variant:"secondary",size:"sm",onClick:()=>d("/generate",{state:{jobId:t.id}}),className:"bg-white/10 text-white border-white/10 hover:bg-white/20 h-8 md:h-9 px-3 text-xs w-full sm:w-auto",children:"+ Generate New"})]}),E.length>0?e.jsx("div",{className:"grid gap-3 md:gap-4",children:E.map(n=>e.jsxs("div",{className:"flex items-center justify-between p-3 md:p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group",children:[e.jsxs("div",{className:"flex items-center gap-2 md:gap-3 min-w-0 flex-1",children:[e.jsx("div",{className:`p-1.5 md:p-2 rounded-lg flex-shrink-0 ${n.document_type==="resume"?"bg-blue-500/10 text-blue-400":"bg-purple-500/10 text-purple-400"}`,children:e.jsx(W,{className:"w-4 h-4 md:w-5 md:h-5"})}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("h4",{className:"font-medium text-white text-sm md:text-base truncate capitalize",children:n.document_type.replace("_"," ")}),e.jsxs("div",{className:"flex items-center gap-1.5 md:gap-2 text-xs text-white/40",children:[e.jsx("span",{className:"whitespace-nowrap",children:new Date(n.created_at).toLocaleDateString()}),n.ats_score&&e.jsxs(e.Fragment,{children:[e.jsx("span",{children:"•"}),e.jsxs("span",{className:"text-green-400/80 whitespace-nowrap",children:[n.ats_score,"% ATS"]})]})]})]})]}),e.jsxs("div",{className:"flex items-center gap-1.5 md:gap-2 flex-shrink-0",children:[e.jsx("button",{onClick:()=>w(n),className:"h-8 w-8 md:h-9 md:w-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/10",title:"View Document",children:e.jsx(we,{className:"w-4 h-4 md:w-5 md:h-5"})}),e.jsx("button",{onClick:()=>ne(n.id),disabled:!!v,className:"h-8 w-8 md:h-9 md:w-9 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20 disabled:opacity-50",title:"Delete Document",children:v===n.id?e.jsx("div",{className:"w-3.5 h-3.5 md:w-4 md:h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"}):e.jsx(J,{className:"w-4 h-4 md:w-5 md:h-5"})})]})]},n.id))}):e.jsxs("div",{className:"text-center py-6 md:py-8 bg-white/5 rounded-xl border border-dashed border-white/10",children:[e.jsx("p",{className:"text-white/30 text-xs md:text-sm px-4",children:"No tailored documents yet."}),e.jsx(_,{variant:"secondary",size:"sm",onClick:()=>d("/generate",{state:{jobId:t.id}}),className:"mt-3 md:mt-4 bg-white/10 text-white border-white/10 hover:bg-white/20 h-9 md:h-10 px-4 text-xs w-full sm:w-auto",children:"Generate your first resume or cover letter"})]})]})]}),e.jsxs("div",{className:"space-y-4 md:space-y-6",children:[e.jsxs(M,{className:"border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-xl",children:[e.jsxs("h3",{className:"text-base md:text-lg font-medium text-white mb-3 md:mb-4 flex items-center gap-2",children:[e.jsx($,{className:"w-4 h-4 md:w-5 md:h-5 text-white/50"}),"Recruiter & Contact"]}),h?e.jsxs("div",{className:"space-y-3 md:space-y-4",children:[e.jsx(P,{label:"Contact Name",icon:e.jsx($,{className:"w-3.5 h-3.5 md:w-4 md:h-4"}),value:l.contact_name,onChange:n=>z({...l,contact_name:n.target.value}),placeholder:"e.g. Sarah Smith"}),e.jsx(P,{label:"Email",icon:e.jsx(q,{className:"w-3.5 h-3.5 md:w-4 md:h-4"}),value:l.contact_email,onChange:n=>z({...l,contact_email:n.target.value}),placeholder:"sarah@company.com"}),e.jsx(P,{label:"Phone",icon:e.jsx(Y,{className:"w-3.5 h-3.5 md:w-4 md:h-4"}),value:l.recruiter_phone,onChange:n=>z({...l,recruiter_phone:n.target.value}),placeholder:"+1 (555) 000-0000"}),e.jsx(P,{label:"LinkedIn URL",icon:e.jsx(G,{className:"w-3.5 h-3.5 md:w-4 md:h-4"}),value:l.recruiter_linkedin,onChange:n=>z({...l,recruiter_linkedin:n.target.value}),placeholder:"linkedin.com/in/sarahsmith"}),e.jsx(P,{label:"Company Website",icon:e.jsx(U,{className:"w-3.5 h-3.5 md:w-4 md:h-4"}),value:l.company_url,onChange:n=>z({...l,company_url:n.target.value}),placeholder:"https://company.com"})]}):e.jsx("div",{className:"space-y-3 md:space-y-4",children:l.contact_name||l.contact_email||l.recruiter_phone||l.recruiter_linkedin?e.jsxs(e.Fragment,{children:[l.contact_name&&e.jsxs("div",{className:"flex items-center gap-2 md:gap-3 text-white",children:[e.jsx("div",{className:"w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0",children:e.jsx("span",{className:"text-xs font-bold",children:l.contact_name.charAt(0)})}),e.jsx("span",{className:"font-medium text-sm md:text-base truncate",children:l.contact_name})]}),l.contact_email&&e.jsxs("a",{href:`mailto:${l.contact_email}`,className:"flex items-center gap-2 md:gap-3 text-white/60 hover:text-white transition-colors",children:[e.jsx(q,{className:"w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0"}),e.jsx("span",{className:"text-xs md:text-sm truncate",children:l.contact_email})]}),l.recruiter_phone&&e.jsxs("a",{href:`tel:${l.recruiter_phone}`,className:"flex items-center gap-2 md:gap-3 text-white/60 hover:text-white transition-colors",children:[e.jsx(Y,{className:"w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0"}),e.jsx("span",{className:"text-xs md:text-sm truncate",children:l.recruiter_phone})]}),l.recruiter_linkedin&&e.jsxs("a",{href:l.recruiter_linkedin,target:"_blank",rel:"noopener noreferrer",className:"flex items-center gap-2 md:gap-3 text-blue-300 hover:text-blue-200 transition-colors",children:[e.jsx(G,{className:"w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0"}),e.jsx("span",{className:"text-xs md:text-sm",children:"View Profile"})]})]}):e.jsxs("div",{className:"text-center py-4 md:py-6 text-white/30 text-xs md:text-sm",children:[e.jsx("p",{children:"No contact info added yet."}),e.jsx(_,{variant:"ghost",size:"sm",onClick:()=>p(!0),className:"mt-2 text-white/50 hover:text-white h-8 md:h-9 text-xs",children:"+ Add Info"})]})})]}),e.jsxs(M,{className:"border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-xl",children:[e.jsxs("h3",{className:"text-base md:text-lg font-medium text-white mb-3 md:mb-4 flex items-center gap-2",children:[e.jsx(H,{className:"w-4 h-4 md:w-5 md:h-5 text-white/50"}),"My Notes"]}),h?e.jsx("textarea",{value:l.notes,onChange:n=>z({...l,notes:n.target.value}),className:"w-full h-24 md:h-32 bg-black/20 border border-white/10 rounded-xl p-3 md:p-4 text-xs md:text-sm text-white focus:outline-none focus:border-white/30 resize-none",placeholder:"Add your notes specific to this application..."}):e.jsx("div",{className:"text-xs md:text-sm text-white/70 whitespace-pre-wrap break-words",children:l.notes||e.jsx("span",{className:"text-white/30 italic",children:"No notes added."})})]}),e.jsxs(M,{className:"border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur-xl",children:[e.jsxs("h3",{className:"text-base md:text-lg font-medium text-white mb-3 md:mb-4 flex items-center gap-2",children:[e.jsx(K,{className:"w-4 h-4 md:w-5 md:h-5 text-white/50"}),"Skills Match"]}),e.jsx("div",{className:"flex flex-wrap gap-1.5 md:gap-2",children:t.skills_required.map((n,a)=>{const y=L==null?void 0:L.matched.includes(n);return e.jsxs("span",{className:`
                                            px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg text-xs md:text-sm border break-words
                                            ${y?"bg-green-500/10 text-green-300 border-green-500/20":"bg-white/5 border-white/5 text-white/40"}
                                        `,children:[n,y&&e.jsx(K,{className:"w-2.5 h-2.5 md:w-3 md:h-3 inline-block ml-1"})]},a)})}),L&&L.missing.length>0&&e.jsxs("div",{className:"mt-3 md:mt-4 pt-3 md:pt-4 border-t border-white/5",children:[e.jsxs("h4",{className:"text-xs md:text-sm font-medium text-white/60 mb-2 flex items-center gap-1.5 md:gap-2",children:[e.jsx(be,{className:"w-3 h-3 md:w-4 md:h-4 text-yellow-500/50"}),"Missing Skills"]}),e.jsx("div",{className:"flex flex-wrap gap-1.5 md:gap-2",children:L.missing.map((n,a)=>e.jsx("span",{className:"px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg bg-red-500/5 border border-red-500/10 text-red-300/60 text-xs md:text-sm break-words",children:n},a))})]})]})]})]}),e.jsx(Ee,{isOpen:!!j,document:j,onClose:()=>w(null),jobTitle:t.title,companyName:t.company,jobId:t.id,onUpdate:re})]}):null}export{Ke as default};
