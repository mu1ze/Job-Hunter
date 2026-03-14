import{c as S,s as b,r as x,j as e,d as de,u as me,e as xe,S as Y,F as he}from"./index-DF6nk6BY.js";import{B as P}from"./Input-ChnXVsb_.js";import{C as j}from"./Card-CJnrRAx6.js";import{u as pe}from"./career-9LLvmi5F.js";import{s as _}from"./toast-CKZar2jD.js";import{D as X}from"./download-DmBPRdjD.js";import{M as fe}from"./mail-DM50FH2n.js";import{P as be,L as ge}from"./phone-C0yBpCgm.js";import{M as ue}from"./map-pin-Bam80gEI.js";import{E as we}from"./eye-I795v291.js";import{U as je}from"./upload-D9v9Pr3Y.js";import{C as ye}from"./circle-alert-BwMxpe1k.js";import{T as Ne}from"./trash-2-SSJgtfzf.js";import{B as ve}from"./briefcase-38OOj0n0.js";/**
 * @license lucide-react v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ke=[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]],_e=S("CircleCheck",ke);/**
 * @license lucide-react v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Pe=[["polyline",{points:"16 18 22 12 16 6",key:"z7tu5w"}],["polyline",{points:"8 6 2 12 8 18",key:"1eg1df"}]],Ce=S("Code",Pe);/**
 * @license lucide-react v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Se=[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M12 12v6",key:"3ahymv"}],["path",{d:"m15 15-3-3-3 3",key:"15xj92"}]],ze=S("FileUp",Se);/**
 * @license lucide-react v0.474.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Re=[["path",{d:"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",key:"j76jl0"}],["path",{d:"M22 10v6",key:"1lu8f3"}],["path",{d:"M6 12.5V16a6 3 0 0 0 12 0v-3.5",key:"1r8lef"}]],De=S("GraduationCap",Re),Ee={async analyzeResume(a,d){try{const{data:r,error:h}=await b.functions.invoke("analyze-resume",{body:{resumeText:a,currentRole:d}});if(h)throw h;if(r.error)throw new Error(r.error);return r}catch(r){throw console.error("Resume Analysis failed:",r),r}}};function Te({resume:a,variant:d="preview"}){const r=x.useRef(null),h=c=>{if(!c)return"";const s=new Date(c);return isNaN(s.getTime())?c:s.toLocaleDateString("en-US",{month:"short",year:"numeric"})},g=()=>{const c=r.current;if(!c)return;const s=window.open("","_blank");if(!s){_.error("Please allow popups to print/download resume");return}const N=(typeof a.summary=="string"?a.summary:"").split(" ").slice(0,3).join(" ")||"Resume";s.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${N} - ${a.original_filename}</title>
                    
            <style>
                @import url('https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap');
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'General Sans', system-ui, sans-serif; 
                    line-height: 1.6; 
                    color: #1a1a1a;
                    background: #fff;
                    padding: 40px;
                    max-width: 850px;
                    margin: 0 auto;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px; 
                    padding-bottom: 20px;
                    border-bottom: 2px solid #2563eb;
                }
                .name { 
                    font-size: 28px; 
                    font-weight: 700; 
                    color: #1e293b; 
                    margin-bottom: 8px;
                    letter-spacing: -0.5px;
                }
                .contact-info { 
                    display: flex; 
                    justify-content: center; 
                    flex-wrap: wrap; 
                    gap: 15px; 
                    font-size: 13px; 
                    color: #64748b;
                    margin-top: 10px;
                }
                .contact-item { 
                    display: flex; 
                    align-items: center; 
                    gap: 5px; 
                }
                .section { 
                    margin-bottom: 25px; 
                }
                .section-title { 
                    font-size: 16px; 
                    font-weight: 600; 
                    color: #2563eb; 
                    text-transform: uppercase; 
                    letter-spacing: 1px;
                    margin-bottom: 12px;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .summary { 
                    color: #334155; 
                    font-size: 14px;
                    text-align: justify;
                }
                .experience-item { 
                    margin-bottom: 20px; 
                }
                .job-header { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: baseline;
                    margin-bottom: 5px;
                }
                .job-title { 
                    font-size: 15px; 
                    font-weight: 600; 
                    color: #1e293b;
                }
                .company { 
                    font-size: 14px; 
                    color: #475569; 
                    font-weight: 500;
                }
                .date { 
                    font-size: 13px; 
                    color: #64748b;
                    white-space: nowrap;
                }
                .description { 
                    font-size: 14px; 
                    color: #334155; 
                    margin-bottom: 8px;
                    text-align: justify;
                }
                .achievements { 
                    list-style: none; 
                    padding-left: 0;
                }
                .achievements li { 
                    position: relative; 
                    padding-left: 18px; 
                    font-size: 14px; 
                    color: #475569;
                    margin-bottom: 4px;
                }
                .achievements li::before {
                    content: '•';
                    position: absolute;
                    left: 0;
                    color: #2563eb;
                    font-weight: bold;
                }
                .skills-container { 
                    display: flex; 
                    flex-wrap: wrap; 
                    gap: 8px; 
                }
                .skill-tag { 
                    background: #eff6ff; 
                    color: #1e40af; 
                    padding: 5px 12px; 
                    border-radius: 12px; 
                    font-size: 13px;
                    font-weight: 500;
                    border: 1px solid #dbeafe;
                }
                .education-item { 
                    margin-bottom: 15px; 
                }
                .degree { 
                    font-size: 15px; 
                    font-weight: 600; 
                    color: #1e293b;
                }
                .institution { 
                    font-size: 14px; 
                    color: #475569;
                }
                .edu-date { 
                    font-size: 13px; 
                    color: #64748b;
                }
                @media print {
                    body { padding: 20px; }
                    .no-print { display: none; }
                }
            </style>
        
                </head>
                <body>
                    <div class="print-content">
                        ${c.innerHTML}
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                        }
                    <\/script>
                </body>
            </html>
        `),s.document.close()};return d==="print"?e.jsxs("div",{className:"hidden",children:[e.jsx("div",{ref:r,className:"bg-white text-gray-900 p-8 max-w-[850px] mx-auto",children:e.jsx(Z,{resume:a,formatDate:h})}),e.jsxs(P,{onClick:g,className:"fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white shadow-xl z-50 no-print",children:[e.jsx(X,{className:"w-4 h-4 mr-2"}),"Download PDF"]})]}):e.jsxs("div",{className:"space-y-4",children:[e.jsx("div",{className:"flex justify-end gap-2",children:e.jsxs(P,{onClick:g,className:"bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 shadow-lg",size:"sm",children:[e.jsx(X,{className:"w-4 h-4 mr-2"}),"Download Professional PDF"]})}),e.jsx("div",{ref:r,className:"bg-white text-gray-900 rounded-2xl shadow-2xl overflow-hidden",children:e.jsx("div",{className:"p-8 md:p-12 max-w-[850px] mx-auto",children:e.jsx(Z,{resume:a,formatDate:h})})})]})}function Z({resume:a,formatDate:d}){var y,c;const r=a.parsed_data,g=(((c=(y=a.work_experience)==null?void 0:y[0])==null?void 0:c.title)||"Professional").split(" ").slice(0,2).join(" ");return e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"header text-center mb-8 pb-6 border-b-2 border-blue-600",children:[e.jsx("h1",{className:"text-3xl font-bold text-gray-900 mb-2 tracking-tight",children:g}),a.extracted_skills&&a.extracted_skills.length>0&&e.jsx("p",{className:"text-blue-600 font-medium text-sm",children:a.extracted_skills.slice(0,3).join(" • ")}),e.jsxs("div",{className:"contact-info flex justify-center flex-wrap gap-4 mt-3 text-xs text-gray-600",children:[(r==null?void 0:r.email)&&e.jsxs("div",{className:"contact-item flex items-center gap-1",children:[e.jsx(fe,{className:"w-3 h-3"}),e.jsx("span",{children:String(r.email)})]}),(r==null?void 0:r.phone)&&e.jsxs("div",{className:"contact-item flex items-center gap-1",children:[e.jsx(be,{className:"w-3 h-3"}),e.jsx("span",{children:String(r.phone)})]}),(r==null?void 0:r.location)&&e.jsxs("div",{className:"contact-item flex items-center gap-1",children:[e.jsx(ue,{className:"w-3 h-3"}),e.jsx("span",{children:String(r.location)})]}),(r==null?void 0:r.linkedin)&&e.jsxs("div",{className:"contact-item flex items-center gap-1",children:[e.jsx(ge,{className:"w-3 h-3"}),e.jsx("span",{children:String(r.linkedin)})]})]})]}),a.summary&&e.jsxs("div",{className:"section mb-6",children:[e.jsx("h2",{className:"section-title text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3 pb-1 border-b border-gray-200",children:"Professional Summary"}),e.jsx("p",{className:"summary text-gray-700 text-sm leading-relaxed text-justify",children:a.summary})]}),a.extracted_skills&&a.extracted_skills.length>0&&e.jsxs("div",{className:"section mb-6",children:[e.jsx("h2",{className:"section-title text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3 pb-1 border-b border-gray-200",children:"Core Skills"}),e.jsx("div",{className:"skills-container flex flex-wrap gap-2",children:a.extracted_skills.map((s,m)=>e.jsx("span",{className:"skill-tag bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-100",children:s},m))})]}),a.work_experience&&a.work_experience.length>0&&e.jsxs("div",{className:"section mb-6",children:[e.jsx("h2",{className:"section-title text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4 pb-1 border-b border-gray-200",children:"Professional Experience"}),e.jsx("div",{className:"space-y-5",children:a.work_experience.map((s,m)=>e.jsxs("div",{className:"experience-item",children:[e.jsxs("div",{className:"job-header flex justify-between items-baseline mb-1",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"job-title text-base font-semibold text-gray-900",children:s.title}),e.jsx("p",{className:"company text-sm text-gray-600 font-medium",children:s.company})]}),e.jsxs("span",{className:"date text-xs text-gray-500 whitespace-nowrap",children:[d(s.start_date)," — ",s.is_current?"Present":d(s.end_date)]})]}),s.description&&e.jsx("p",{className:"description text-sm text-gray-700 mt-2 leading-relaxed",children:s.description}),s.achievements&&s.achievements.length>0&&e.jsx("ul",{className:"achievements list-none pl-0 mt-2",children:s.achievements.map((N,v)=>e.jsx("li",{className:"relative pl-4 text-sm text-gray-600 mb-1 before:content-['•'] before:absolute before:left-0 before:text-blue-600 before:font-bold",children:N},v))})]},m))})]}),a.education&&a.education.length>0&&e.jsxs("div",{className:"section mb-6",children:[e.jsx("h2",{className:"section-title text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4 pb-1 border-b border-gray-200",children:"Education"}),e.jsx("div",{className:"space-y-4",children:a.education.map((s,m)=>e.jsxs("div",{className:"education-item",children:[e.jsx("h3",{className:"degree text-sm font-semibold text-gray-900",children:s.degree}),e.jsx("p",{className:"institution text-sm text-gray-600",children:s.institution}),e.jsxs("p",{className:"edu-date text-xs text-gray-500 mt-1",children:[d(s.start_date)," — ",d(s.end_date)]})]},m))})]}),a.certifications&&a.certifications.length>0&&e.jsxs("div",{className:"section mb-6",children:[e.jsx("h2",{className:"section-title text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3 pb-1 border-b border-gray-200",children:"Certifications"}),e.jsx("ul",{className:"list-disc pl-5 space-y-1",children:a.certifications.map((s,m)=>e.jsx("li",{className:"text-sm text-gray-700",children:typeof s=="string"?s:"Certification"},m))})]})]})}function Xe(){var L,I,B;const{resumes:a,addResume:d,setResumes:r,primaryResume:h,setPrimaryResume:g}=de(),{fetchItems:y,addAnalysis:c}=pe(),{profile:s}=me(),m=xe(),[N,v]=x.useState(!1),[K,p]=x.useState(0),[Q,z]=x.useState(!1),[F,U]=x.useState(null),R=x.useRef(null),[$,A]=x.useState(!1),[D,ee]=x.useState(!1),te=async()=>{var t,i;if(!(!l||!s)){A(!0);try{const n=JSON.stringify(l.parsed_data),u=await Ee.analyzeResume(n,((i=(t=l.work_experience)==null?void 0:t[0])==null?void 0:i.title)||"Job Seeker");await c({user_id:s.id,resume_id:l.id,analysis_data:u,created_at:new Date().toISOString()}),_.success("Career analyzed! Redirecting to tracker..."),m("/tracker?tab=analysis")}catch(n){console.error("Analysis failed:",n),_.error("Career analysis failed. Please try again.")}finally{A(!1)}}},l=h||a[0];x.useEffect(()=>{s&&y(s.id)},[s]);const E=t=>{t.preventDefault(),t.stopPropagation(),t.type==="dragenter"||t.type==="dragover"?z(!0):t.type==="dragleave"&&z(!1)},se=t=>{t.preventDefault(),t.stopPropagation(),z(!1),t.dataTransfer.files&&t.dataTransfer.files[0]&&M(t.dataTransfer.files[0])},ae=t=>{t.target.files&&t.target.files[0]&&M(t.target.files[0])},M=async t=>{var i;if(s){v(!0),U(null),p(10);try{const n=(i=t.name.split(".").pop())==null?void 0:i.toLowerCase(),O=`${`${s.id}/${Date.now()}.${n}`}`;p(20);const{error:q}=await b.storage.from("resumes").upload(O,t);if(q)throw q;p(40);let f="";if(n==="pdf")try{const k=document.createElement("script");k.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",document.head.appendChild(k),await new Promise(w=>{k.onload=w});const H=window.pdfjsLib;H.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";const le=await t.arrayBuffer(),T=await H.getDocument({data:le}).promise;let V="";for(let w=1;w<=T.numPages;w++){const oe=(await(await T.getPage(w)).getTextContent()).items.map(ce=>ce.str);V+=oe.join(" ")+`
`,p(40+Math.round(w/T.numPages*20))}f=V}catch(k){throw console.error("PDF extraction failed:",k),new Error("Could not read text from PDF. Ensure it is not a scanned image.")}else f=await t.text(),f.includes("<?xml")&&(f=f.replace(/<[^>]*>/g," "));if(!f||f.trim().length<20)throw new Error("Could not extract enough text from the file. Try a plain text or different PDF file.");p(70);const{data:o,error:G}=await b.functions.invoke("parse-resume",{body:{resumeText:f}});if(G||o&&o.error)throw console.error("AI parsing failed:",G||o.error),new Error((o==null?void 0:o.error)||"Failed to analyze resume content. Please try again.");const ne={user_id:s.id,original_filename:t.name,storage_path:O,summary:o.summary||"Summary not available",extracted_skills:o.extracted_skills||[],work_experience:o.work_experience||[],education:o.education||[],certifications:o.certifications||[],parsed_data:o,is_primary:a.length===0};p(90);const{data:W,error:J}=await b.from("resumes").insert([ne]).select().maybeSingle();if(J)throw J;W&&d(W),p(100)}catch(n){console.error("Upload failed:",n),U(n.message||"Failed to upload resume.")}finally{setTimeout(()=>{v(!1),p(0)},500)}}},re=async(t,i)=>{if(confirm("Are you sure you want to delete this resume?"))try{await b.storage.from("resumes").remove([i]);const{error:n}=await b.from("resumes").delete().eq("id",t);n||r(a.filter(u=>u.id!==t))}catch(n){_.error(n.message||"Failed to delete resume.")}},ie=async t=>{try{await b.from("resumes").update({is_primary:!1}).eq("user_id",s.id),await b.from("resumes").update({is_primary:!0}).eq("id",t),g(t)}catch(i){_.error(i.message||"Failed to update primary resume.")}},C=t=>{if(!t)return"";const i=new Date(t);return isNaN(i.getTime())?t:i.toLocaleDateString("en-US",{month:"short",year:"numeric"})};return e.jsxs("div",{className:"animate-fade-in relative font-['General_Sans',_sans-serif]",children:[e.jsxs("div",{className:"mb-6 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4",children:[e.jsxs("div",{className:"text-left",children:[e.jsx("h1",{className:"font-medium text-2xl md:text-3xl text-white mb-2 tracking-tight",children:"Resume Manager"}),e.jsx("p",{className:"text-white/60 text-sm md:text-base",children:"Upload and manage your resumes. We'll extract skills and experience for better matching."})]}),e.jsxs("div",{className:"flex gap-2 flex-col md:flex-row",children:[l&&e.jsxs(P,{onClick:()=>ee(!D),className:"bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-600/20 group rounded-full w-full md:w-auto text-sm md:text-base",children:[e.jsx(we,{className:"w-4 h-4 md:w-5 md:h-5 mr-2 text-white/80 group-hover:text-white"}),D?"Hide Preview":"Preview Resume"]}),l&&e.jsx(P,{onClick:te,disabled:$,className:"bg-white text-black hover:bg-white/90 border-none shadow-lg shadow-white/10 disabled:opacity-70 disabled:cursor-not-allowed group rounded-full w-full md:w-auto text-sm md:text-base",children:$?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"w-5 h-5 mr-2 border-2 border-black/30 border-t-black rounded-full animate-spin"}),"Analyzing..."]}):e.jsxs(e.Fragment,{children:[e.jsx(Y,{className:"w-4 h-4 md:w-5 md:h-5 mr-2 text-black/60 group-hover:text-black"}),"Analyze Career Path"]})})]})]}),e.jsxs("div",{className:"grid md:grid-cols-3 gap-6",children:[e.jsxs("div",{className:"md:col-span-1 space-y-4",children:[e.jsxs(j,{className:"p-4 md:p-6 border border-white/10 bg-white/5",children:[e.jsx("h3",{className:"font-medium text-lg text-white mb-4",children:"Upload New"}),e.jsxs("div",{onDragEnter:E,onDragLeave:E,onDragOver:E,onDrop:se,onClick:()=>{var t;return(t=R.current)==null?void 0:t.click()},className:`
                relative border-2 border-dashed rounded-xl p-6 md:p-8 text-center transition-all cursor-pointer
                ${Q?"border-white bg-white/10":"border-white/10 hover:border-white/20 bg-white/5"}
              `,children:[e.jsx("input",{type:"file",ref:R,className:"hidden",accept:".pdf,.docx",onChange:ae}),N?e.jsxs("div",{className:"space-y-3",children:[e.jsx("div",{className:"w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white/50 border-t-transparent animate-spin mx-auto"}),e.jsxs("p",{className:"text-white text-sm font-medium",children:["Processing... ",K,"%"]})]}):e.jsxs("div",{className:"space-y-2",children:[e.jsx(je,{className:"w-8 h-8 md:w-10 md:h-10 text-white/40 mx-auto"}),e.jsx("p",{className:"text-white font-medium text-sm md:text-base",children:"Drop Resume or Click"}),e.jsx("p",{className:"text-white/40 text-xs",children:"PDF or DOCX allowed"})]})]}),F&&e.jsxs("div",{className:"mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-red-500 text-sm",children:[e.jsx(ye,{className:"w-4 h-4 shrink-0 mt-0.5"}),e.jsx("span",{children:F})]})]}),e.jsxs(j,{className:"p-4 md:p-6 border border-white/10 bg-white/5 overflow-hidden",children:[e.jsx("h3",{className:"font-medium text-lg text-white mb-4",children:"Your Resumes"}),e.jsx("div",{className:"space-y-2 max-h-[300px] overflow-y-auto -mx-2 px-2",children:a.length===0?e.jsx("p",{className:"text-white/40 text-sm text-center py-4 italic",children:"No resumes uploaded yet"}):a.map(t=>e.jsxs("div",{className:`
                      group p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer
                      ${t.is_primary?"bg-white text-black border-transparent":"bg-white/5 border-transparent hover:bg-white/10 text-white"}
                    `,onClick:()=>ie(t.id),children:[e.jsxs("div",{className:"flex items-center gap-3 overflow-hidden min-w-0",children:[e.jsx(he,{className:`w-5 h-5 shrink-0 ${t.is_primary?"text-black":"text-white/40"}`}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("p",{className:"text-sm font-medium truncate",children:t.original_filename}),e.jsxs("p",{className:`text-[10px] ${t.is_primary?"text-black/60":"text-white/40"}`,children:["Uploaded ",new Date(t.created_at||"").toLocaleDateString()]})]})]}),e.jsx("div",{className:"flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0",children:e.jsx("button",{onClick:i=>{i.stopPropagation(),re(t.id,t.storage_path)},className:`p-1.5 rounded-lg transition-colors ${t.is_primary?"hover:bg-red-500/10 text-black/40 hover:text-red-600":"hover:bg-red-500/20 text-white/40 hover:text-red-400"}`,children:e.jsx(Ne,{className:"w-4 h-4"})})})]},t.id))})]})]}),e.jsx("div",{className:"md:col-span-2 space-y-4 md:space-y-6",children:D&&l?e.jsx(Te,{resume:l,variant:"preview"}):l?e.jsxs(e.Fragment,{children:[e.jsx(j,{className:"p-4 md:p-6 border border-white/10 bg-white/5",children:e.jsxs("div",{className:"flex items-start gap-3 md:gap-4",children:[e.jsx("div",{className:"w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5",children:e.jsx(Y,{className:"w-5 h-5 md:w-6 md:h-6 text-white"})}),e.jsxs("div",{className:"min-w-0",children:[e.jsx("h3",{className:"text-lg font-medium text-white mb-2",children:"AI Insight Summary"}),e.jsx("p",{className:"text-white/60 text-sm leading-relaxed",children:l.summary})]})]})}),e.jsxs(j,{className:"p-4 md:p-6 border border-white/10 bg-white/5",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-4 md:mb-6",children:[e.jsx(Ce,{className:"w-5 h-5 text-white/60"}),e.jsx("h3",{className:"font-medium text-lg text-white",children:"Core Skills Identified"})]}),e.jsx("div",{className:"flex flex-wrap gap-2",children:(L=l.extracted_skills)==null?void 0:L.map(t=>e.jsx("span",{className:"px-3 py-1.5 rounded-full bg-white/5 text-white/80 text-sm border border-white/10 select-none",children:t},t))})]}),e.jsxs(j,{className:"p-4 md:p-6 border border-white/10 bg-white/5",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-4 md:mb-6",children:[e.jsx(ve,{className:"w-5 h-5 text-white/60"}),e.jsx("h3",{className:"font-medium text-lg text-white",children:"Work Experience"})]}),e.jsx("div",{className:"space-y-6 md:space-y-8",children:(I=l.work_experience)==null?void 0:I.map((t,i)=>e.jsxs("div",{className:"relative pl-4 md:pl-6 border-l border-white/10 last:border-transparent",children:[e.jsx("div",{className:"absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-white/20 ring-4 ring-black"}),e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3",children:[e.jsxs("div",{className:"min-w-0",children:[e.jsx("h4",{className:"font-medium text-white text-lg leading-tight",children:t.title}),e.jsx("p",{className:"text-white/60 font-medium",children:t.company})]}),e.jsxs("div",{className:"text-white/40 text-sm whitespace-nowrap",children:[C(t.start_date)," — ",t.is_current?"Present":C(t.end_date)]})]}),e.jsx("p",{className:"text-white/50 text-sm mb-4 leading-relaxed",children:t.description}),t.achievements&&t.achievements.length>0&&e.jsx("ul",{className:"space-y-2",children:t.achievements.map((n,u)=>e.jsxs("li",{className:"flex items-start gap-3 text-sm text-white/60",children:[e.jsx(_e,{className:"w-4 h-4 text-white/40 shrink-0 mt-0.5"}),e.jsx("span",{children:n})]},u))})]},i))})]}),e.jsxs(j,{className:"p-4 md:p-6 border border-white/10 bg-white/5",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-4 md:mb-6",children:[e.jsx(De,{className:"w-5 h-5 text-white/60"}),e.jsx("h3",{className:"font-medium text-lg text-white",children:"Education"})]}),e.jsx("div",{className:"grid sm:grid-cols-2 gap-4",children:(B=l.education)==null?void 0:B.map((t,i)=>e.jsxs("div",{className:"p-4 rounded-xl bg-white/5 border border-white/10",children:[e.jsx("h4",{className:"font-medium text-white leading-tight",children:t.degree}),e.jsx("p",{className:"text-white/60 text-sm mt-1",children:t.institution}),e.jsxs("p",{className:"text-xs text-white/40 mt-2",children:[C(t.start_date)," — ",C(t.end_date)]})]},i))})]})]}):e.jsxs("div",{className:"h-full min-h-[300px] md:min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl p-6 md:p-12 text-center opacity-70 bg-white/5",children:[e.jsx(ze,{className:"w-12 h-12 md:w-16 md:h-16 text-white/20 mb-4"}),e.jsx("h3",{className:"text-xl font-medium text-white mb-2",children:"No Resume Selected"}),e.jsx("p",{className:"text-white/50 max-w-sm",children:"Upload a resume to see your parsed profile information and start tailoring your applications."}),e.jsx(P,{variant:"outline",className:"mt-6 rounded-full border-white/20 hover:border-white text-white hover:bg-white/10",onClick:()=>{var t;return(t=R.current)==null?void 0:t.click()},children:"Upload First Resume"})]})})]})]})}export{Xe as default};
