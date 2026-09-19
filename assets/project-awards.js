(async()=>{
  const projects=await window.loadStudioProjects();
  const list=document.querySelector('[aria-label="Awards list"]');
  let count=0;
  for(const project of projects) for(const award of project.awards){
    const row=document.createElement('a');row.className='award';row.href='project.html?slug='+encodeURIComponent(project.slug);
    // Values are assigned as text, keeping project JSON separate from markup.
    row.innerHTML='<div class="award-info"><span class="year"></span><div class="award-body"><h2></h2><p class="category"></p><div class="project-name"></div><p class="location"></p></div></div><figure class="visual"><div class="image-wrap"><img loading="lazy" width="1000" height="1000"></div></figure>';
    for(const [selector,text] of [['.year',award.year],['h2',award.name],['.category',award.distinction],['.project-name',project.shortTitle+' ↗'],['.location',project.loc]])row.querySelector(selector).textContent=text;
    const img=row.querySelector('img');img.src=project.img;img.alt=project.heroAlt;
    list.querySelector('.archive-top').after(row);count++;
  }
  const total=list.querySelectorAll('.award').length;
  document.querySelector('#page-title sup').textContent=String(total).padStart(2,'0');
  list.querySelector('.archive-top span:last-child').textContent=String(total).padStart(2,'0')+' recognitions';
})();
