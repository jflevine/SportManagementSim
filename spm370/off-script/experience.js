/* OFF SCRIPT v1.1 — student-facing narrative and orientation.
   Fictional setting details are teaching design, not additions to the assigned chapter.
   The v1.0 financial/permissions engine is retained; this adapter changes explanation,
   visible scene facts, and wording, not the money, choices, or permissions they produce. */
(function(root,factory){
  const base=typeof module==='object'&&module.exports?require('./model.js'):root.OffScript;
  const api=factory(base);
  if(typeof module==='object'&&module.exports)module.exports=api;else root.OffScript=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(base){
'use strict';
const VERSION='1.2.0', BRIEFING_VERSION='1.1.0';
const cast={
  blaze:{name:'Blaze',role:'Signal House player · streams on his own channel',initials:'BZ',color:'blue',intro:'A professional VALORANT player on Signal House’s roster. He also livestreams on a personal channel. Rook, a gaming-chair company, already sponsors those personal streams. He wants to help the team without breaking that earlier promise.'},
  nova:{name:'Nova',role:'Signal House creator · streamer and event personality',initials:'NV',color:'pink',intro:'A battle-royale streamer who works with Signal House on content and appearances. Fans recognize her voice, neon-pink hoodie, and goggles. She is open to paid event promotion, but wants to approve how her identity is used.'},
  dev:{name:'Dev Malik',role:'Seatline representative · potential gaming-chair sponsor',initials:'DM',color:'green',intro:'Dev represents Seatline, a gaming-chair brand competing with Rook. Seatline offers production funding in exchange for promotion featuring the creators. It wants clear access to the audiences they attract.'},
  mara:{name:'Mara Chen',role:'Your producer · organizes the videos and live program',initials:'MC',color:'amber',intro:'Your colleague at Signal House. Mara turns the agreed plan into videos and a live program. She will tell you what can be produced, what it costs, and when it is needed.'},
  izzy:{name:'Izzy',role:'Signal House legal adviser · reviews the agreements',initials:'IZ',color:'violet',intro:'The organization’s legal adviser. Izzy helps distinguish what a contract actually permits from what someone would like it to permit.'},
  moth:{name:'Moth',role:'Independent fan artist · not a Signal House employee',initials:'MO',color:'blue',intro:'An independent artist whose cartoon attracts attention during the campaign. Moth did not agree to work for Signal House simply by making art about Nova.'},
  echo:{name:'ECHO Studio',role:'Outside technology vendor · offers an AI voice imitation',initials:'EC',color:'violet',intro:'An outside software company offering a computer-generated voice that sounds like Nova. Its offer is not the same thing as Nova giving permission.'}
};
for(const [id,person] of Object.entries(cast))person.avatar='assets/avatars/'+id+(id==='echo'?'.svg':'.webp');
const glossary=[
 ['NIL','Name, image, and likeness: identity interests involving a person’s name, recognizable appearance, voice, or persona. The game asks who approved a particular use; it does not decide every legal claim.'],
 ['Campaign','The connected advertisements, videos, appearances, and other promotions around CROSSPLAY. It is not a second event.'],
 ['License / permission','An agreement allowing specified uses. It does not automatically transfer ownership or cover every future use.'],
 ['Exclusive sponsorship','A promise to give one brand a defined promotional space or category, excluding competitors within that agreed scope.'],
 ['Carve-out / reserved rights','A written exception that keeps a particular activity outside the sponsor’s deal—for example, Blaze’s personal Rook streams.'],
 ['Waiver / make-good','A waiver is an agreed release of a restriction. A make-good is money or replacement activity negotiated in return for changing a promise.'],
 ['Clearance','Confirming that the needed permissions are in place. “Permissions to resolve” means an issue remains; it is not a court judgment.'],
 ['Static ad / interactive host','A static ad uses an approved fixed image or recording. An interactive host responds to users and can create new dialogue—a different proposed use.']
];
const setup={
 organization:'Signal House is a fictional esports organization. It supports competitive players and online entertainers, and works with brands on paid promotions.',
 role:'You are its brand-partnerships manager. You negotiate what sponsors receive, coordinate with the creators, and decide which promotional material the organization releases. You do not own the creators or control their independent decisions.',
 event:'CROSSPLAY is the name of Signal House’s upcoming two-day fan event: gaming exhibitions, creator interviews, and livestreams. “Creator weekend” means this event—not a separate project you need to invent.',
 campaign:'Seatline, a gaming-chair company, wants to help fund CROSSPLAY. In return, it wants Blaze, the pro player, and Nova, the streamer, to appear in advertisements, videos, and event promotions associated with its chairs.',
 goal:'Deliver a compelling sponsor campaign that stays within the permissions you actually obtain and keeps the creators willing to work with you. More money helps production; it does not buy unlimited control.',
 first:'Your first decision is the sponsorship agreement: how much promotion will you promise Seatline, and how much funding will it provide? You are choosing between three possible deals—not writing contract language from scratch.'
};
// Clear prose for consequences, records, and less prominent contract notes too.
function plain(t){return String(t).replaceAll('creator assent','creator agreement').replaceAll('Blaze’s written assent','Blaze’s written agreement').replaceAll('Blaze’s assent','Blaze’s agreement').replaceAll('carve-out','written exception').replaceAll('sponsor inventory','sponsor advertising space').replaceAll('production capacity','help producing the show').replaceAll('retirement workflow','end-of-use plan').replaceAll('retire controlled assets','stop using the campaign material you control').replaceAll('risk meter','status display').replaceAll('STATIC campaign','campaign of fixed ads').replaceAll('static-ad extension','extension for fixed ads').replaceAll('contextual paid disclosures','clear statements in the content identifying the paid promotion');}
function decorate(v,s){
  v.phase=['10 days before CROSSPLAY','8 days before CROSSPLAY','5 days before CROSSPLAY','3 days before CROSSPLAY','1 day before CROSSPLAY','CROSSPLAY launch morning'][s.step];
  v.thread=['Sponsor offer','Chair sponsorship','Trailer v1 review','Fan art response','Live segment change','Final sign-off'][s.step];
  v.hook=['The sponsor is waiting for your first promise.','Seatline’s next request puts your new agreement to the test.','A polished trailer lands in your inbox. The permissions are less polished.','A fan’s joke about the campaign is getting attention.','Nova cannot go live. What you prepared may save the show.','The sponsor wants a bigger deal. Your earlier choices shape Nova’s answer.'][s.step];
  v.setting=['The sponsorship meeting','Planning the sponsored content','Reviewing the event advertisement','Responding to the fan community','Replacing a live appearance','The final campaign review'][s.step];
  const set=(title,paragraphs,task,evidence)=>Object.assign(v,{title,paragraphs,deck:paragraphs.join(' '),task,evidence});
  if(s.step===0){
    set('First, choose the sponsorship deal.',[
      'You represent Signal House, the organization producing CROSSPLAY. Seatline—the gaming-chair brand—wants to pay for promotions featuring Blaze, your pro player, and Nova, your streamer. Their audiences are what make the partnership valuable.',
      'Blaze already promotes Rook, a rival chair company, on his personal stream. Both creators are willing to consider this new event deal, but their participation does not give Signal House unlimited rights. Three possible agreements are on the table.'
    ],'How much promotional access will you promise Seatline in exchange for production funding?',[
      ['The promise already in place','Rook already sponsors Blaze’s personal streams. That deal remains in force unless Blaze and Rook agree to a change. Official CROSSPLAY content can be kept separate from those streams.'],
      ['What all three offers have in common','They cover specified event uses approved by both adult creators for 30 days from signing. They do not include AI imitations. A later use outside the agreement needs new approval, and permission for footage or music must be checked separately.']
    ]);
    v.options[0].title='Event promotion only · $20,000';
    v.options[0].body='Seatline pays $20,000 for official CROSSPLAY promotion. Put Blaze’s existing Rook streams and the creators’ personal channels outside the deal in writing.';
    v.options[0].trade='Funding now; Seatline gets the event campaign, not every personal stream.';
    v.options[1].title='Add personal channels · up to $30,000';
    v.options[1].body='Take $20,000 for the event and pursue $10,000 more for chair exclusivity across the creators’ channels. The extra rights and payment wait for written permission to change Blaze’s Rook commitment.';
    v.options[1].trade='$20,000 now; another $10,000 only if the broader rights are agreed.';
    v.options[2].title='Two creator appearances · $16,000';
    v.options[2].body='Seatline pays $16,000 for two agreed appearances, with only the associated approved promotion. Keep personal sponsorships reserved and require written approval for additional campaign uses.';
    v.options[2].trade='Less funding; a smaller commitment for the creators.';
  }else if(s.step===1&&s.scope==='broad'){
    set('Can you deliver the broader chair deal?',[
      'Your opening deal brought in $20,000. Another $10,000 is available only if the broader chair-sponsorship rights are agreed. Seatline now asks to feature its chairs on Blaze’s personal livestream tomorrow—the same space Rook already sponsors.',
      'Rook will release this campaign window in writing for a $3,000 compensation package and a specified appearance after CROSSPLAY. Blaze will agree to that limited change. You must choose whether to complete it, narrow the plan, or proceed without it.'
    ],'What will you authorize on Blaze’s personal stream?',[
      ['An available agreement—not an automatic right','The written release is called a waiver. The $3,000 package includes the specified creator payment and Rook’s later appearance. This is compensation for changing a promise, sometimes called a make-good.'],
      ['You can still narrow the plan','Seatline will accept the $20,000 event-only deal instead. The extra $10,000 would never be paid; it is not cash you already received. There is no added breach penalty for this agreed fallback.']
    ]);
    v.options[0].title='Complete the written permission.';
    v.options[0].body='Get Rook’s signed release and Blaze’s agreement to the limited change before the stream promotes Seatline.';
    v.options[1].title='Keep Seatline in event content only.';
    v.options[2].title='Run Seatline’s personal-stream promotion now.';
  }else if(s.step===1){
    const creator=s.scope==='creator';
    set(creator?'The sponsor asks for more than it bought.':'Can a personal stream become the sponsor’s ad?',[
      creator?'You chose two agreed Seatline appearances, keeping personal channels outside the deal. Seatline now asks Blaze to replace Rook with Seatline on his personal channel throughout the campaign. That was not included in the agreement.':'You kept Blaze’s Rook-sponsored personal streams separate from the event. Blaze now plans a paid Rook segment, and Seatline wants to turn a clip of that stream into a CROSSPLAY advertisement for its own chairs.',
      'You can keep the existing boundary or arrange a separate Seatline shoot with written approval from Blaze and Rook. For that added shoot, Seatline offers $6,000; the required permissions and compensation cost $2,000.'
    ],creator?'How will you respond to Seatline’s request for extra personal-channel promotion?':'What will you let Seatline use in its promotional content?',[
      ['Your existing agreement',creator?'The deal covers two specified appearances. Personal channels stay separate, and additional uses need written approval.':'The written exception protects Rook’s personal-stream space. It does not allow that rival-sponsored material to be reused in Seatline advertising.'],
      ['The additional shoot is a new, limited agreement','Blaze and Rook will approve this specified Seatline shoot, not every future use of Blaze’s personal channel. No extra payment or permission arrives until that arrangement is agreed.']
    ]);
    v.options[0].title='Keep the original boundary.';
    v.options[1].title='Arrange the separately approved shoot.';
    v.options[1].body='Get Blaze’s agreement, Rook’s written permission, and a license limited to the new Seatline shoot. Keep unrelated personal content outside the deal.';
    v.options[2].title=creator?'Approve the extra personal-channel promotion.':'Approve the personal-stream clip for Seatline’s ad.';
    v.options[2].body=creator?'Tell Blaze to run Seatline on his personal channel, relying on the team’s general promotion language rather than obtaining the additional agreement.':'Use the Rook-sponsored personal clip in Seatline’s campaign, relying on the team’s general promotion language rather than obtaining the additional agreement.';
  }else if(s.step===2){
    set('Your event trailer is ready. Are its permissions?',[
      'Mara, your producer, sends you a 30-second advertisement for CROSSPLAY. It shows Nova, a highlight of Blaze playing, and a popular music track. This is a paid sponsor advertisement—not a news report or a trailer for a new video game.',
      'The team controls the account that would post it. But the filmmaker only licensed the footage for editorial use, such as reporting. The company that owns the game and the music rights holders have not authorized this sponsor ad. Its paid-promotion notice is only in the account’s profile, not in the video.'
    ],'Which version of the CROSSPLAY trailer will you approve for release?',[
      ['Separate permissions are involved','The creators’ approval concerns their identities. The filmmaker, game publisher, and music rights holders control different material in the video. One approval does not supply all the others.'],
      ['Your production alternatives',s.sponsorOK?'A simpler original shoot costs $1,800 and includes a separately approved recorded Nova greeting. Keeping the existing highlight with all specified permissions costs $2,400. Both include clear paid-promotion notices in the video.':'A new shoot costs $1,800 and includes a separately approved recorded Nova greeting; obtaining permissions for an edited highlight costs $2,400. Both exclude the disputed chair promotion and include paid-promotion notices in the video. Neither resolves the earlier chair dispute itself.']
    ]);
    v.messages[0]=['mara','Trailer v1 is ready. The upload is ours; the footage and track still need sign-off.'];
    v.options[0].title='Shoot a simpler, fully approved trailer.';
    v.options[0].body='Use newly licensed footage and music, without game footage. '+(s.sponsorOK?'Include only chair promotion covered by your signed agreement.':'Leave out the disputed chair promotion.')+' Get the creators’ approval and identify the paid promotion in the video.';
    v.options[1].title='Get permission for the existing highlight.';
    v.options[1].body='Pay for the specified footage, game, music, and identity permissions. '+(s.sponsorOK?'Keep chair promotion within your signed agreement.':'Edit out disputed chair material.')+' Add the paid-promotion notice inside the video.';
    v.options[2].title='Post the current video without those changes.';
  }else if(s.step===3){
    const friction=!s.sponsorOK||!s.disclosure;
    set(friction?'A fan turns your campaign problem into a joke.':'A fan’s unofficial design draws attention.',[
      'Moth, an independent fan artist—not a Signal House employee—is selling shirts with an original cartoon of Nova’s pink hoodie and goggles, surrounded by absurdly large sponsor chairs. The caption reads “Authenticity, sponsored.” The original listing calls it unofficial satire.',
      'Some people repost the design without that label, and fans ask whether it is official merchandise. Seatline asks you either to get it removed or use the art in its advertising. Moth and Nova have not authorized that advertising use.'
    ],'How will you respond to Moth’s work and the confusion around it?',[
      ['What you know—and what is not settled','The drawing is original, recognizable as Nova, and critical of sponsorship. Some reposts are confusing. No court has decided whether this work is protected expression or an unlawful use. Selling it does not answer that question by itself.'],
      ['A collaboration is available','Moth offers a new, clearly official event version for $900 and credit. Nova is willing to approve that version. It would be licensed only for the event; the original satire would stay independent.']
    ]);
    v.options[0].title='Pay for a separate official version.';
    v.options[1].title='Keep the satire separate and clarify.';
    v.options[2].title='Demand that every version be removed.';
  }else if(s.step===4){
    const prepared=s.media==='owned',ally=s.fan==='ally';
    set('Nova cannot join the live program. What replaces her?',[
      'The day before CROSSPLAY, Nova cancels her live appearance. Mara needs a replacement for her segment. ECHO Studio, an outside technology vendor, offers a computer-generated host with Nova’s unmistakable voice.',
      'ECHO’s prototype uses public streams, without Nova’s approval. It will carry an AI label, but that does not supply her permission. She is open to ten reviewed event greetings under a separate agreement; she refuses an unscripted host or new chair endorsements.'
    ],'What will you use for the missing live segment?',[
      ['The limited AI offer','Nova will approve licensed source audio, limited training, ten reviewed greetings, payment, event-only use, and an end-of-use date for the model and outputs. ECHO must discard its unapproved prototype. No open-ended chat or chair testimonials.'],
      ['Your non-AI alternative',prepared?'Your earlier original shoot included Nova’s approved recorded greeting. You can play that recording and use a real host speaking in their own voice for $500. A recorded greeting is not an AI imitation.':ally?'Your earlier collaboration with Moth supplies an approved event graphic. Use it with a real host speaking in their own voice for $900. You have no standalone approved Nova greeting.':'You have neither a standalone approved Nova greeting nor an artist collaboration. A rush booking of a real host speaking in their own voice costs $2,200. Tell viewers that Nova is not appearing live.']
    ]);
    v.options[0].title='Agree to ten controlled AI greetings.';
    v.options[0].body='Sign Nova’s separate agreement, clear source recordings, and replace ECHO’s prototype with ten reviewed event greetings.';
    v.options[1].title=prepared?'Use the approved recording and a real host.':ally?'Use the approved art and a real host.':'Book a real host without imitating Nova.';
    v.options[2].title='Publish ECHO’s existing AI voice preview.';
  }else{
    const wounded=s.voice==='unauthorized',open=s.open.length>0;
    const repair=1200+(s.open.includes('sponsor')?2200:0)+(s.open.includes('media')?1600:0)+(s.open.includes('disclosure')?300:0)+(wounded?1800:0);
    set(wounded?'Seatline wants an extension. Nova is saying no.':open?'A bigger request arrives before the old problems are fixed.':'The sponsor wants to turn the event into a year-long ad.',[
      'Launch morning: Seatline offers another $12,000 for a year of online ads featuring an interactive Nova who talks to fans and promotes chairs. This is a new campaign, beyond your CROSSPLAY agreement.',
      wounded?'Your decision to publish the unapproved voice preview changed the conversation. Nova now refuses any new voice or extended identity license at this deadline. She will approve a limited non-AI repair for the event, but not the expansion.':open?'Your earlier decisions left permissions unresolved. The original identity license ends 30 days after signing, and none of your agreements permits this interactive campaign. Repairing the original event and negotiating a new use are separate tasks.':'Your event materials have agreed permissions, but the original identity license ends 30 days after signing. Neither an approved recording, event artwork, nor ten AI greetings gives Seatline a year-long interactive Nova.'
    ],'What campaign will you authorize at this deadline?',[
      ['Your current boundary',wounded?'Nova’s refusal is an explicit fact, not a low relationship score. You cannot select a new extension today. Previously released material may still need withdrawal and follow-up.':'Only the uses and time periods actually agreed are authorized. An interactive host can generate new statements; it is different from a fixed image or prerecorded ad.'],
      [wounded?'The available repair':'A narrower new agreement is available',wounded?`An expressly approved replacement event package costs ${base.money(repair)}. Or postpone, withdraw the preview, and reopen negotiations later for $4,500; no future consent is guaranteed.`:`Seatline and the creators will agree to 90 days of identified fixed ads, not an interactive host. New funding is $8,000; permissions, compensation, and replacement work cost ${base.money(3600+repair-1200)}. Mara can arrange a 24-hour postponement of CROSSPLAY and its campaign launch as part of this agreement.`]
    ]);
    v.options[0].title=open?'Repair the event and keep it limited.':'Deliver the agreed event campaign only.';
    v.options[1].title=wounded?'Postpone and reopen the negotiations.':'Sign a new, limited 90-day ad agreement.';
    if(!wounded){
      v.options[1].body+=' Approve the producer’s 24-hour postponement of CROSSPLAY and its campaign launch.';
      v.options[1].trade=v.options[1].trade.replace('delay 24 hours.','CROSSPLAY and its campaign launch move back 24 hours.');
    }
    v.options[2].title='Release the year-long interactive campaign now.';
  }
  v.callback=plain(v.callback);
  v.messages=v.messages.map(([id,t])=>[id,plain(t)]);
  for(const o of v.options){o.title=plain(o.title);o.body=plain(o.body);o.trade=plain(o.trade);}
  return v;
}
function initial(){return {...base.initial(),version:VERSION};}
function scene(s){return decorate(base.scene(s),s);}
function choose(s,id,read=[]){
  const v=scene(s),o=v.options.find(o=>o.id===id);
  if(!o)throw Error('That choice is not available in this story.');
  const n=base.choose(s,id,read),h=n.history[n.history.length-1];
  Object.assign(h,{sceneTitle:v.title,title:o.title,body:o.body,trade:o.trade,callback:v.callback,outcome:h.outcome.map(plain)});
  // This variant concerns a new personal-channel promotion, not an existing clip edit.
  if(s.step===1&&s.scope==='creator'&&id==='assume')h.outcome=[
    'The additional promotion creates a conflict.',
    'Blaze and Rook object to the new personal-channel promotion. Seatline pauses it for clarification. Your agreement for two appearances did not authorize replacing Blaze’s personal sponsor. The dispute remains unresolved.',
    'The additional sponsorship objection follows your next campaign decision.'
  ];
  return n;
}
function rebuild(history){let s=initial();for(const h of history){s=choose(s,typeof h==='string'?h:h.option,typeof h==='string'?[]:h.evidence||[]);}return s;}
function documents(s){
  const docs=base.documents(s).map(d=>({title:plain(d.title),text:plain(d.text)}));
  const set=(title,text)=>{docs.find(d=>d.title===title).text=text;};
  const append=(title,text)=>{docs.find(d=>d.title===title).text+=' '+text;};
  if(s.step===0)set('Identity permission','No agreement has been signed yet. The three opening offers cover specified event uses for 30 days from signing; none includes AI imitations or ownership of the creators.');
  else append('Identity permission','Day 30 is measured from signing, not from the event.');
  if(s.history[1]?.option==='optin')append('Sponsor scope','Blaze and Rook also approved a separate, limited Seatline shoot in decision 2. That permission does not cover unrelated personal-channel material.');
  if(s.expanded){
    append('Sponsor scope','A separate follow-on agreement now adds 90 days of identified fixed ads; it does not authorize an interactive host.');
    append('Identity permission','The new 90-day agreement separately authorizes the specified fixed-ad identity uses in addition to the original event grant. It does not extend every original permission.');
    append('Media rights','The follow-on fixed-ad package has separately agreed component permissions and replacement material where needed.');
    if(s.fan==='ally')append('Fan art','For the follow-on package, Moth and Nova separately approved a paid 90-day extension of the official art. The original satire remains independent.');
  }
  if(s.launch==='reset'){
    docs.unshift({title:'Current campaign status',text:'Launch is postponed. Disputed uses have stopped; no campaign launches and no new Nova license is obtained today. Earlier uses may still need follow-up. Future permission is not guaranteed.'});
    if(s.scope==='broad'&&!s.sponsorOK)set('Sponsor scope','The broader chair proposal never received Rook’s waiver. The conditional $10,000 was not paid and is no longer part of this plan. Seatline accepted a written postponement; any restart needs a new agreement.');
    if(s.media==='uncleared')append('Media rights','This disputed trailer has now been withdrawn as part of the postponement; withdrawal does not retroactively clear its earlier use.');
    append('Voice / AI','The preview has now been withdrawn. Nova has not granted a new voice license.');
    set('Ending / retirement','The launch is paused while the parties reconsider scope and schedule. Stop disputed uses and address earlier releases; no replacement campaign or future license is presumed approved. Third-party copies may still remain.');
  }
  return docs;
}
function dealName(s){
  if(s.deal==='broad'&&s.scope==='event')return 'Event-only fallback agreement';
  if(s.scope==='broad'&&s.sponsorOK)return 'Agreed all-channel campaign';
  return base.dealName(s);
}
function ending(s){const e=base.ending(s);return {...e,title:plain(e.title),text:plain(e.text)};}
return Object.freeze({...base,VERSION,BRIEFING_VERSION,cast,glossary,setup,initial,scene,choose,rebuild,documents,dealName,ending});
});
