(function (root) {
  'use strict';

  const formats = {
    cup: { name: 'Rivalry Mini-Cup', cost: 280, reserved: 12, active: 12, turn: 20 },
    open: { name: 'Play & Connect', cost: 180, reserved: 10, active: 8, turn: 15 },
    showcase: { name: 'Campus Showcase', cost: 240, reserved: 8, active: 8, turn: 15 }
  };
  const adjustmentNames = {
    orientation: 'Guided PC introduction',
    extra_host: 'Third floor host',
    rotations: 'Coach the start of each turn'
  };

  function buildPlan(choice, adjustment) {
    const format = formats[choice];
    if (!format) return null;
    const selectedAdjustment = Object.hasOwn(adjustmentNames, adjustment) ? adjustment : '';
    const orientation = selectedAdjustment === 'orientation';
    const coaching = selectedAdjustment === 'rotations';
    const totalCost = format.cost + (selectedAdjustment === 'extra_host' ? 75 : 0);
    const hosts = selectedAdjustment === 'extra_host' ? 3 : 2;
    const steps = [];
    function step(minutes, title, detail) { steps.push({ minutes, title, detail }); }
    function turn(group, count, minutes) {
      step(minutes, `${group}: ${count} visitors play`, coaching
        ? `Each visitor operates a PC for ${minutes} minutes: 5 minutes of guided controls practice, then ${minutes - 5} minutes of independent play. A host remains available.`
        : `Each visitor operates a PC for ${minutes} minutes. The PC host gives clear instructions and remains available for help.`);
    }

    step(10, 'Arrival and briefing', 'Check in all 24 visitors, assign their groups, and explain the event. At least 8 visitors use PC-area seats; no more than 16 occupy the off-station area.');
    if (orientation) step(10, 'Guided PC introduction', 'A host demonstrates the controls and explains how to ask for help. Visitors watch from their assigned places. This demonstration does not replace anyone’s hands-on turn.');

    if (choice === 'cup') {
      turn('Group A', 12, 20);
      step(5, 'Reset and change groups', 'The hosts reset the stations and move Group B into the PC area. Group A moves to the off-station area.');
      turn('Group B', 12, 20);
      step(5, 'Reset for the final', 'Prepare the final after every visitor has completed a full turn. Eight finalists use PCs; the other 16 visitors watch.');
      step(orientation ? 10 : 20, 'Competitive final', 'Eight finalists take part in a timed final. The PC host runs play while the welcome host supports the 16 spectators.');
    } else if (choice === 'open') {
      ['Group A', 'Group B', 'Group C'].forEach((group, index) => {
        turn(group, 8, 15);
        step(5, index < 2 ? 'Reset and change groups' : 'Reset and prepare to close', index < 2
          ? 'The next group of 8 moves into the PC area. The other 16 visitors stay in the off-station area.'
          : 'Finish the last rotation and reset the stations. Keep 8 visitors in PC-area seats so the off-station area stays within its 16-place limit.');
      });
      if (!orientation) step(10, 'Social time and return invitation', 'Visitors share what they tried and hear about a possible return visit. Keep the same seating arrangement; this is not an additional playing turn.');
    } else {
      step(orientation ? 10 : 20, 'Staff-led showcase demonstration', 'A host demonstrates the game. Group A watches from the 8 PC-area seats; Groups B and C use the 16 off-station places. Watching is not counted as hands-on play.');
      turn('Group A', 8, 15);
      step(2, 'First group change', 'The hosts move Group B into the 8 PC-area seats and Group A into the off-station area.');
      turn('Group B', 8, 15);
      step(3, 'Second group change', 'The hosts move Group C into the 8 PC-area seats and Group B into the off-station area. These two changes use the 5-minute transition allowance.');
      turn('Group C', 8, 15);
    }

    step(10, 'Close and collect feedback', 'Thank visitors, gather a short response about their experience, and record the measure you chose. Visitors can remain in PC-area seats during the close.');
    let minute = 0;
    const schedule = steps.map(item => {
      const row = { ...item, start: minute, end: minute + item.minutes };
      minute = row.end;
      return row;
    });
    const formatTradeoff = choice === 'cup'
      ? 'The Mini-Cup gives the club a clear competitive finish, but uses nearly the entire budget and can place more pressure on newcomers.'
      : choice === 'open'
        ? 'Play & Connect emphasizes trying games and meeting people. It leaves more budget available, but offers a less distinctive competitive finish.'
        : 'The Showcase makes the event a shared viewing experience, but gives each visitor less independent playing time than the Mini-Cup.';
    const adjustmentTradeoff = selectedAdjustment === 'orientation'
      ? choice === 'cup'
        ? 'The introduction reduces the final from 20 to 10 minutes. Both 20-minute hands-on turns stay intact.'
        : choice === 'open'
          ? 'The introduction replaces the 10-minute social and return-invitation block. All three 15-minute hands-on turns stay intact.'
          : 'The introduction reduces the showcase demonstration from 20 to 10 minutes. All three 15-minute hands-on turns stay intact.'
      : selectedAdjustment === 'extra_host'
        ? 'The third host adds hands-on support without shortening the program. The $75 charge leaves less money for other needs.'
        : selectedAdjustment === 'rotations'
          ? `The first 5 minutes of every turn become guided practice. Everyone keeps the full ${format.turn}-minute hands-on turn, but has 5 fewer minutes of independent play.`
          : 'Choose one adjustment to see exactly how it changes this plan.';

    return {
      choice, adjustment: selectedAdjustment, name: format.name,
      adjustmentName: adjustmentNames[selectedAdjustment] || 'No adjustment selected',
      totalCost, remaining: 300 - totalCost, withinBudget: totalCost <= 300,
      hosts, totalPeople: 24 + hosts, reservedPCs: format.reserved,
      activePCs: format.active, handsOnMinutesPerVisitor: format.turn,
      totalMinutes: minute, schedule, formatTradeoff, adjustmentTradeoff,
      stationNote: choice === 'open'
        ? '10 PCs are reserved: 8 are used in each turn and 2 are available for a reset or backup. The other 2 venue PCs are outside this package. The 24 visitors form 3 groups of 8.'
        : choice === 'cup'
          ? '12 PCs are reserved. The 24 visitors form 2 groups of 12. During the final, 8 people play and 16 watch.'
          : '8 PCs are reserved. The 24 visitors form 3 groups of 8. The other 4 venue PCs are outside this package.',
      supportNote: selectedAdjustment === 'extra_host'
        ? 'PC host: explain turns and run play. Welcome host: support the off-station group and manage changes. Third host: provide additional help at the PCs.'
        : 'PC host: explain turns and stay available beside the active PCs. Welcome host: support the off-station group, manage the next rotation, and keep routes clear.'
    };
  }

  root.TapPlanPreview = Object.freeze({ buildPlan });
  if (typeof document === 'undefined') return;

  let lastKey = '';
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function render() {
    const container = document.getElementById('plan-preview');
    if (!container) return;
    const choice = document.querySelector('[name="finalChoice"]:checked')?.value || '';
    const adjustment = document.querySelector('[name="adjustment"]:checked')?.value || '';
    const key = `${choice}:${adjustment}`;
    if (key === lastKey && container.childElementCount) return;
    lastKey = key;
    container.replaceChildren();
    container.classList.add('plan-preview');

    const heading = element('h3', '', 'Your 90-minute operating plan');
    heading.id = 'plan-preview-heading';
    container.setAttribute('aria-labelledby', heading.id);
    container.append(heading);
    const plan = buildPlan(choice, adjustment);
    if (!plan) {
      container.append(element('p', 'field-help', 'Choose a final format to see its timetable. The supplied schedule shows how all 24 visitors receive a supported hands-on turn.'));
      return;
    }

    container.append(element('p', 'plan-preview-intro', `${plan.name} · ${plan.adjustmentName}`));
    const figures = element('dl', 'plan-preview-figures');
    [['Total cost', `$${plan.totalCost} of $300`],
     ['Budget remaining', plan.remaining >= 0 ? `$${plan.remaining}` : `$${Math.abs(plan.remaining)} over`],
     ['Hands-on turn', `${plan.handsOnMinutesPerVisitor} min per visitor`],
     ['Staff', `${plan.hosts} floor hosts`]].forEach(([label, value]) => {
      const item = element('div');
      item.append(element('dt', '', label), element('dd', '', value));
      figures.append(item);
    });
    container.append(figures);
    if (!plan.withinBudget) {
      const warning = element('p', 'plan-preview-warning', `This combination is $${Math.abs(plan.remaining)} over the budget. Choose a different format or adjustment before submitting. A third host fits only Play & Connect ($255 total).`);
      warning.setAttribute('role', 'status');
      container.append(warning);
    }
    container.append(element('p', 'plan-preview-stations', plan.stationNote));

    const table = element('table', 'plan-preview-table');
    const caption = element('caption', '', 'Event clock: 10 minutes to arrive, 70 minutes for the program, 10 minutes to close');
    table.append(caption);
    const head = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['Minutes', 'What happens'].forEach(label => {
      const cell = element('th', '', label);
      cell.scope = 'col';
      headRow.append(cell);
    });
    head.append(headRow);
    table.append(head);
    const body = document.createElement('tbody');
    plan.schedule.forEach(item => {
      const row = document.createElement('tr');
      const time = element('th', 'plan-preview-time', `${item.start}–${item.end}`);
      time.scope = 'row';
      const activity = document.createElement('td');
      activity.append(element('strong', '', item.title), element('span', 'plan-preview-detail', item.detail));
      row.append(time, activity);
      body.append(row);
    });
    table.append(body);
    container.append(table);
    container.append(element('p', 'plan-preview-support', plan.supportNote));
    const tradeoff = element('p', 'plan-preview-tradeoff');
    tradeoff.append(element('strong', '', 'What this choice gives up: '), document.createTextNode(`${plan.formatTradeoff} ${plan.adjustmentTradeoff}`));
    container.append(tradeoff);
    container.append(element('p', 'field-help', 'You may use this timetable in your recommendation. Your explanation of the priority, risk, tradeoff, and success measure must be your own. Resource totals are not a grade or a prediction of success.'));
  }

  root.refreshTapPlanPreview = render;
  document.addEventListener('change', event => {
    if (event.target?.matches('[name="finalChoice"], [name="adjustment"]')) render();
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render, { once: true });
  else render();
})(typeof window === 'undefined' ? globalThis : window);
