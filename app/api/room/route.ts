import {env} from 'cloudflare:workers';
import {Game,Player,makeGame,startGame,moveGame,randomInt} from '../../game';
export const dynamic='force-dynamic';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','Access-Control-Allow-Origin':'*'}});
function safe(g:Game) {return {...g,players:g.players.map(({token,...p})=>p)};}
function profile(b:any):Player {if(typeof b.name!=='string'||!b.name.trim()||b.name.trim().length>20||!Number.isInteger(b.character)||b.character<0||b.character>3)throw Error('Choose a character and enter a name (up to 20 letters).');return {id:crypto.randomUUID(),token:crypto.randomUUID(),name:b.name.trim(),character:b.character,position:1};}
async function getRoom(code:string) {if(!/^[A-Z2-9]{6}$/.test(code))return null;return await env.DB!.prepare('SELECT state, revision, updated FROM rooms WHERE code = ?').bind(code).first<{state:string,revision:number,updated:number}>();}
export async function GET(request:Request) {
  const code=(new URL(request.url).searchParams.get('code')||'').toUpperCase();
  const row=await getRoom(code);if(!row||Date.now()-row.updated>86400000)return reply({error:'Room not found or expired. Create a new room.'},404);
  const g:Game=JSON.parse(row.state),token=request.headers.get('authorization')?.replace('Bearer ','');
  if(!g.players.some(p=>p.token===token))return reply({error:'Join this room to see the game.'},403);
  return reply({game:safe(g)});
}
export async function POST(request:Request) {
 try {
  if(!env.DB)return reply({error:'Online rooms are not available yet. Try same-device play.'},503);
  const raw=await request.text();if(raw.length>2000)return reply({error:'Request too large.'},400);const b=JSON.parse(raw);
  if(b.action==='create'){
   const p=profile(b),g=makeGame([p]);
   for(let i=0;i<5;i++) {const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',code=Array.from({length:6},()=>alphabet[randomInt(alphabet.length)]).join('');const r=await env.DB.prepare('INSERT OR IGNORE INTO rooms (code,state,revision,updated) VALUES (?,?,?,?)').bind(code,JSON.stringify(g),0,Date.now()).run();if(r.meta.changes)return reply({code,game:safe(g),token:p.token,playerId:p.id});}
   return reply({error:'Please try creating a room again.'},503);
  }
  const code=String(b.code||'').toUpperCase(),row=await getRoom(code);
  if(!row||Date.now()-row.updated>86400000)return reply({error:'Room not found or expired. Check the code.'},404);
  let g:Game=JSON.parse(row.state);let joined:Player|undefined;
  const token=request.headers.get('authorization')?.replace('Bearer ',''),p=g.players.find(x=>x.token===token);
  if(b.action==='join'){
   if(p)return reply({code,game:safe(g),token:p.token,playerId:p.id});
   if(g.status!=='lobby')return reply({error:'This game has already started.'},409);
   if(g.players.length>=4)return reply({error:'This room is full.'},409);
   joined=profile(b);if(g.players.some(x=>x.character===joined!.character))return reply({error:'That character is taken. Choose another friend.'},409);
   g={...g,players:[...g.players,joined],version:g.version+1};
  } else {
   if(!p)return reply({error:'Please rejoin the room.'},403);
   if(b.version!==g.version)return reply({error:'The game changed. Please try again.',game:safe(g)},409);
   if(b.action==='start'||b.action==='rematch'){
    if(p.id!==g.host)return reply({error:'Only the host can start the game.'},403);
    if(g.players.length<2)return reply({error:'Wait for at least one friend.'},400);
    if(b.action==='start'&&g.status!=='lobby'||b.action==='rematch'&&g.status!=='finished')return reply({error:'This action is not available now.'},409);
    g=startGame(g);
   }else if(b.action==='roll'){
    if(g.status!=='playing'||g.players[g.turn].id!==p.id)return reply({error:'Wait for your turn.'},403);
    g=moveGame(g,randomInt(6)+1);
   }else return reply({error:'Unknown action.'},400);
  }
  const result=await env.DB.prepare('UPDATE rooms SET state = ?, revision = ?, updated = ? WHERE code = ? AND revision = ?').bind(JSON.stringify(g),g.version,Date.now(),code,row.revision).run();
  if(!result.meta.changes)return reply({error:'Someone just made a move. Please try again.'},409);
  return reply({game:safe(g),...(joined?{code,token:joined.token,playerId:joined.id}:{})});
 }catch(e){return reply({error:e instanceof SyntaxError?'Invalid request.':e instanceof Error?e.message:'Something went wrong.'},400);}
}
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
