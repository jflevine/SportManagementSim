// Registry of casefiles the server can run. Add one line per new simulation.
import theReport from '../spm370/the-report/casefile.mjs';
import theShortfall from '../mgt340/the-shortfall/casefile.mjs';
import investmentCommittee from '../mgt340/investment-committee/casefile.mjs';
import workableChange from '../mgt340/workable-change/casefile.mjs';
export const cases = { [theReport.id]: theReport, [theShortfall.id]: theShortfall, [investmentCommittee.id]: investmentCommittee, [workableChange.id]: workableChange };
import frontOffice from '../mgt340/front-office/casefile.mjs';
cases[frontOffice.id] = frontOffice;
