// Registry of casefiles the server can run. Add one line per new simulation.
import theReport from '../spm370/the-report/casefile.mjs';
import theShortfall from '../mgt340/the-shortfall/casefile.mjs';
import twoFeeds from '../spm370/two-feeds/casefile.mjs';
export const cases = { [twoFeeds.id]: twoFeeds, [theReport.id]: theReport, [theShortfall.id]: theShortfall };
