export const MAX_AUDIO_BYTES=24*1024*1024;
export function detectAudio(bytes:Uint8Array):{ext:string;mime:string}|null {
 if(bytes.length<16)return null;
 const text=new TextDecoder().decode(bytes.slice(0,12));
 if(text.startsWith('RIFF')&&text.slice(8,12)==='WAVE')return {ext:'wav',mime:'audio/wav'};
 if(text.slice(4,8)==='ftyp'&&['M4A ','M4B ','isom','mp42'].includes(text.slice(8,12)))return {ext:'m4a',mime:'audio/mp4'};
 let offset=0;
 if(text.startsWith('ID3')){if(bytes.slice(6,10).some(v=>v>127))return null;offset=10+((bytes[6]<<21)|(bytes[7]<<14)|(bytes[8]<<7)|bytes[9]);}
 // Require an MPEG audio frame, rather than accepting an arbitrary ID3 header.
 for(let i=offset;i<Math.min(bytes.length-3,offset+4096);i++){
  if(bytes[i]===255&&(bytes[i+1]&0xe0)===0xe0&&(bytes[i+1]&6)!==0&&(bytes[i+2]&0xf0)!==0xf0&&(bytes[i+2]&0xf0)!==0&&(bytes[i+2]&12)!==12)return {ext:'mp3',mime:'audio/mpeg'};
 }
 return null;
}
