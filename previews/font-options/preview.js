const page=document.querySelector('#page'),font=document.querySelector('#font'),hierarchy=document.querySelector('#hierarchy'),letterCase=document.querySelector('#case'),frame=document.querySelector('iframe');
const params=new URLSearchParams(location.search);
function restore(control,key,fallback){const value=params.get(key);control.value=[...control.options].some(o=>o.value===value)?value:fallback;}
restore(page,'page','index');restore(font,'font',params.get('font')==='Roboto Condensed'?'Roboto':'Space Grotesk');restore(hierarchy,'hierarchy','balanced');restore(letterCase,'case','sentence');
const scales={balanced:{title:'clamp(48px,6.5vw,94px)',body:'15px',leading:'1.85',project:'28px',section:'32px'},editorial:{title:'clamp(60px,8vw,120px)',body:'17px',leading:'1.8',project:'34px',section:'40px'},compact:{title:'clamp(40px,4.5vw,68px)',body:'14px',leading:'1.7',project:'24px',section:'26px'}};
let generation=0;
async function render(){const id=++generation,p=page.value,f=font.value,h=hierarchy.value,c=letterCase.value,s=scales[h];history.replaceState(null,'','?'+new URLSearchParams({page:p,font:f,hierarchy:h,case:c}));let text=await fetch('../../'+p+'.html').then(r=>{if(!r.ok)throw Error('Page unavailable');return r.text()});if(id!==generation)return;const base=new URL('../../',location.href).href;text=text.replace(/<head(?:\s[^>]*)?>/i,'$&<base href="'+base+'">');text=text.replaceAll('Roboto Condensed',f);
const style=`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${f.replaceAll(' ','+')}:wght@400;500;600;700&display=swap"><style>
html{--type-title:${s.title};--type-body:${s.body};--type-leading:${s.leading}}
html:root body[data-page] *:not(svg):not(path){font-family:'${f}',sans-serif!important}
html:root body[data-page] :is(#headline h1,#headline .studio-statement,#studio-title,#contact-title,.awards-title){font-family:'${f}',sans-serif!important}
html:root body[data-page] :is(#studio-title,#contact-title,.awards-title){font-size:${s.title}!important;text-transform:${c==='uppercase'?'uppercase':'none'}!important}
html:root body[data-page] :is(.team-heading h2,#inquiries-title){font-size:${s.section}!important;text-transform:${c==='uppercase'?'uppercase':'none'}!important}
html:root body[data-page] :is(.studio-copy p,.contact-intro p,.team-bio p,.project-story p,.contact-locations p,.editorial-bio p,.project-link,.award-name,.meta-list .value){font-size:${s.body}!important;line-height:${s.leading}!important}
html:root body[data-page] #proj-title{font-size:${s.project}!important;line-height:1.15!important;text-transform:${c==='uppercase'?'uppercase':'none'}!important;font-weight:500!important}
html:root body[data-page] :is(.eyebrow,.label,.loc,.award-organization,.cap-label){font-size:11px!important;letter-spacing:${c==='uppercase'?'.08em':'0'}!important;text-transform:${c==='uppercase'?'uppercase':'none'}!important}
/* One case policy for all heading and label roles, including async content. */
html:root body[data-page] :is(h1,h2,h3,h4,h5,h6,.card-name,.project-link,.award-name,.location-name,.marker-label,.next-label,.label,.loc,.eyebrow,.cap-label,.award-organization,.site-links a,.team-role,figcaption){text-transform:${c==='uppercase'?'uppercase':'none'}!important}
</style>`;text=text.replace('</head>',style+'</head>');frame.srcdoc=text;document.querySelector('#copy').textContent='Copy preview link';}
for(const control of [page,font,hierarchy,letterCase])control.onchange=render;
frame.onload=()=>{const doc=frame.contentDocument;if(!doc)return;doc.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a)return;const url=new URL(a.href);const target=url.pathname.split('/').pop().replace('.html','');if(url.origin===location.origin&&[...page.options].some(o=>o.value===target)){e.preventDefault();page.value=target;render();}});if(letterCase.value==='sentence'){for(const [selector,title] of [['#studio-title','Value'],['#team-title','Our team']]){const e=doc.querySelector(selector);if(e)e.textContent=title;}}};
new ResizeObserver(()=>document.documentElement.style.setProperty('--toolbar-height',document.querySelector('header').offsetHeight+'px')).observe(document.querySelector('header'));
document.querySelector('#copy').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);document.querySelector('#copy').textContent='Link copied'}catch{document.querySelector('#copy').textContent='Copy the URL from your address bar'}};
render().catch(e=>document.querySelector('small').textContent=e.message);