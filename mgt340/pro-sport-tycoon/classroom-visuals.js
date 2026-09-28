export const icon=(kind)=>{
 const paths={events:'M5 7h22v22H5z M5 13h22 M11 3v8 M21 3v8 M10 19h4v4h-4z M20 19h3',fans:'M10 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M3 29v-5a7 7 0 0 1 14 0v5 M17 29v-5a6 6 0 0 1 12 0v5',venue:'M3 13l13-8 13 8v15H3z M9 28V16h14v12 M3 13h26 M13 16v12 M19 16v12',screen:'M3 5h26v18H3z M16 23v5 M9 28h14 M13 10l9 5-9 5z',star:'M16 3l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z',team:'M16 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10 M7 30v-7a9 9 0 0 1 18 0v7 M3 14v11 M29 14v11',cash:'M3 7h26v20H3z M3 12h26 M20 18h5 M7 20h3'};
 return `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${`<path d="${paths[kind]||paths.venue}"/>`}</svg>`;
};
export function stadium(record=null,mood='mixed'){
 const occupancy=record?record.attendance/record.capacity:.79;
 const seats=Array.from({length:112},(_,i)=>{
  const row=Math.floor(i/28),col=i%28,occupied=i<Math.round(112*occupancy);
  return `<rect x="${137+col*18}" y="${139+row*15}" width="12" height="9" rx="3" fill="${occupied?['#edba51','#406c8c','#faf3df'][i%3]:'#233e55'}"/>`;
 }).join('');
 const premium=record?.commitments.some(p=>p.id==='c_premium');
 const screen=record?.commitments.some(p=>p.id==='c_video');
 const persons=Array.from({length:17},(_,i)=>{
  const x=61+i*42,y=389+(i%3)*8,skin=['#e7b08c','#a96c4c','#f6cfaa','#804e37'][i%4];
  const shirt=['#f3c553','#1b506a','#f9f2dd','#c65c45'][i%4];
  const reaction=mood==='mixed'?(i%2?'cheer':'boo'):mood;
  const arms=reaction==='cheer'?'M-8 15L-19 0l-3-8M8 15L19 0l3-8':'M-8 15L-20 14l-3 10M8 15L20 14l3 10';
  return `<g class="supporter ${reaction}" transform="translate(${x} ${y})"><g class="fan-motion" style="--delay:${i*.09}s"><path d="${arms}" stroke="${skin}" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M-11 12Q0 5 11 12l4 31h-30Z" fill="${shirt}"/><circle cy="0" r="9" fill="${skin}"/><path d="M-9-2Q-5-13 6-7L10-1" stroke="#233a49" stroke-width="4" fill="none"/><path d="M-3 3q3 ${reaction==='cheer'?4:-3} 6 0" fill="none" stroke="#593e34" stroke-width="1.4"/>${i%4===0?'<rect x="-19" y="29" width="38" height="13" rx="2" fill="#e9c360"/><path d="M-15 35h30" stroke="#234b64" stroke-width="3"/>':''}</g></g>`;
 }).join('');
 return `<svg class="stadium" viewBox="0 0 800 465" role="img" aria-label="Illustrated stadium${record?`. Occupied seats reflect attendance; the crowd is ${mood==='cheer'?'cheering':mood==='boo'?'booing':'divided'}`:''}."><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#c5e2e7"/><stop offset="1" stop-color="#f9eed6"/></linearGradient><linearGradient id="grass" x2="0" y2="1"><stop stop-color="#5a9073"/><stop offset="1" stop-color="#38735b"/></linearGradient></defs><rect width="800" height="465" rx="22" fill="url(#sky)"/><circle cx="668" cy="68" r="32" fill="#ffe0a1"/>
 <g fill="#9fbcc3" opacity=".42"><path d="M0 137v-34h39V74h40v51h43V92h34v59h491V98h33V66h36v51h31v-29h37v64H0Z"/></g>
 <g stroke="#698f9e" stroke-width="4"><path d="M76 208V74m650 134V74"/></g><g fill="#fff8da" stroke="#698f9e" stroke-width="3"><rect x="51" y="64" width="49" height="15" rx="3"/><rect x="702" y="64" width="49" height="15" rx="3"/></g>
 <path d="M82 165Q90 98 400 100Q710 98 718 165v151Q710 360 400 370Q90 360 82 316Z" fill="#315169"/>
 <path d="M88 162Q108 108 400 111Q692 108 712 162" fill="none" stroke="#e3c079" stroke-width="8"/>
 <path d="M111 173Q150 130 400 130Q650 130 689 173v130Q650 340 400 345Q150 340 111 303Z" fill="#203b50"/>
 ${seats}<path d="M123 214h554v107Q400 349 123 321Z" fill="#c4d1c1"/>
 <path d="M181 218h438l36 101H145Z" fill="url(#grass)"/>
 ${Array.from({length:9},(_,i)=>`<path d="M${195+i*46} 220l${(i-4)*2} 96" stroke="#9aba97" stroke-width="2" opacity=".65"/>`).join('')}
 <path d="M193 229h415l23 73H168Z M400 229v73" fill="none" stroke="#edf1d5" stroke-width="2"/><ellipse cx="400" cy="265" rx="33" ry="20" fill="none" stroke="#edf1d5" stroke-width="2"/>
 <g fill="#f6ce66" stroke="#294959" stroke-width="2">${[[268,259],[350,288],[438,243],[539,280]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6"/>`).join('')}</g>
 <g fill="#fbf5e6" stroke="#294959" stroke-width="2">${[[299,287],[362,244],[456,287],[514,252]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6"/>`).join('')}</g><circle cx="404" cy="273" r="3" fill="#fff"/>
 <g class="${screen?'installed':''}"><rect x="319" y="68" width="162" height="58" rx="6" fill="${screen?'#d4a33f':'#23435a'}"/><rect x="325" y="74" width="150" height="46" rx="3" fill="#183a50"/><text x="400" y="94" text-anchor="middle" fill="#e7c76d" font-size="10" font-family="sans-serif" letter-spacing="2">${record?'SEASON '+record.cycle:'YOUR FRANCHISE'}</text><text x="400" y="112" text-anchor="middle" fill="#fff5da" font-size="15" font-family="sans-serif" font-weight="bold">${record?(record.wins*100).toFixed(1)+'% WIN RATE':'EXPLORERS'}</text></g>
 ${premium?'<g class="installed"><rect x="143" y="120" width="126" height="24" rx="3" fill="#e6c87f"/><path d="M172 121v22m32-22v22m32-22v22" stroke="#476e7b"/><text x="206" y="115" text-anchor="middle" font-size="9" font-family="sans-serif" fill="#183a50">PREMIUM CLUB</text></g>':''}
 <path d="M66 354Q400 404 734 354v111H66Z" fill="#27485f"/><path d="M37 410h726" stroke="#a4b8bb" stroke-width="7"/>${persons}
 <rect x="0" y="445" width="800" height="20" fill="#1e3c50"/>
 </svg>`;
}
