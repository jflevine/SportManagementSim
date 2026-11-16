// Registry of casefiles the server can run. Add one line per new simulation.
import theReport from '../spm370/the-report/casefile.mjs';
import theShortfall from '../mgt340/the-shortfall/casefile.mjs';
export const cases = { [theReport.id]: theReport, [theShortfall.id]: theShortfall };
