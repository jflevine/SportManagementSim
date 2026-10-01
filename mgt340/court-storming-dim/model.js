/* Deterministic teaching model. Outcomes illustrate tradeoffs, not injury probabilities. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DIMSim = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const RISKS = [
    {id:'team', label:'Athletes and officials', text:'A collision as people try to leave the court.'},
    {id:'fans', label:'Spectators', text:'A collision where supporters converge near the court.'},
    {id:'staff', label:'Event staff', text:'Staff caught between the crowd and the departing team.'}
  ];
  const MEASURES = [
    {id:'lane', label:'Designate the exit route', text:'Mark a team route and brief staff to keep it available.'},
    {id:'brief', label:'Rehearse the response', text:'Practice access-point coverage, activation signals, and radio confirmations before tipoff.'},
    {id:'message', label:'Give spectator guidance', text:'Tell spectators to remain in authorized areas and keep court access and exits clear.'},
    {id:'backup', label:'Verify a backup route', text:'Check an alternate corridor and agree who may authorize its use.'}
  ];
  const UNITS = [{id:'stewards',label:'Steward team',short:'S'},{id:'liaison',label:'Team liaison',short:'L'},{id:'supervisor',label:'Floor supervisor',short:'F'}];
  const POSTS = [{id:'access',label:'Spectator access'},{id:'route',label:'Team exit route'},{id:'bench',label:'Team bench'}];
  const TRIGGERS = [
    {id:'gathering',label:'When spectators begin gathering',text:'Activate before the final buzzer.'},
    {id:'buzzer',label:'At the final buzzer',text:'Use the clock as the activation signal.'},
    {id:'obstruction',label:'When a route problem is reported',text:'Activate in response to a reported obstruction.'}
  ];
  const COMMS = [
    {id:'confirm',label:'Named lead + radio confirmation',text:'The floor supervisor calls each post; staff repeat back their status.'},
    {id:'broadcast',label:'One radio instruction to everyone',text:'Fast to send; individual posts do not confirm receipt.'},
    {id:'relay',label:'Face-to-face messages',text:'Staff relay instructions between posts.'}
  ];
  const ROUNDS = [
    {clock:'00:30',title:'The crowd is gathering.',question:'Where do you direct your available staff?',choices:[
      {id:'reinforce',label:'Send the supervisor to the exit route.',text:'Activate now. Keep the steward team and liaison at their assigned posts.'},
      {id:'concentrate',label:'Send all three units to the exit route.',text:'Put every available unit where the visiting team will leave.'},
      {id:'hold',label:'Keep positions and follow your planned trigger.',text:'Ask staff to continue observing until the next update.'}
    ]},
    {clock:'00:00',title:'The final buzzer sounds.',question:'Supporters move forward. What instruction do you give?',choices:[
      {id:'rebalance',label:'Hold the team, restore coverage, confirm the route.',text:'Stewards cover access, liaison stays with the team, supervisor checks the exit.'},
      {id:'send',label:'Send the team down the original route now.',text:'Radio the departure instruction and rely on the positions already in place.'},
      {id:'announce',label:'Use the public-address announcement.',text:'Ask spectators to keep back while staff maintain their current positions.'}
    ]},
    {clock:'EXIT',title:'Finish the departure.',question:'What must happen before you release your staff?',choices:[
      {id:'verify',label:'Confirm departure and keep both posts covered.',text:'Restore access and exit coverage as needed. Check the route and account for the team before releasing staff.'},
      {id:'alternate',label:'Use the backup corridor.',text:'Move the supervisor to the alternate route; keep the steward team at spectator access.'},
      {id:'release',label:'Finish on the original route and release staff.',text:'Treat the end of play as the end of the floor assignment.'}
    ]}
  ];
  const clone = obj => JSON.parse(JSON.stringify(obj));
  const has = (plan,id) => plan.measures.includes(id);
  const at = (s,post) => Object.values(s.positions).filter(x=>x===post).length;
  function assess(s,p) {
    if(s.pressure>=2&&!s.entryOccurred){s.entryOccurred=true;s.warnings.push('Spectators entered the playing space during the scenario; a later recovery does not erase that prevention gap.');}
    s.access = at(s,'access') ? 'Covered' : (has(p,'message') ? 'Guidance only' : 'Uncovered');
    s.route = s.checked || (s.active && at(s,'route') && (has(p,'lane') || at(s,'route') >= 2)) ? 'Available' : (s.active && at(s,'route') ? 'Needs a check' : 'Crowded');
    s.communication = s.confirmed ? 'Confirmed' : (p.comms==='relay' ? 'Messages in transit' : 'No confirmation');
    return s;
  }
  function initial(p) {
    return assess({positions:clone(p.positions),active:p.trigger==='gathering'||(p.trigger==='obstruction'&&!has(p,'lane')),checked:false,confirmed:has(p,'brief')&&p.comms==='confirm',pressure:0,entryOccurred:false,team:'At the bench',departed:false,alternate:false,released:false,warnings:[],checks:[]},p);
  }
  function scene(s,p,round) {
    const next=clone(s);
    if(round===1) {
      next.pressure = at(next,'access') ? 1 : (has(p,'message') ? 2 : 3);
      if(p.trigger==='buzzer'||p.trigger==='obstruction') next.active=true;
      if(!at(next,'access')) next.warnings.push('Spectator access had no assigned unit at the buzzer.');
    }
    return assess(next,p);
  }
  function radio(s,p,round) {
    if(round===0) return `“Supporters are gathering near the court. ${has(p,'lane')?'The marked team route is visible.':'People are standing in the intended team route.'} ${s.active?'Your response is active.':'Your planned activation signal has not occurred.'} Where do you need us?”`;
    if(round===1) return `“Supporters are moving forward. ${p.trigger==='obstruction'?'An obstruction report has triggered your response. ':''}${at(s,'access')?'A unit is watching the spectator access point.':'There is no assigned unit at the spectator access point.'} ${s.route==='Available'?'The team route is available.':'The team route needs attention.'} The liaison needs a departure instruction.”`;
    return `“${s.departed?'The team is at the tunnel entrance.':'The team is still waiting to complete its departure.'} Spectators are still moving near the court. ${has(p,'backup')?'The backup corridor was checked before the game.':'No backup corridor was verified in your plan.'} What is our final instruction?”`;
  }
  function act(before,p,round,id) {
    const s=clone(before);let headline='',result='',lesson='';
    if(round===0) {
      if(id==='reinforce') {
        s.positions.supervisor='route';s.active=true;
        headline='The supervisor moves to the exit.';
        result=at(s,'access')?'Spectator access retains coverage while the supervisor supports the team route.':'The exit gains support, but your initial assignments leave spectator access uncovered.';
        lesson='Reinforcement helps only when you also account for the post being left behind.';
      } else if(id==='concentrate') {
        Object.keys(s.positions).forEach(k=>s.positions[k]='route');s.active=true;
        s.warnings.push('All three units were concentrated at the exit, leaving access and bench posts empty.');
        headline='A strong exit presence. Two empty posts.';
        result='The route has three units. Spectator access has none, and the liaison is no longer at the team bench.';
        lesson='Resources at one location create an opportunity cost elsewhere.';
      } else {
        headline=s.active?'Your earlier trigger keeps the response active.':'The crowd moves before your response activates.';
        result=s.active?'Staff remain at the positions you assigned. Those choices now determine what is covered.':'Staff remain in place, but the coordinated response waits for your selected activation signal.';
        lesson='An activation trigger needs to match an observable risk, not just the game clock.';
        if(!s.active)s.warnings.push('The response had not activated while spectators gathered.');
      }
      if(!s.confirmed) result+=' Staff readiness still needs a radio confirmation.';
    } else if(round===1) {
      if(id==='rebalance') {
        s.positions={stewards:'access',liaison:'bench',supervisor:'route'};s.active=true;s.checked=true;s.confirmed=true;s.pressure=1;
        s.team='Waiting for final clearance';s.checks.push('Access and exit posts confirmed their status before team movement.');
        headline='A brief hold restores coordination.';
        result='Stewards cover access. The supervisor checks the exit. The liaison keeps the team together while both posts confirm.';
        lesson='You can repair a weak setup during the event, but doing so takes a hold and an explicit handoff.';
      } else if(id==='send') {
        if(s.route==='Available' && s.confirmed) {s.team='At the tunnel entrance';s.departed=true;headline='The team reaches the tunnel.';result='The available route and confirmed instructions support departure. Spectator coverage still needs attention.';}
        else {s.team='Departure paused';headline='The liaison pauses the departure.';result=`${s.route!=='Available'?'The route has not been established as available.':'The route is available, but staff have not confirmed readiness.'} The team waits for a route check and clear instructions.`;s.warnings.push('Departure was ordered before route availability and readiness were both confirmed.');}
        lesson='A departure instruction is only useful when the route and responsible people are ready.';
      } else {
        s.pressure=Math.max(s.entryOccurred?2:0,s.pressure-1);s.team='Waiting at the bench';
        headline='Fans hear the announcement. Staff positions stay the same.';
        result=`The crowd’s approach slows in this scenario. ${at(s,'access')?'A unit can reinforce that message at spectator access.':'No unit is assigned to reinforce the message at spectator access.'} The team still needs a departure decision.`;
        lesson='Communication supports an operational response; it does not fill an empty post.';
      }
    } else {
      if(id==='verify') {
        s.positions={stewards:'access',liaison:'bench',supervisor:'route'};s.active=true;s.checked=true;s.confirmed=true;s.departed=true;s.team='Team accounted for at exit';s.pressure=1;
        s.checks.push('Route availability and team departure were confirmed; access and exit coverage remained in place.');
        headline='Departure is confirmed. Coverage continues.';
        result='The team is accounted for at the exit. Access and exit staff remain in place while spectator movement continues.';
        lesson='The manager’s responsibility continues after the buzzer and includes evidence that the plan was carried out.';
      } else if(id==='alternate') {
        s.positions.supervisor='backup';s.positions.stewards='access';s.positions.liaison='bench';s.active=true;
        if(has(p,'backup')) {s.alternate=true;s.departed=true;s.confirmed=true;s.team='Team uses verified backup';s.checks.push('A previously verified backup route supported the final departure.');headline='The prepared alternative is usable.';result='The supervisor confirms the checked corridor. Stewards remain at spectator access while the liaison guides the team.';}
        else {s.team=s.departed?'Team held at tunnel entrance':'Team held for alternate-route check';s.warnings.push('An alternate route was requested without prior verification.');headline='An alternate route is not yet a verified route.';result='The supervisor must check the corridor before the liaison can use it. Departure remains on hold; this run ends with that check still outstanding.';s.departed=false;}
        lesson='A contingency is an operational option only when access, readiness, and responsibility have been established.';
      } else {
        const ready=s.route==='Available'&&s.confirmed;
        if(ready||s.departed) {s.team='Team clear; coverage released';s.departed=true;}else{s.team='Departure unresolved';s.departed=false;}
        s.positions={stewards:'released',liaison:'released',supervisor:'released'};s.released=true;s.checked=false;s.active=false;s.pressure=3;
        s.warnings.push('Staff were released while spectator movement continued.');
        headline='Staff leave their posts while the event continues.';
        result=s.departed?'The team has reached the exit, but spectator access and the route no longer have assigned coverage.':'The team’s departure is unresolved, and spectator access and the route no longer have assigned coverage.';
        lesson='Finishing play is not the same as completing an event operation.';
      }
    }
    return {state:assess(s,p),headline,result,lesson};
  }
  function simulate(plan,choices=[]) {
    let s=initial(plan);const history=[];
    for(let i=0;i<choices.length&&i<3;i++) {
      const choice=ROUNDS[i].choices.find(x=>x.id===choices[i]);if(!choice)break;
      const before=scene(s,plan,i);const outcome=act(before,plan,i,choice.id);
      history.push({round:i,choice:choice.label,detail:choice.text,radio:radio(before,plan,i),before,...outcome});s=outcome.state;
    }
    const round=history.length;
    return {history,current:round<3?scene(s,plan,round):s,complete:round===3};
  }
  function report(plan,choices) {
    const run=simulate(plan,choices),s=run.current;
    return [
      {title:'Playing-space entry',status:s.entryOccurred?'Entry occurred':'Entry prevented in this run',text:s.entryOccurred?'Spectators crossed into the playing space. Review when access coverage was lost, even if the team later departed.':'Spectators remained outside the playing space in this simplified scenario. Identify which measures and assignments supported that result.'},
      {title:'Team departure',status:s.departed?'Confirmed':'Still unresolved',text:s.team+'. '+(s.alternate?'Your prepared alternative supported departure.':s.departed?'Compare the final result with the warnings recorded along the way.':'Name the outstanding check or action before claiming the task is complete.')},
      {title:'Coverage',status:at(s,'access')&&at(s,'route')?'Both posts covered':at(s,'access')&&s.alternate?'Access + backup covered':'Coverage gap',text:s.released?'Staff were released while spectator movement continued.':`${s.access} at spectator access. ${s.alternate?'Supervisor at the backup corridor.':s.route+' on the original route.'}`},
      {title:'Communication',status:s.communication,text:s.confirmed?'The run included confirmations of staff readiness or route status.':'Instructions were issued without a completed confirmation loop.'}
    ];
  }
  return {RISKS,MEASURES,UNITS,POSTS,TRIGGERS,COMMS,ROUNDS,simulate,report,radio};
});
