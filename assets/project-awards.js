(async()=>{
  const list=document.getElementById('awards-list');
  const status=document.getElementById('awards-status');
  if(!list || !status) return;

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
        const name=document.createElement('span');
        name.className='award-name';
        name.textContent=award.name;
        const link=document.createElement('a');
        link.className='project-link';
        link.href='project.html?slug='+encodeURIComponent(project.slug);
        link.textContent=project.shortTitle || project.title;
        const arrow=document.createElement('span');
        arrow.className='project-arrow';
        arrow.textContent='↗';
        arrow.setAttribute('aria-hidden','true');
        link.append(arrow);
        row.append(name,link);
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
