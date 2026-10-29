// Student-facing content only. Keep scoring logic and instructor guidance private.
export const ASSESSMENT = {
  id: 'mgt340-sales-sponsorship-2026-10-29',
  title: 'The Philly Sports Desk',
  subtitle: 'Sales + Sponsorship Knowledge Check',
  course: 'MGT 340',
  date: 'October 29, 2026',
  expectedMinutes: 15,
  totalPoints: 12,
  intro: 'You’re on the revenue team at a fictional Philadelphia sports agency. Two files need a recommendation before the team huddle: a ticket package and a coffee sponsorship. Review the desk’s account notes and partner materials, then hand off your decisions.',
  instructions: 'Work individually. Choose one best answer for each multiple-choice question. For each brief response, give one short bullet per part. Phrases are fine. All scenarios and amounts are hypothetical. Total: 12 points, with 6 points for each topic.',
  pacing: 'Suggested pacing: 8 minutes for multiple choice, 6 minutes for brief responses, 1 minute to review.',
  sections: [
    { id: 'sales', title: 'Ticket Desk', description: 'Prepare the ticket recommendation.' },
    { id: 'sponsorship', title: 'Partner Desk', description: 'Prepare the sponsorship recommendation.' }
  ],
  reviewTitle: 'Ready for the huddle?',
  reviewText: 'Review all 10 decisions before submitting your handoff.',
  submittedTitle: 'Handoff received',
  submittedText: 'Your responses have been submitted. Brief responses will be reviewed by your instructor.'
};

export const QUESTIONS = [
  {
    id: 'q1', category: 'sales', kind: 'mc', points: 1,
    title: 'The account card',
    context: 'Start with the account queue.',
    prompt: 'A former ticket buyer used four of eight games and opened recent team emails. What is the best use of this CRM information?',
    options: [
      { id: 'A', text: 'Prepare a price reduction because unused games indicate a cost problem.' },
      { id: 'B', text: 'Prepare questions about attendance, current needs, and reasons for not renewing.' },
      { id: 'C', text: 'Treat the email opens as a reliable forecast that the buyer will renew.' },
      { id: 'D', text: 'Offer a larger package because continued email engagement signals demand.' }
    ]
  },
  {
    id: 'q2', category: 'sales', kind: 'mc', points: 1,
    title: 'The next call',
    context: 'A different buyer calls.',
    prompt: 'A buyer says, “I can afford the eight-game plan, but work lets me attend only three games.” Which purchase factors most directly explain the concern?',
    options: [
      { id: 'A', text: 'Quality and cost' },
      { id: 'B', text: 'Cost and quantity' },
      { id: 'C', text: 'Quality and time' },
      { id: 'D', text: 'Quantity and time' }
    ]
  },
  {
    id: 'q3', category: 'sales', kind: 'mc', points: 1,
    title: 'The package conversation',
    context: 'Check a business-sales inquiry.',
    prompt: 'A business buyer needs help planning client visits. The package includes a planning call. Which response best illustrates PROvide?',
    options: [
      { id: 'A', text: '“The included planning call can help you organize those client visits.”' },
      { id: 'B', text: '“The package includes two seats for eight home games.”' },
      { id: 'C', text: '“How many client visits would you like to arrange?”' },
      { id: 'D', text: '“Would you like me to send the agreement today?”' }
    ]
  },
  {
    id: 'q4', category: 'sales', kind: 'mc', points: 1,
    title: 'The account manager’s note',
    context: 'Review another account’s history.',
    prompt: 'An account manager gives a client guidance on planning game-day visits, then continues helping throughout the season so the tickets are used well. Which technique most specifically describes this continuing assistance?',
    options: [
      { id: 'A', text: 'Upselling' },
      { id: 'B', text: 'Social media selling' },
      { id: 'C', text: 'Eduselling' },
      { id: 'D', text: 'Benefit selling' }
    ]
  },
  {
    id: 'q5', category: 'sales', kind: 'brief', points: 2,
    title: 'Morgan’s recommendation',
    context: 'Prepare the ticket file.',
    prompt: 'Morgan says, “My shifts let me attend only three Sundays, and I don’t want to pay for games we won’t use.” The only authorized package is two seats for eight home games at $2,400, with free transfer to another person. You cannot invent a smaller plan, discount, refund, or resale guarantee.',
    parts: [
      { id: 'a', prompt: 'Write one question that would help you decide whether this package fits Morgan. (1 point)' },
      { id: 'b', prompt: 'Based on what you know now, recommend a next step and give the reason. (1 point)' }
    ]
  },
  {
    id: 'q6', category: 'sponsorship', kind: 'mc', points: 1,
    title: 'The partner offer',
    context: 'Switch to the partnership queue.',
    prompt: 'A beverage company supplies drinks to a team in exchange for permission to call itself an official partner. What makes this a sponsorship rather than a simple product donation?',
    options: [
      { id: 'A', text: 'The company provides useful products instead of paying cash.' },
      { id: 'B', text: 'The company expects fans to feel goodwill toward its brand.' },
      { id: 'C', text: 'The team distributes the drinks at its sporting events.' },
      { id: 'D', text: 'The company receives negotiated commercial association rights.' }
    ]
  },
  {
    id: 'q7', category: 'sponsorship', kind: 'mc', points: 1,
    title: 'The proposed budget',
    context: 'A budget awaits your check.',
    prompt: 'A sponsor budgets $40,000 for rights, $15,000 to staff and supply an activation, and $5,000 for measurement. What is the plan’s all-in cost?',
    options: [
      { id: 'A', text: '$60,000' },
      { id: 'B', text: '$40,000' },
      { id: 'C', text: '$45,000' },
      { id: 'D', text: '$55,000' }
    ]
  },
  {
    id: 'q8', category: 'sponsorship', kind: 'mc', points: 1,
    title: 'The advertisement idea',
    context: 'Next comes a proposed advertisement.',
    prompt: 'A contract grants team-mark use and official beverage status at home events. The sponsor wants to feature a player’s image in an advertisement. What should it do first?',
    options: [
      { id: 'A', text: 'Use the image if the advertisement also displays the approved team mark.' },
      { id: 'B', text: 'Treat category exclusivity as permission to feature the team’s players.' },
      { id: 'C', text: 'Verify the relevant image rights and approvals before using the player.' },
      { id: 'D', text: 'Use a publicly posted player photograph and credit the photographer.' }
    ]
  },
  {
    id: 'q9', category: 'sponsorship', kind: 'mc', points: 1,
    title: 'The results slide',
    context: 'Review a sponsor’s campaign report.',
    prompt: 'A sponsor reports one million impressions and $60,000 in campaign-code sales. What additional evidence is needed to make a credible financial ROI claim?',
    options: [
      { id: 'A', text: 'The total number of impressions earned by competing sponsors.' },
      { id: 'B', text: 'A credible estimate of incremental profit and the full sponsorship cost.' },
      { id: 'C', text: 'All company revenue during the event, whether or not the campaign affected it.' },
      { id: 'D', text: 'The rights fee and the total sales value of every campaign-code purchase.' }
    ]
  },
  {
    id: 'q10', category: 'sponsorship', kind: 'brief', points: 2,
    title: 'The finish-line plan',
    context: 'Prepare the coffee sponsorship file.',
    prompt: 'Fishtown Fuel pays $30,000 to a Philadelphia 5K. Its rights include “Official Coffee” status, a shirt logo, and sampling inside the finish area. Its objective is to have 3,000 runners who have never tried its new cold brew taste it.',
    parts: [
      { id: 'a', prompt: 'Name one listed right and an activation that uses it to support the objective. (1 point)' },
      { id: 'b', prompt: 'Name a measure that would show whether the first-time tasting objective was met. (1 point)' }
    ]
  }
];
