// Public prompts only. The grading rubric and explanations stay on the server.
export const assessment = {
  "assessmentId": "mgt340-knowledge-check-2",
  "assessmentVersion": "mgt340-kc2-v1",
  "title": "Rivalry Night: Ready to Open",
  "subtitle": "Knowledge Check 2 · MGT 340",
  "estimatedMinutes": 10,
  "totalPoints": 10,
  "instructions": [
    "Work individually. Choose one answer for each question.",
    "There are five finance questions and five legal questions, worth one point each.",
    "You can revise your choices before submitting. Each question includes the facts you need."
  ],
  "intro": "You’re the event manager at Forge Arena, preparing for River City versus Northside. Follow Rivalry Night from its budget briefing to the arena walkthrough, early arrivals, and a last-minute decision before tipoff.",
  "story": "One event unfolds in a fixed sequence. Each question is scored separately. All teams, people, organizations, and amounts are fictional.",
  "questions": [
    {
      "id": "q1",
      "section": "finance",
      "points": 1,
      "title": "Will the event make money?",
      "context": "The event budget projects $12,000 in total revenue and $9,000 in total expenses.",
      "stem": "Using only these figures, what is the event’s expected profit?",
      "options": [
        {
          "id": "a",
          "text": "$12,000"
        },
        {
          "id": "b",
          "text": "$3,000"
        },
        {
          "id": "c",
          "text": "$21,000"
        }
      ],
      "stage": "Monday · Budget briefing",
      "transition": "Rivalry Night is coming. Your first task is to review the event budget."
    },
    {
      "id": "q2",
      "section": "finance",
      "points": 1,
      "title": "Pick the right report",
      "context": "You are choosing the report now. After Rivalry Night, it will need to show the event’s revenue, expenses, and profit for the event period.",
      "stem": "Which financial statement fits that purpose?",
      "options": [
        {
          "id": "a",
          "text": "Balance sheet"
        },
        {
          "id": "b",
          "text": "Statement of cash flows"
        },
        {
          "id": "c",
          "text": "Income statement (profit and loss statement)"
        }
      ],
      "stage": "Same briefing · Plan the review",
      "transition": "Before leaving the budget briefing, you plan how to review the event afterward."
    },
    {
      "id": "q3",
      "section": "finance",
      "points": 1,
      "title": "The loan arrives",
      "context": "Forge Arena receives a $2,000 bank loan to help prepare for Rivalry Night.",
      "stem": "When the loan arrives, what increases?",
      "options": [
        {
          "id": "a",
          "text": "Cash and a liability"
        },
        {
          "id": "b",
          "text": "Revenue and profit"
        },
        {
          "id": "c",
          "text": "Revenue and owners’ equity"
        }
      ],
      "stage": "Midweek · Funding update",
      "transition": "The planning file moves forward. A funding update arrives from finance."
    },
    {
      "id": "q4",
      "section": "finance",
      "points": 1,
      "title": "Is the upgrade worth it?",
      "context": "A reusable ticket-scanning upgrade costs $2,000. It is expected to produce $200 in net benefit each year, after its annual operating costs.",
      "stem": "What is the upgrade’s simple expected annual ROI?",
      "options": [
        {
          "id": "a",
          "text": "20%"
        },
        {
          "id": "b",
          "text": "100%"
        },
        {
          "id": "c",
          "text": "10%"
        }
      ],
      "stage": "Same meeting · Equipment proposal",
      "transition": "Next, the operations team brings you a proposal for handling the arriving crowd."
    },
    {
      "id": "q5",
      "section": "finance",
      "points": 1,
      "title": "A rival is also a partner",
      "context": "River City and Northside compete to win, but they cooperate on scheduling and promoting Rivalry Night.",
      "stem": "Why does that cooperation make economic sense?",
      "options": [
        {
          "id": "a",
          "text": "Only the home team creates the event’s value"
        },
        {
          "id": "b",
          "text": "Both teams help produce the game that fans pay to see"
        },
        {
          "id": "c",
          "text": "Cooperating makes the teams’ revenues equal"
        }
      ],
      "stage": "Friday · Coordinate the rivals",
      "transition": "The arena plans are taking shape. You join River City and Northside’s event meeting."
    },
    {
      "id": "q6",
      "section": "legal",
      "points": 1,
      "title": "A plan that staff can use",
      "context": "Forge Arena has written a spill-response plan, but nobody has trained the ushers or put the procedures into practice.",
      "stem": "Which part of the D.I.M. process needs attention now?",
      "options": [
        {
          "id": "a",
          "text": "Implement the plan"
        },
        {
          "id": "b",
          "text": "Develop the plan"
        },
        {
          "id": "c",
          "text": "Manage and revise the working plan"
        }
      ],
      "stage": "Saturday · Final walkthrough",
      "transition": "Planning gives way to the arena walkthrough. You check the spill-response plan."
    },
    {
      "id": "q7",
      "section": "legal",
      "points": 1,
      "title": "A spectator reports an injury",
      "context": "A spectator says they slipped on a spill and were injured because arena staff failed to take reasonable care.",
      "stem": "Which area of law most directly fits this claim?",
      "options": [
        {
          "id": "a",
          "text": "Trademark law"
        },
        {
          "id": "b",
          "text": "Antitrust law"
        },
        {
          "id": "c",
          "text": "Tort law, specifically negligence"
        }
      ],
      "stage": "Early entry · Incident report",
      "transition": "As early spectators arrive, a spill-related incident report reaches your desk."
    },
    {
      "id": "q8",
      "section": "legal",
      "points": 1,
      "title": "Who represents the arena?",
      "context": "Forge Arena authorizes Jordan to negotiate a Rivalry Night sponsorship on its behalf and under its direction. Jordan agrees.",
      "stem": "Who is the agent in this relationship?",
      "options": [
        {
          "id": "a",
          "text": "Jordan"
        },
        {
          "id": "b",
          "text": "Forge Arena"
        },
        {
          "id": "c",
          "text": "The prospective sponsor"
        }
      ],
      "stage": "Before tipoff · Sponsor check-in",
      "transition": "Alongside the incident report, sponsorship arrangements still need your attention. Jordan checks in."
    },
    {
      "id": "q9",
      "section": "legal",
      "points": 1,
      "title": "What is being exchanged?",
      "context": "A sponsor promises to pay $1,000. In return, Forge Arena promises a courtside sign and two public-address announcements.",
      "stem": "Which contract concept is illustrated by these exchanged promises?",
      "options": [
        {
          "id": "a",
          "text": "Capacity"
        },
        {
          "id": "b",
          "text": "Consideration"
        },
        {
          "id": "c",
          "text": "Injunctive relief"
        }
      ],
      "stage": "Same check-in · Review the deal",
      "transition": "Jordan brings you the proposed sponsorship terms for a final review."
    },
    {
      "id": "q10",
      "section": "legal",
      "points": 1,
      "title": "A decision before tipoff",
      "context": "One hour before tipoff, the league bars Northside from playing, saying its roster paperwork arrived late. Northside disputes that decision and asks a court to temporarily stop the league from enforcing the ban so the team can play tonight. It is not asking for money.",
      "stem": "What type of remedy is Northside requesting?",
      "options": [
        {
          "id": "a",
          "text": "Monetary damages"
        },
        {
          "id": "b",
          "text": "A finding of breach of contract"
        },
        {
          "id": "c",
          "text": "Injunctive relief"
        }
      ],
      "stage": "Tipoff approaches · A late complication",
      "transition": "Just as the event preparations come together, Northside’s participation is suddenly in question."
    }
  ]
};
