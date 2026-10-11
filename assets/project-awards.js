(async()=>{
  const list=document.getElementById('awards-list');
  const status=document.getElementById('awards-status');
  if(!list || !status) return;

  // Editorial display order; award levels break ties within the same competition.
  const recognitionOrder=[
    /peter joseph lenn/i,
    /^(national asla|asla student awards)$/i,
    /^asla emerging professionals/i,
    /^wla awards$/i,
    /^la\+ exotique/i,
    /^asla pa-de$/i,
    /^wla student awards$/i,
    /^lagi/i,
    /^la\+ interruption/i,
    /^design the world you want/i,
    /^muse design/i,
    /^new york architectural/i,
    /^london design/i,
    /^streetlife competition/i,
    /^candelo urban link/i
  ];
  const levelOrder=[
    /award of excellence|first place|first prize|^winner$/i,
    /second place|second prize|outstanding award/i,
    /third place|third prize|honor award|silver winner/i,
    /honorable mention|commendation/i,
    /finalist|shortlisted/i
  ];
  const rank=(value,order)=>{
    const index=order.findIndex(pattern=>pattern.test(value || ''));
    return index<0 ? order.length : index;
  };
  const compareAwards=(a,b)=>rank(a.award.name,recognitionOrder)-rank(b.award.name,recognitionOrder) || rank(a.award.distinction,levelOrder)-rank(b.award.distinction,levelOrder);

  try{
    const projects=await window.loadStudioProjects();
    if(!projects.length) throw new Error('Project data is unavailable');
    const groups=new Map();
    for(const project of projects){
      for(const award of Array.isArray(project.awards) ? project.awards : []){
        if(!award || typeof award.name!=='string' || !award.name.trim() || award.name.trim()==='-') continue;
        // Use the recognition year, which may differ from the project's year.
        const value=String(award.year ?? '').trim();
        const year=/^\d{4}$/.test(value) ? value : 'Undated';
        if(!groups.has(year)) groups.set(year,[]);
        groups.get(year).push({project,award});
      }
    }
    for(const entries of groups.values()) entries.sort(compareAwards);
    const years=[...groups.keys()].sort((a,b)=>a==='Undated' ? 1 : b==='Undated' ? -1 : Number(b)-Number(a));
    const fragment=document.createDocumentFragment();
    for(const year of years){
      const section=document.createElement('section');
      section.className='award-year-group';
      const heading=document.createElement('h2');
      heading.className='award-year';
      heading.id='awards-'+year.toLowerCase();
      heading.textContent=year;
      section.setAttribute('aria-labelledby',heading.id);
      const entries=document.createElement('ul');
      entries.className='award-entries';
      for(const {project,award} of groups.get(year)){
        const row=document.createElement('li');
        row.className='award-row';
        const details=document.createElement('div');
        details.className='award-details';
        let awardUrl;
        try{
          const url=new URL(award.url);
          if(url.protocol==='https:' || url.protocol==='http:') awardUrl=url.href;
        }catch{}
        const name=document.createElement(awardUrl ? 'a' : 'span');
        name.className='award-name';
        const distinction=typeof award.distinction==='string' && award.distinction.trim() && award.distinction.trim()!=='-' ? award.distinction.trim() : '';
        name.textContent=distinction || award.name;
        if(awardUrl){
          name.href=awardUrl;
          name.target='_blank';
          name.rel='noopener noreferrer';
          name.setAttribute('aria-label',[name.textContent,award.name,year,project.shortTitle || project.title].join(' — '));
        }
        details.append(name);
        if(distinction){
          const organization=document.createElement('span');
          organization.className='award-organization';
          organization.textContent=award.name;
          details.append(organization);
        }
        const link=document.createElement('a');
        link.className='project-link';
        link.href='project.html?slug='+encodeURIComponent(project.slug);
        link.textContent=project.shortTitle || project.title;
        row.append(details,link);
        entries.append(row);
      }
      section.append(heading,entries);
      fragment.append(section);
    }
    list.replaceChildren(fragment);
    status.hidden=years.length>0;
    status.textContent=years.length ? '' : 'No awards to display yet.';
  }catch(error){
    console.error('Awards could not load',error);
    status.hidden=false;
    status.textContent='Awards could not be loaded. Please refresh the page.';
  }
})();
