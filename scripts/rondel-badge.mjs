import fs from 'node:fs';
export function personalizeBadge(html) {
  const start=html.indexOf('const LETTER_W =');
  const end=html.indexOf('const badgeShadowTex =',start);
  if(start<0||end<0)throw new Error('Original badge geometry not found');
  html=html.slice(0,start)+fs.readFileSync('vendor/rondel/zhoujie-lettering.js','utf8')+html.slice(end);
  return html.replace("const capH = 0.6, gap = 0.11, text = 'RONDEL';", "const capH = 0.68, gap = 0.11, text = 'zhouJie';")
    .replaceAll('LETTER_W[ch] * capH','BADGE_GLYPHS[ch].advance * capH')
    .replace('letterShape(ch, capH)','badgeLetterShapes(ch, capH)');
}
