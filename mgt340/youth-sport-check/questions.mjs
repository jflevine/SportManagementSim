// Student-facing content only. Keep scoring logic and instructor guidance private.
export const ASSESSMENT = {
  id: 'mgt340-youth-sport-2026-11-05',
  title: 'The Youth Sport Desk',
  subtitle: 'Youth + High School Sport Knowledge Check',
  course: 'MGT 340',
  date: 'November 5, 2026',
  expectedMinutes: 15,
  totalPoints: 12,
  intro: 'You’re the newest hire at the Delaware Valley Youth Sport Alliance, a fictional nonprofit that works with schools, townships, and clubs around Philadelphia. Two files need your read before the board meets: how youth and school sport is governed, and the issues reshaping today’s field. Work through each item, then hand off your decisions.',
  instructions: 'Work individually. Choose one best answer for each multiple-choice question. For each brief response, give one short bullet per part. Phrases are fine. The alliance, companies, and people are fictional; cited figures come from published reports. Total: 12 points, with 6 points for each file.',
  pacing: 'Suggested pacing: 8 minutes for multiple choice, 6 minutes for brief responses, 1 minute to review.',
  sections: [
    { id: 'foundations', title: 'Foundations', topic: 'History, governance + principles', description: 'How youth and school sport is organized and governed.' },
    { id: 'issues', title: 'Today’s Field', topic: 'Current issues', description: 'Participation, cost, ownership, and NIL.' }
  ],
  reviewTitle: 'Ready for the board?',
  reviewText: 'Review all 10 decisions before submitting your handoff.',
  submittedTitle: 'Handoff received',
  submittedText: 'Your responses have been submitted. Brief responses will be reviewed by your instructor.'
};

export const QUESTIONS = [
  {
    id: 'q1', category: 'foundations', kind: 'mc', points: 1,
    title: 'The eligibility appeal',
    context: 'Your first file is a voicemail from a worried family.',
    prompt: 'A transfer student\'s family wants to challenge a ruling that he is ineligible for the Pennsylvania high school basketball playoffs. Which body is the final authority on athlete eligibility for those playoffs?',
    options: [
      { id: 'A', text: 'The National Federation of State High School Associations (NFHS)' },
      { id: 'B', text: 'The school\'s head basketball coach' },
      { id: 'C', text: 'The Pennsylvania Interscholastic Athletic Association (PIAA)' },
      { id: 'D', text: 'Little League International' }
    ]
  },
  {
    id: 'q2', category: 'foundations', kind: 'mc', points: 1,
    title: 'The rulebook question',
    context: 'A new board member asks who does what nationally.',
    prompt: 'Which of these is a core function of the NFHS?',
    options: [
      { id: 'A', text: 'Writing playing rules for high school sports and coordinating official certification' },
      { id: 'B', text: 'Deciding individual athletes\' eligibility for each state\'s playoffs' },
      { id: 'C', text: 'Owning and operating every state\'s high school championships' },
      { id: 'D', text: 'Hiring athletic directors for member high schools' }
    ]
  },
  {
    id: 'q3', category: 'foundations', kind: 'mc', points: 1,
    title: 'The lobby history panel',
    context: 'The alliance is drafting a history display for its lobby.',
    prompt: 'During and just after World War I, why did educators promote school sports for boys?',
    options: [
      { id: 'A', text: 'To generate ticket revenue that funded new school buildings' },
      { id: 'B', text: 'To comply with federal rules on equal athletic opportunity' },
      { id: 'C', text: 'To prepare top athletes for professional contracts' },
      { id: 'D', text: 'As physical training for the armed forces and to build social skills and school retention' }
    ]
  },
  {
    id: 'q4', category: 'foundations', kind: 'mc', points: 1,
    title: 'The fee policy',
    context: 'A local Little League board asks for a policy check.',
    prompt: 'Little League allows local leagues to charge registration fees. Which rule limits those fees?',
    options: [
      { id: 'A', text: 'Fees must be identical in every participating country' },
      { id: 'B', text: 'A fee cannot be a prerequisite for playing' },
      { id: 'C', text: 'Only all-star and travel teams may charge fees' },
      { id: 'D', text: 'Fees must be set by the state high school association' }
    ]
  },
  {
    id: 'q5', category: 'foundations', kind: 'brief', points: 2,
    title: 'The township decision',
    context: 'Prepare the foundations file.',
    prompt: 'A township parks director must decide whether to keep tackle football for ages 7–12 or switch to flag football.',
    parts: [
      { id: 'a', prompt: 'Name one programmatic goal that should guide the decision. (1 point)' },
      { id: 'b', prompt: 'Name one piece of evidence you would gather before deciding, and why. (1 point)' }
    ]
  },
  {
    id: 'q6', category: 'issues', kind: 'mc', points: 1,
    title: 'The participation numbers',
    context: 'Switch to the current-issues file.',
    prompt: 'Aspen Institute Project Play reports that 58% of youth ages 6–17 played on a team or took sports lessons in 2024, compared with 36.3% of children in the poorest households. Which conclusion is best supported?',
    options: [
      { id: 'A', text: 'Most children in low-income households are not interested in sports' },
      { id: 'B', text: 'Overall youth participation has fallen sharply since 2016–17' },
      { id: 'C', text: 'Participation differs substantially by household income, making access an equity issue' },
      { id: 'D', text: 'Girls now participate at higher rates than boys' }
    ]
  },
  {
    id: 'q7', category: 'issues', kind: 'mc', points: 1,
    title: 'The spending pitch',
    context: 'A club owner is pitching the board.',
    prompt: 'Families spent an average of $1,016 on a child\'s primary sport in 2024, up 46% since 2019. A club owner says this proves families value youth sport more than ever. What is the main weakness of that claim?',
    options: [
      { id: 'A', text: 'Higher spending can reflect higher prices, and it does not show who was priced out' },
      { id: 'B', text: 'The figure comes from the NFHS participation survey' },
      { id: 'C', text: 'The figure includes school district athletic budgets' },
      { id: 'D', text: 'The figure measures spending by professional teams on youth academies' }
    ]
  },
  {
    id: 'q8', category: 'issues', kind: 'mc', points: 1,
    title: 'The rink deal',
    context: 'A regional news alert lands in your inbox.',
    prompt: 'A company backed by private equity buys several youth ice rinks in a region. It launches a paid livestream service and bars families from recording games. Which governance concern does this most directly raise?',
    options: [
      { id: 'A', text: 'Officials\' status as independent contractors' },
      { id: 'B', text: 'Changes to the NFHS playing rules for hockey' },
      { id: 'C', text: 'Title IX requirements for athletic scholarships' },
      { id: 'D', text: 'Decisions about access, prices, and family video and data rest with a private owner outside school-based governance' }
    ]
  },
  {
    id: 'q9', category: 'issues', kind: 'mc', points: 1,
    title: 'The endorsement email',
    context: 'A parent forwards an offer from a local pizza shop.',
    prompt: 'Under the PIAA\'s name, image, and likeness (NIL) policy, which is true for a Pennsylvania high school athlete?',
    options: [
      { id: 'A', text: 'She may wear her school\'s logo in a paid endorsement' },
      { id: 'B', text: 'She may earn NIL compensation but may not use school or PIAA names or logos, and must report deals to her school' },
      { id: 'C', text: 'Her coach may arrange NIL deals for her' },
      { id: 'D', text: 'NIL compensation is prohibited for all Pennsylvania high school athletes' }
    ]
  },
  {
    id: 'q10', category: 'issues', kind: 'brief', points: 2,
    title: 'The buyout offer',
    context: 'Prepare the ownership file.',
    prompt: 'Keystone Play Holdings, a fictional company backed by a private-equity fund, offers to buy your nonprofit youth soccer club and build a turf dome.',
    parts: [
      { id: 'a', prompt: 'Name one term you would negotiate to protect families\' access or the club\'s accountability. (1 point)' },
      { id: 'b', prompt: 'Name one cost or risk of insisting on that term. (1 point)' }
    ]
  }
];
