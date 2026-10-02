// Published project records live in content/projects/<slug>/info.json.
window.loadStudioProjects = async function () {
  try {
    const read = async url => { const r=await fetch(url, {cache:'no-cache'}); if(!r.ok) throw new Error(url+': '+r.status); return r.json(); };
    const slugs=await read('content/projects/index.json');
    return await Promise.all(slugs.map(async (slug,i)=>{
      const base='content/projects/'+encodeURIComponent(slug)+'/';
      const p=await read(base+'info.json');
      const location=p.location || {};
      const locationPart=value=>typeof value==='string' && value.trim() && !['-','—'].includes(value.trim()) ? value.trim() : '';
      const city=locationPart(location.city), country=locationPart(location.country);
      const mediaBlocks = p.layout ? p.layout.map(group=>({type:'collection',kind:group.kind,images:group.files.map(file=>{const image=p.images.find(image=>image.file===file);return {...image,src:base+file};})})) : p.images.map(image=>({type:'caption',displayScale:image.displayScale,src:base+image.file,alt:image.alt,label:image.caption,text:image.description||''}));
      return {id:100+i,slug:p.slug,aliases:p.aliases||[],title:p.title,shortTitle:p.shortTitle||p.title,type:p.type,city:city||'-',country:country||'-',loc:[city,country].filter(Boolean).join(', ')||'-',coords:location.coordinates,year:p.year,color:p.color||'#8a9b78',kw:p.keywords,img:base+p.hero.file,heroAlt:p.hero.alt,teaser:p.summary,description:p.description.join('\n\n'),story:p.description,presentation:p.presentation,layoutVariant:p.layoutVariant,pageTheme:p.pageTheme,storyTitle:p.storyTitle,narrativePlacement:p.narrativePlacement,competition:p.competition,webLink:p.webLink,collaborator:p.collaborators.join(', '),award:p.awards.map(a=>a.name+' '+a.year+' — '+a.distinction).join('; '),awards:p.awards,blocks:[{type:'hero',src:base+p.hero.file},...mediaBlocks]};
    }));
  } catch(error) { console.error('Project content could not load',error); return []; }
};
