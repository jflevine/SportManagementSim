// Student-facing content only. Grading stays on the private server.
export const ASSESSMENT = {
  "id": "mgt340-youth-sport-v2",
  "title": "The Youth Sport Desk",
  "subtitle": "Youth + High School Sport Knowledge Check",
  "course": "MGT 340",
  "date": "Week 10",
  "expectedMinutes": 15,
  "totalPoints": 12,
  "intro": "You’re the newest hire at the Delaware Valley Youth Sport Alliance, a fictional nonprofit that works with schools, townships, and clubs around Philadelphia. Two files need your read before the board meets: how youth and school sport is governed, and the issues reshaping today’s field. Work through each item, then hand off your decisions.",
  "instructions": "Work individually. This is an open-notes knowledge check. Choose one best answer for each multiple-choice question. For each brief response, give one short bullet per part. Phrases are fine. The alliance, companies, and people are fictional; cited figures come from published reports. Total: 12 points, with 6 points for each file.",
  "pacing": "Suggested pacing: 8 minutes for multiple choice, 6 minutes for brief responses, 1 minute to review.",
  "sections": [
    {
      "id": "foundations",
      "title": "Foundations",
      "topic": "History, governance + principles",
      "description": "How youth and school sport is organized and governed."
    },
    {
      "id": "issues",
      "title": "Today’s Field",
      "topic": "Current issues",
      "description": "Participation, cost, ownership, and NIL."
    }
  ],
  "reviewTitle": "Ready for the board?",
  "reviewText": "Review all 10 decisions before submitting your handoff.",
  "submittedTitle": "Handoff received",
  "submittedText": "Your responses have been submitted. Brief responses will be reviewed by your instructor."
};

export const QUESTIONS = [
  {
    "id": "q1",
    "kind": "mc",
    "points": 1,
    "title": "The eligibility appeal",
    "prompt": "A transfer student's family wants to challenge a PIAA eligibility ruling for Pennsylvania high school basketball playoffs. Within the association's eligibility and appeal process, which organization governs those playoffs?",
    "options": [
      {
        "id": "A",
        "text": "The National Federation of State High School Associations (NFHS)"
      },
      {
        "id": "B",
        "text": "The school's head basketball coach"
      },
      {
        "id": "C",
        "text": "The Pennsylvania Interscholastic Athletic Association (PIAA)"
      },
      {
        "id": "D",
        "text": "Little League International"
      }
    ],
    "category": "foundations",
    "context": "Your first file is a voicemail from a worried family."
  },
  {
    "id": "q2",
    "kind": "mc",
    "points": 1,
    "title": "The rulebook question",
    "prompt": "Which of these is a core function of the NFHS?",
    "options": [
      {
        "id": "A",
        "text": "Developing playing rules and providing education and training resources for high school coaches and officials"
      },
      {
        "id": "B",
        "text": "Deciding individual athletes’ eligibility for each state’s playoffs"
      },
      {
        "id": "C",
        "text": "Owning and operating every state’s high school championships"
      },
      {
        "id": "D",
        "text": "Hiring athletic directors for member high schools"
      }
    ],
    "category": "foundations",
    "context": "A new board member asks who does what nationally."
  },
  {
    "id": "q3",
    "kind": "mc",
    "points": 1,
    "title": "The lobby history panel",
    "prompt": "According to the chapter, during and just after World War I, why did educators promote school sports for boys?",
    "options": [
      {
        "id": "A",
        "text": "To generate ticket revenue that funded new school buildings"
      },
      {
        "id": "B",
        "text": "To comply with federal rules on equal athletic opportunity"
      },
      {
        "id": "C",
        "text": "To prepare top athletes for professional contracts"
      },
      {
        "id": "D",
        "text": "As physical training for the armed forces and to build social skills and school retention"
      }
    ],
    "category": "foundations",
    "context": "The alliance is drafting a history display for its lobby."
  },
  {
    "id": "q4",
    "kind": "mc",
    "points": 1,
    "title": "The fee policy",
    "prompt": "A local Little League program requests a registration fee. Which policy is consistent with Little League’s access rule?",
    "options": [
      {
        "id": "A",
        "text": "Fees must be identical in every participating country"
      },
      {
        "id": "B",
        "text": "Payment cannot be a prerequisite for participation; inability to pay must not exclude an otherwise eligible child"
      },
      {
        "id": "C",
        "text": "Only all-star and travel teams may charge fees"
      },
      {
        "id": "D",
        "text": "Fees must be set by the state high school association"
      }
    ],
    "category": "foundations",
    "context": "A local Little League board asks for a policy check."
  },
  {
    "id": "q5",
    "kind": "brief",
    "points": 2,
    "title": "The township decision",
    "prompt": "A township parks director must decide whether to keep tackle football for ages 7–12 or switch to flag football.",
    "parts": [
      {
        "id": "a",
        "prompt": "Name one programmatic goal that should guide the decision. (1 point)"
      },
      {
        "id": "b",
        "prompt": "Name one piece of evidence you would gather before deciding, and explain why it matters. (1 point)"
      }
    ],
    "category": "foundations",
    "context": "Prepare the foundations file."
  },
  {
    "id": "q6",
    "kind": "mc",
    "points": 1,
    "title": "The participation numbers",
    "prompt": "Project Play reports that 58% of U.S. youth ages 6–17 played on a team or took sports lessons during the preceding year in the 2024 National Survey of Children’s Health. Participation was 36.3% among children in households below the federal poverty threshold. Which conclusion is best supported?",
    "options": [
      {
        "id": "A",
        "text": "Most children in low-income households are not interested in sports"
      },
      {
        "id": "B",
        "text": "Overall youth participation has fallen sharply since 2016–17"
      },
      {
        "id": "C",
        "text": "Participation differs substantially by household income, making access an equity issue"
      },
      {
        "id": "D",
        "text": "Girls now participate at higher rates than boys"
      }
    ],
    "category": "issues",
    "context": "Switch to the current-issues file."
  },
  {
    "id": "q7",
    "kind": "mc",
    "points": 1,
    "title": "The spending pitch",
    "prompt": "Project Play’s parent survey reported average 2024 spending of $1,016 on a child’s primary sport, up 46% from 2019, among surveyed parents of children ages 6–18 who regularly played sports. A club owner says this proves families value youth sport more than ever. What is the main weakness of that claim?",
    "options": [
      {
        "id": "A",
        "text": "Higher spending can reflect higher prices, and it does not show who was priced out"
      },
      {
        "id": "B",
        "text": "The figure comes from the NFHS participation survey"
      },
      {
        "id": "C",
        "text": "The figure includes school district athletic budgets"
      },
      {
        "id": "D",
        "text": "The figure measures spending by professional teams on youth academies"
      }
    ],
    "category": "issues",
    "context": "A club owner is pitching the board."
  },
  {
    "id": "q8",
    "kind": "mc",
    "points": 1,
    "title": "The rink deal",
    "prompt": "In a fictional scenario, a company backed by private equity buys several youth ice rinks. It launches a paid livestream service and bars families from recording games. Which governance concern does this most directly raise?",
    "options": [
      {
        "id": "A",
        "text": "Officials’ status as independent contractors"
      },
      {
        "id": "B",
        "text": "Changes to the NFHS playing rules for hockey"
      },
      {
        "id": "C",
        "text": "Title IX requirements for athletic scholarships"
      },
      {
        "id": "D",
        "text": "Private venue decisions about prices and recording policies can limit family access and voice"
      }
    ],
    "category": "issues",
    "context": "A regional news alert lands in your inbox."
  },
  {
    "id": "q9",
    "kind": "mc",
    "points": 1,
    "title": "The endorsement email",
    "prompt": "Under the PIAA’s 2026–27 NIL policy, which statement is accurate for a student at a PIAA member school?",
    "options": [
      {
        "id": "A",
        "text": "She may wear her school’s logo in a paid endorsement"
      },
      {
        "id": "B",
        "text": "She may earn NIL compensation, subject to restrictions on school and PIAA identification, and she or her parent/guardian must notify her principal or athletic director within 72 hours after entering the agreement"
      },
      {
        "id": "C",
        "text": "A coach who is not her parent may arrange her NIL deal"
      },
      {
        "id": "D",
        "text": "NIL compensation is prohibited for all athletes at PIAA member schools"
      }
    ],
    "category": "issues",
    "context": "A parent forwards an offer from a local pizza shop."
  },
  {
    "id": "q10",
    "kind": "brief",
    "points": 2,
    "title": "The operating-assets offer",
    "prompt": "Keystone Play Holdings, a fictional company backed by a private-equity fund, proposes to acquire the operating assets and brand of a nonprofit youth soccer club and fund a turf dome. The proposal is subject to required approvals.",
    "parts": [
      {
        "id": "a",
        "prompt": "Name one term you would negotiate to protect families’ access or the club’s accountability. (1 point)"
      },
      {
        "id": "b",
        "prompt": "Name one plausible cost or risk of insisting on that term. (1 point)"
      }
    ],
    "category": "issues",
    "context": "Prepare the ownership file."
  }
];
