window.RPG_DATA={
  archetypes:{
    strategist:{name:"Strategist",desc:"See patterns, sequence moves, and adapt before the market does.",bonuses:{Strategy:2,Finance:1}},
    community:{name:"Community Builder",desc:"Earn trust, grow participation, and build from the scene outward.",bonuses:{Community:2,Marketing:1}},
    producer:{name:"Event Producer",desc:"Turn plans into live experiences through operations, technology, and people.",bonuses:{Operations:2,Strategy:1}},
    dealmaker:{name:"Deal Maker",desc:"Connect audiences, sponsors, partners, and sustainable commercial value.",bonuses:{Marketing:2,Finance:1}}
  },
  colors:["#67d4df","#f2c75d","#c983e6","#79d38d","#f08b76","#7fa4ff"],
  zones:{
    grassroots:{name:"Grassroots Arcade",x:90,y:650,w:300,h:230,color:"#2c8f8b",npc:"maya",quest:"grassroots"},
    scholastic:{name:"Scholastic Lab",x:445,y:690,w:255,h:205,color:"#5386d5",npc:"rivera",quest:"scholastic"},
    creator:{name:"Creator Studio",x:760,y:675,w:255,h:215,color:"#9e63c9",npc:"nova",quest:"creator"},
    college:{name:"Campus Arena",x:1090,y:650,w:310,h:235,color:"#6278d8",npc:"brooks",quest:"college"},
    sponsor:{name:"Sponsorship Row",x:1190,y:335,w:285,h:210,color:"#c49333",npc:"marisol",quest:"sponsor"},
    publisher:{name:"Publisher Tower",x:865,y:145,w:300,h:235,color:"#5470b8",npc:"ana",quest:"publisher"},
    pro:{name:"Pro District",x:505,y:145,w:285,h:235,color:"#b75065",npc:"malik",quest:"pro"},
    event:{name:"Global Event Center",x:115,y:150,w:315,h:250,color:"#347d73",npc:"jo",quest:"event"},
    boardroom:{name:"Ecosystem Boardroom",x:675,y:410,w:260,h:170,color:"#d29a38",npc:"atlas",quest:"finale"}
  },
  npcs:{
    maya:{name:"Maya Chen",role:"Community Organizer",initials:"MC",zone:"grassroots",x:250,y:615,color:"#2c8f8b"},
    rivera:{name:"Coach Rivera",role:"Scholastic Esports Director",initials:"CR",zone:"scholastic",x:575,y:655,color:"#5386d5"},
    nova:{name:"Nova Reyes",role:"Creator & Broadcast Producer",initials:"NR",zone:"creator",x:890,y:640,color:"#9e63c9"},
    brooks:{name:"Dean Brooks",role:"Campus Program Sponsor",initials:"DB",zone:"college",x:1245,y:615,color:"#6278d8"},
    marisol:{name:"Marisol Vega",role:"Brand Partnerships Director",initials:"MV",zone:"sponsor",x:1335,y:300,color:"#c49333"},
    ana:{name:"Ana Okafor",role:"Publisher Partnerships Lead",initials:"AO",zone:"publisher",x:1015,y:110,color:"#5470b8"},
    malik:{name:"Malik Grant",role:"Professional Team GM",initials:"MG",zone:"pro",x:650,y:110,color:"#b75065"},
    jo:{name:"Jo Park",role:"International Event Director",initials:"JP",zone:"event",x:275,y:115,color:"#347d73"},
    atlas:{name:"Atlas",role:"Ecosystem Intelligence System",initials:"AI",zone:"boardroom",x:805,y:375,color:"#d29a38"}
  },
  items:{
    community_playbook:{name:"Community Playbook",desc:"A reminder that durable esports ecosystems grow with their communities."},
    school_mou:{name:"School Partnership MOU",desc:"A framework connecting competition, learning, inclusion, and school goals."},
    media_kit:{name:"Creator Media Kit",desc:"Audience segments, programming formats, and distribution insights."},
    campus_map:{name:"Campus Governance Map",desc:"Who owns decisions, budgets, facilities, academics, and student experience."},
    sponsor_brief:{name:"Sponsor Activation Brief",desc:"Audience fit, value exchange, deliverables, and activation logic."},
    tournament_license:{name:"Tournament License",desc:"Proof that publisher permissions shape what independent operators can build."},
    runway_sheet:{name:"Runway Sheet",desc:"A pro-organization cost model built to survive beyond the hype cycle."},
    event_ops_plan:{name:"Event Operations Plan",desc:"Redundancy, player experience, broadcast continuity, and live-event priorities."},
    ecosystem_key:{name:"Ecosystem Key",desc:"A synthesis artifact earned by connecting every layer of the ecosystem."}
  },
  quests:{
    grassroots:{
      title:"The First Bracket",sector:"Grassroots",xp:130,item:"community_playbook",skill:"Community",
      intro:[
        "Welcome to the Grassroots Arcade. Eight PCs, one projector, a Discord server, and a community that actually cares. That's enough to start.",
        "A sponsor offered us a little cash. The temptation is to make the first event look huge. But a scene is not the same thing as a spectacle.",
        "Help me build a tournament people will want to come back to."
      ],
      decision:{prompt:"What should the operation protect first?",choices:[
        {title:"A giant prize pool",text:"Put nearly everything into prize money so the event looks prestigious.",effects:{relationships:{Community:-8},skills:{Finance:1}},flag:"grass_prize"},
        {title:"A reliable, welcoming event",text:"Prioritize stable tech, people, clear rules, and community experience before chasing scale.",effects:{relationships:{Community:12},skills:{Community:1,Operations:1}},flag:"grass_fit"},
        {title:"A premium VIP product",text:"Design the event around a small group of high-spending guests.",effects:{relationships:{Community:-3,Sponsors:3},skills:{Marketing:1}},flag:"grass_vip"}
      ]},
      mini:"budget",lesson:"The management lesson from esports history is not 'never scale.' It is to scale from ecosystem fit. Distribution, capital, and production can accelerate growth, but they do not substitute for a community that wants the product."
    },
    scholastic:{
      title:"School Night",sector:"Scholastic",xp:120,item:"school_mou",skill:"Community",
      intro:["The district approved a pilot, but administrators are asking the right question: what educational value does esports create beyond simply letting students play?","Design a program that can survive scrutiny from students, families, teachers, and administrators."],
      decision:{prompt:"Which program promise is strongest?",choices:[
        {title:"Win first",text:"Build an elite roster, specialize early, and judge success mainly by championships.",effects:{relationships:{Schools:-7},skills:{Strategy:1}},flag:"school_elite"},
        {title:"Play + learn + belong",text:"Combine competition with teamwork, communication, belonging, production, business, and career exploration.",effects:{relationships:{Schools:13,Community:5},skills:{Community:1,Marketing:1}},flag:"school_dev"},
        {title:"Technology showcase",text:"Focus the entire program on expensive equipment and visible hardware.",effects:{relationships:{Schools:-2,Sponsors:3},skills:{Operations:1}},flag:"school_tech"}
      ]},
      mini:"titleSelect",lesson:"Scholastic esports creates value when competition connects to participation, education, social development, and broader career pathways. The strongest program is not automatically the one with the most expensive setup or the most elite roster."
    },
    creator:{
      title:"Signal Boost",sector:"Streaming & Creators",xp:120,item:"media_kit",skill:"Marketing",
      intro:["A tournament with no audience is a private match. Distribution technologies repeatedly changed who could watch, who could participate, and what businesses could exist around competition.","Build a creator strategy for a small circuit that needs discovery without losing its core community."],
      decision:{prompt:"What is your first programming strategy?",choices:[
        {title:"One giant monthly broadcast",text:"Spend most of the budget on one highly produced stream and stay silent between events.",effects:{relationships:{Creators:-4},skills:{Operations:1}},flag:"creator_spectacle"},
        {title:"Always-on story engine",text:"Use event broadcasts, creator co-streams, short-form clips, player stories, and community programming between competitions.",effects:{relationships:{Creators:12,Community:5},skills:{Marketing:2}},flag:"creator_network"},
        {title:"Paywall immediately",text:"Put all content behind a subscription before building an audience habit.",effects:{relationships:{Creators:-8},skills:{Finance:1}},flag:"creator_paywall"}
      ]},
      mini:"audience",lesson:"Distribution is not merely promotion. In esports, shifts from LANs to broadband to streaming repeatedly changed participation, audience formation, and monetization possibilities."
    },
    college:{
      title:"Campus Crossroads",sector:"Collegiate",xp:130,item:"campus_map",skill:"Strategy",
      intro:["The university president wants esports. Athletics wants competition. Student life wants belonging. An academic dean wants curriculum. Recreation controls the room and equipment.","There is no single universal institutional home. Your job is to make the structure legible."],
      decision:{prompt:"What do you recommend?",choices:[
        {title:"Athletics owns everything",text:"Put all decisions under athletics because esports must copy traditional sport structures.",effects:{relationships:{Campus:-5},skills:{Strategy:1}},flag:"campus_athletics"},
        {title:"Student club only",text:"Avoid institutional coordination and leave the entire operation to students.",effects:{relationships:{Campus:-4,Community:3},skills:{Community:1}},flag:"campus_club"},
        {title:"Purpose-led hybrid",text:"Define goals first, then assign competition, academics, student experience, facilities, and budget authority across a clear hybrid structure.",effects:{relationships:{Campus:14,Schools:4},skills:{Strategy:2,Operations:1}},flag:"campus_hybrid"}
      ]},
      mini:"orgMap",lesson:"Collegiate esports is organizationally diverse. Good management begins by clarifying purpose, authority, resources, and stakeholder responsibilities rather than assuming one traditional-sport template fits every campus."
    },
    sponsor:{
      title:"Brand Match",sector:"Sponsorship",xp:125,item:"sponsor_brief",skill:"Marketing",
      intro:["A sponsor does not buy 'esports.' It buys access to a particular audience, property, story, community, or behavior it values.","Your brand partner wants an activation that people remember instead of another logo wall."],
      decision:{prompt:"Which activation creates the strongest value exchange?",choices:[
        {title:"Logo saturation",text:"Put the brand mark on every available surface and call impressions the strategy.",effects:{relationships:{Sponsors:-4,Community:-3},skills:{Marketing:1}},flag:"sponsor_logos"},
        {title:"Community utility",text:"Fund a creator-led skills lab and tournament feature that serves the audience while naturally integrating the brand.",effects:{relationships:{Sponsors:13,Community:6,Creators:4},skills:{Marketing:2}},flag:"sponsor_utility"},
        {title:"Celebrity only",text:"Spend the budget on one famous personality without connecting the activation to the property or audience journey.",effects:{relationships:{Sponsors:-2},skills:{Finance:1}},flag:"sponsor_celeb"}
      ]},
      mini:"sponsorMatch",lesson:"Sponsorship works when the property, audience, objectives, and activation fit. Commercial value is created through a relationship, not by counting logos in isolation."
    },
    publisher:{
      title:"The License Gate",sector:"Publisher",xp:145,item:"tournament_license",skill:"Governance",
      intro:["Your circuit is growing. That makes the publisher interested—and important. You can build community demand, production capability, and sponsorship, but the game itself remains someone else's intellectual property.","Negotiate a path that preserves enough flexibility to operate while respecting the publisher's role as a gatekeeper."],
      decision:{prompt:"What is your strongest opening position?",choices:[
        {title:"We built the community, so permission is unnecessary",text:"Treat grassroots legitimacy as a substitute for publisher rights and licensing.",effects:{relationships:{Publisher:-14,Community:2},skills:{Governance:1}},flag:"pub_defy"},
        {title:"Seek a workable license",text:"Clarify permitted competition, broadcast, monetization, data, brand use, technical support, and change/termination rights.",effects:{relationships:{Publisher:14,Sponsors:3},skills:{Governance:2,Strategy:1}},flag:"pub_license"},
        {title:"Give the publisher total control",text:"Accept any term without considering your own operational or commercial dependencies.",effects:{relationships:{Publisher:8,Sponsors:-5},skills:{Governance:1}},flag:"pub_surrender"}
      ]},
      mini:"license",lesson:"Publishers possess distinctive structural power because esports competition depends on privately owned software, licensing, and technical infrastructure. Managers must understand both the permission and the dependency created by the relationship."
    },
    pro:{
      title:"Franchise Fever",sector:"Professional",xp:150,item:"runway_sheet",skill:"Finance",
      intro:["The pro team has audience, talent, sponsors—and a cost structure built for a growth curve that never arrived. The board keeps saying, 'Once we get bigger, the economics will work.'","Esports Winter made that sentence expensive. Give them a model that can survive."],
      decision:{prompt:"Which turnaround principle should drive the plan?",choices:[
        {title:"Double down on fixed costs",text:"Expand staff, facilities, and player spending before proving durable revenue.",effects:{relationships:{Pro:-8,Sponsors:-3},skills:{Finance:1}},flag:"pro_double"},
        {title:"Match costs to repeatable value",text:"Protect the strongest audience and competitive assets, reduce weak fixed costs, diversify revenue, and preserve runway.",effects:{relationships:{Pro:14,Sponsors:5},skills:{Finance:2,Strategy:1}},flag:"pro_runway"},
        {title:"Cut everything visible",text:"Slash competition, content, and community programs equally to improve the next quarter.",effects:{relationships:{Pro:-4,Community:-7},skills:{Finance:1}},flag:"pro_cut"}
      ]},
      mini:"runway",lesson:"Outside money can accelerate esports, but it can also hide weak fundamentals. Sustainable professional models align costs, audience value, competitive strategy, and revenue rather than assuming scale will eventually solve the model."
    },
    event:{
      title:"Championship Night",sector:"Events",xp:150,item:"event_ops_plan",skill:"Operations",
      intro:["The venue is sold out. Players are arriving. The stream goes live in ninety minutes. Event management is where every stakeholder dependency becomes operational.","You cannot maximize everything. Prioritize what keeps the competition credible, playable, watchable, and safe."],
      decision:{prompt:"What is the operating principle for the final ninety minutes?",choices:[
        {title:"Protect the show first",text:"Prioritize stage aesthetics even if network redundancy and player processes remain unresolved.",effects:{relationships:{EventPartners:-7,Players:-4},skills:{Marketing:1}},flag:"event_show"},
        {title:"Protect critical dependencies",text:"Secure network redundancy, player readiness, competition integrity, broadcast continuity, and clear escalation paths before secondary enhancements.",effects:{relationships:{EventPartners:14,Players:7},skills:{Operations:2,Governance:1}},flag:"event_resilience"},
        {title:"Let each vendor self-manage",text:"Avoid centralized coordination so every specialist can move faster.",effects:{relationships:{EventPartners:-9},skills:{Operations:1}},flag:"event_silo"}
      ]},
      mini:"ops",lesson:"Esports event quality emerges from coordinated dependencies: venue, technology, players, rules, production, partners, and audience experience. Live operations expose weak handoffs immediately."
    },
    finale:{
      title:"Esports Winter: Your Turn",sector:"Finale",xp:250,item:"ecosystem_key",skill:"Strategy",
      intro:["Atlas has one final simulation. Investment across the industry contracts. One sponsor pauses spending. Player costs remain high. Your audience is stable but fragmented across creators and platforms.","You have built relationships across the ecosystem. Now prove the organization can adapt instead of simply shrinking."],
      decision:{prompt:"Choose the philosophy that will guide your final plan.",choices:[
        {title:"Return to hype",text:"Chase the biggest possible valuation story and assume new capital will restore the old model.",effects:{relationships:{Sponsors:-5,Community:-4},skills:{Marketing:1}},flag:"final_hype"},
        {title:"Build the ecosystem",text:"Protect community demand, flexible distribution, diversified pathways, rights clarity, operational resilience, and disciplined economics.",effects:{relationships:{Community:8,Sponsors:6,Publisher:4,Pro:5},skills:{Strategy:2,Finance:1}},flag:"final_ecosystem"},
        {title:"Retreat to one segment",text:"Abandon every segment except professional competition and wait for the market to recover.",effects:{relationships:{Schools:-6,Campus:-6,Creators:-5},skills:{Finance:1}},flag:"final_retreat"}
      ]},
      mini:"turnaround",lesson:"History does not hand managers a permanent winning formula. It reveals recurring questions: does the model fit the community, can distribution reach people, does capital strengthen or distort the model, and can the organization adapt when conditions change?"
    }
  }
};