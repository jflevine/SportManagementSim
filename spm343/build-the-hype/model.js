/* Build the Hype — transparent, deterministic teaching model. No real forecasts. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.HypeModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const BUDGET = 10;
  const MISSIONS = [
    { id:'compete', icon:'trophy', label:'Competition first', audience:'Campus players', title:'Campus Clash', tagline:'Bring your team. Earn your moment.', purpose:'Run a credible competition for campus players.', goal:'Target: 80% of players rate the competition as fair.', measure:'Ask players a one-question fairness survey after the final.', color:'#bdff70' },
    { id:'connect', icon:'controller', label:'Everyone belongs', audience:'New & casual players', title:'Press Play Social', tagline:'New here? You already belong.', purpose:'Make first-time and casual players feel welcome.', goal:'Target: 3 in 4 first-time guests say they would return.', measure:'Ask first-time guests whether they would come back.', color:'#ffb38d' },
    { id:'showcase', icon:'spark', label:'Give fans a show', audience:'Spectators & fans', title:'After Hours Arena', tagline:'Big plays. Shared reactions.', purpose:'Create a memorable live show for spectators.', goal:'Target: 70% of opening spectators stay for the headline match.', measure:'Give opening spectators a colored card; count how many of that same group remain for the headline match.', color:'#8df0ed' }
  ];
  const FORMATS = [
    { id:'knockout', icon:'bracket', label:'Knockout cup', short:'One loss ends your title run', detail:'A clear bracket builds toward one final. Eliminated players can enjoy your extra features.', tradeoff:'A strong final is easy to follow, but some teams play only once.', staff:'Bracket marshal + timekeeper', fit:{compete:2,connect:0,showcase:2}, experience:{compete:1,connect:0,showcase:2} },
    { id:'groups', icon:'grid', label:'Group play + final', short:'Several games before the final', detail:'Small groups guarantee more play, then the strongest teams reach a final. Preset match slots keep it feasible.', tradeoff:'More guaranteed play means more scoring, scheduling, and staff coordination.', staff:'Two pool marshals + scorekeeper', fit:{compete:2,connect:1,showcase:1}, experience:{compete:2,connect:1,showcase:1} },
    { id:'rotation', icon:'loop', label:'Rotating mini-challenges', short:'Drop in, try a challenge, rotate', detail:'Short hosted challenges let guests join at different times. Finish with a friendly featured matchup.', tradeoff:'Easy entry and variety take priority over a definitive tournament champion.', staff:'Station guides + rotation floater', fit:{compete:0,connect:2,showcase:1}, experience:{compete:0,connect:2,showcase:1} }
  ];
  const FEATURES = [
    { id:'freeplay', icon:'controller', label:'Beginner free-play', cost:2, short:'A low-pressure place to try the game', detail:'A volunteer explains controls and welcomes first-timers. Uses a reserved side station.', staff:'Welcome guide', draw:{compete:0,connect:2,showcase:0}, experience:{compete:1,connect:2,showcase:0} },
    { id:'creator', icon:'star', label:'Campus creator exhibition', cost:4, short:'A familiar campus face plays a show match', detail:'A student creator brings attention and a scheduled exhibition. Needs a rehearsal and a host.', staff:'Exhibition host', draw:{compete:3,connect:3,showcase:3}, experience:{compete:1,connect:1,showcase:1} },
    { id:'cast', icon:'mic', label:'Live commentary + stream', cost:4, short:'Help the room follow the action', detail:'Student commentators explain key plays, with a simple stream for remote viewers.', staff:'Commentator + stream operator', draw:{compete:1,connect:0,showcase:2}, experience:{compete:1,connect:1,showcase:2} },
    { id:'predictions', icon:'flag', label:'Spectator prediction game', cost:2, short:'Fans pick the next winner for fun', detail:'A host runs quick audience polls between rounds. No money, wagering, or prizes.', staff:'Audience host', draw:{compete:0,connect:1,showcase:1}, experience:{compete:0,connect:1,showcase:1} },
    { id:'coaching', icon:'chat', label:'Quick coaching corner', cost:3, short:'Leave with one new skill', detail:'Experienced players offer short tips between matches. Helps beginners and improving competitors.', staff:'Peer coach', draw:{compete:2,connect:2,showcase:0}, experience:{compete:2,connect:2,showcase:0} },
    { id:'spotlight', icon:'spark', label:'Player spotlight station', cost:3, short:'Give the event a face and a story', detail:'Short player introductions and a photo backdrop turn names into people fans can cheer for.', staff:'Spotlight host', draw:{compete:1,connect:1,showcase:2}, experience:{compete:1,connect:1,showcase:1} }
  ];
  const SURPRISE = { title:'Your headline host is 20 minutes late.', body:'Doors open in five minutes. The matches, equipment, and core staff are ready, but the person connecting the show is stuck in transit. Make one adjustment.', boundary:'Safety, access support, check-in, and game officials remain in place.' };
  const ADJUSTMENTS = [
    { id:'delay', icon:'clock', label:'Move the headline back', short:'Use the opening 20 minutes for warm-up play', detail:'Your station guides welcome guests while the host travels. Keep the polished headline, but ask spectators to wait.', consequence:'The headline stays polished; some spectators lose interest while waiting.', draw:-1, experience:1, cost:0 },
    { id:'backup', icon:'mic', label:'Give the backup the mic', short:'Keep the schedule with a less-practiced host', detail:'Your designated assistant follows the run sheet. The doors and headline stay on time, with a simpler presentation.', consequence:'The schedule holds; the show has less polish and needs clearer cues.', draw:1, experience:-1, cost:0 },
    { id:'remix', icon:'loop', label:'Open with a community challenge', short:'Let station guides lead a short audience warm-up', detail:'Replace the scripted opening with a friendly challenge. Everyone gets something to do, but the headline loses its big introduction.', consequence:'Guests participate immediately; the planned headline gets less buildup.', draw:0, experience:0, cost:0 }
  ];
  const find = (list,id) => list.find(x=>x.id===id);
  const cleanText = (v,max=50) => typeof v==='string' ? v.replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,max) : '';
  function fresh() { return {version:1,step:0,mode:'solo',name:'',mission:'',format:'',features:[],featuresConfirmed:false,adjustment:'',reflection:''}; }
  function total(s) { return s.features.reduce((n,id)=>n+(find(FEATURES,id)?.cost||0),0); }
  function toggleFeature(s,id) {
    if(!find(FEATURES,id)) return {ok:false,message:'Choose an available event feature.'};
    if(s.features.includes(id)) return {ok:true,state:{...s,features:s.features.filter(x=>x!==id),featuresConfirmed:false,adjustment:''}};
    if(s.features.length>=3) return {ok:false,message:'Three features is the limit. Remove one before adding another.'};
    if(total(s)+find(FEATURES,id).cost>BUDGET) return {ok:false,message:'That would exceed 10 credits. Remove a feature or choose a less costly one.'};
    return {ok:true,state:{...s,features:[...s.features,id],featuresConfirmed:false,adjustment:''}};
  }
  function maxStep(s) {
    if(!s.mission) return 1;
    if(!s.format) return 2;
    if(!s.featuresConfirmed) return 3;
    if(!s.adjustment) return 4;
    return 5;
  }
  function restore(raw) {
    const s=fresh();
    if(!raw || raw.version!==1) return s;
    s.mode=raw.mode==='pair'?'pair':'solo'; s.name=cleanText(raw.name); s.reflection=cleanText(raw.reflection,300);
    s.mission=find(MISSIONS,raw.mission)?raw.mission:'';
    s.format=s.mission&&find(FORMATS,raw.format)?raw.format:'';
    if(s.format && Array.isArray(raw.features)) for(const id of raw.features) {
      if(!find(FEATURES,id) || s.features.includes(id)) continue;
      const next=toggleFeature(s,id); if(next.ok) s.features=next.state.features;
    }
    s.featuresConfirmed=!!s.format && raw.featuresConfirmed===true;
    s.adjustment=s.featuresConfirmed && find(ADJUSTMENTS,raw.adjustment)?raw.adjustment:'';
    s.step=Math.max(0,Math.min(Number.isInteger(raw.step)?raw.step:0,maxStep(s)));
    return s;
  }
  function recap(raw) {
    const s=restore(raw), m=find(MISSIONS,s.mission), f=find(FORMATS,s.format), a=find(ADJUSTMENTS,s.adjustment);
    if(!m||!f||!a||!s.featuresConfirmed) return null;
    const chosen=s.features.map(id=>find(FEATURES,id));
    const draw=1+f.fit[m.id]+chosen.reduce((n,x)=>n+x.draw[m.id],0)+a.draw;
    const experience=1+f.experience[m.id]+chosen.reduce((n,x)=>n+x.experience[m.id],0)+a.experience;
    const drawLevel=draw>=6?'Broad pull':draw>=3?'Steady interest':'A focused crowd';
    const experienceLevel=f.experience[m.id]===0?'Mixed priorities':experience>=6?'Strong fit':experience>=3?'Good foundations':'A mixed fit';
    const drawText=draw>=6?'Several parts of the plan give your chosen audience a reason to show up.':draw>=3?'Your event gives the audience clear reasons to come, with room to strengthen the offer.':'This plan may appeal to a narrower slice of your chosen audience. A smaller event can still meet its purpose.';
    const experienceText=f.experience[m.id]===0?'Your extra features may help, but the core format serves a different purpose. That tension remains even with a bigger feature budget.':experience>=6?'The format and features reinforce the purpose you selected.':experience>=3?'The plan supports your purpose, though some guests may want a different experience.':'Some choices serve a different audience better. Explain why that tradeoff is worth it.';
    const benefits=chosen.filter(x=>x.draw[m.id]+x.experience[m.id]>=3).map(x=>x.label);
    return {mission:m,format:f,adjustment:a,features:chosen,spent:total(s),remaining:BUDGET-total(s),drawLevel,experienceLevel,drawText,experienceText,benefits,goalEvidence:'Not measured in this sandbox. Your goal needs evidence from a real event.',tradeoff:f.tradeoff,adjustmentTradeoff:a.consequence};
  }
  return {BUDGET,MISSIONS,FORMATS,FEATURES,SURPRISE,ADJUSTMENTS,find,fresh,total,toggleFeature,maxStep,restore,recap,cleanText};
});
