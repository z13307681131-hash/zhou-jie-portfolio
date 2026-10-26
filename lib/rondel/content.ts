import { z } from 'zod';
import originalDefaults from './defaults.json';
import catalog from './music-catalog.json';
import fields from './fields.json';
const musicTexts = {t040:'私人唱片收藏 · 十张唱片',t041:'一首歌，一段记忆',t036:'选一张唱片，让音乐开始。',t037:'换一张唱片，',t038:'换一种心情。',t133:'ZHOUJIE · RECORD COLLECTION'};
export const defaults = {...originalDefaults, texts:{...originalDefaults.texts,...musicTexts},records:catalog,musicEdition:2,heroRecordImage:catalog[0].imageUrl};
export { fields };
export type RondelContent = typeof defaults;
export type RondelSnapshot = { content: RondelContent; revision: number; updatedAt: number | null };
const image = z.string().max(220).refine(v => v === '' || /^\/rondel-assets\/asset-\d{2}\.jpg$/.test(v) || /^\/rondel-assets\/music\/(one-last-kiss|luvsic-hexalogy)\.jpg$/.test(v) || /^\/media\/uploads\/rondel\/[a-z0-9-]+\.(jpg|png|webp|gif)$/.test(v), '图片地址无效');
const audio = z.string().max(220).refine(v=>/^\/rondel-assets\/audio\/track-\d{2}\.mp3$/.test(v)||/^\/media\/uploads\/rondel-audio\/[a-z0-9-]+\.(mp3|m4a|wav)$/.test(v),'音频地址无效');
const short = z.string().max(160);
export const saveSchema = z.object({revision:z.number().int().min(0), content:z.object({
 texts:z.record(z.string().max(2000)).refine(v => Object.keys(v).every(k => fields.some(f=>f.key===k)), '文字字段无效'),
 musicEdition:z.literal(2),
 records:z.array(z.object({title:short,artist:short,cat:short,year:z.number().int().min(0).max(9999),side:short,imageUrl:image,printLabel:z.boolean(),audioUrl:audio,sourceFile:z.string().max(240)})).length(10),
 range:z.array(z.object({key:short,title:short,subtitle:short,imageUrl:image})).length(6),heroRecordImage:image
})});
export function normalize(value: Partial<RondelContent> = {}): RondelContent {
 const current=value.musicEdition===2;
 return {musicEdition:2,texts:{...defaults.texts,...value.texts,...(!current?musicTexts:{})},records:defaults.records.map((r,i)=>({...r,...(current?value.records?.[i]:{})})),range:defaults.range.map((r,i)=>({...r,...value.range?.[i],key:r.key})),heroRecordImage:current?(value.heroRecordImage||''):defaults.heroRecordImage};
}
