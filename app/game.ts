export const characters = [
  {name:'Poppy',kind:'Pink-bow hamster',image:'hamster-pink.png',color:'#e982a2'},
  {name:'Peanut',kind:'Blue-bow hamster',image:'hamster-blue.png',color:'#75afda'},
  {name:'Hazel',kind:'Pink-bow hedgehog',image:'hedgehog-pink.png',color:'#cb94d0'},
  {name:'Hugo',kind:'Blue-vest hedgehog',image:'hedgehog-blue.png',color:'#7faf8b'},
];
export const snakes: Record<number,number> = {98:77,95:75,93:73,87:24,64:60,62:19,56:53,49:11,47:26,16:6};
export const ladders: Record<number,number> = {80:100,71:91,55:84,51:67,21:42,1:23,36:44,28:47,9:31,4:14};
export type Player = {id:string,name:string,character:number,position:number,token?:string};
export type Move = {id:string,playerId:string,from:number,roll:number,landed:number,to:number,effect:'snake'|'ladder'|'overshoot'|'walk',message:string};
export type Game = {players:Player[],turn:number,status:'lobby'|'playing'|'finished',winner:string|null,moves:Move[],version:number,host:string};
export function isSavedGame(value:unknown):value is Game {
  if(!value||typeof value!=='object')return false;
  const g=value as Game;
  if(!Array.isArray(g.players)||g.players.length<2||g.players.length>4||!['playing','finished'].includes(g.status)||!Number.isInteger(g.turn)||g.turn<0||g.turn>=g.players.length||!Number.isInteger(g.version)||g.version<0||!Array.isArray(g.moves)||g.moves.length>30)return false;
  if(!g.players.every(p=>p&&typeof p.id==='string'&&typeof p.name==='string'&&p.name.trim().length>0&&p.name.length<=20&&Number.isInteger(p.character)&&p.character>=0&&p.character<4&&Number.isInteger(p.position)&&p.position>=1&&p.position<=100))return false;
  if(new Set(g.players.map(p=>p.id)).size!==g.players.length||new Set(g.players.map(p=>p.character)).size!==g.players.length||!g.players.some(p=>p.id===g.host))return false;
  if(g.status==='finished'?!g.players.some(p=>p.id===g.winner&&p.position===100):g.winner!==null||g.players.some(p=>p.position===100))return false;
  return g.moves.every(m=>m&&typeof m.id==='string'&&g.players.some(p=>p.id===m.playerId)&&Number.isInteger(m.roll)&&m.roll>=1&&m.roll<=6&&[m.from,m.landed,m.to].every(n=>Number.isInteger(n)&&n>=1&&n<=100)&&['snake','ladder','overshoot','walk'].includes(m.effect)&&typeof m.message==='string');
}
export function randomInt(n:number):number { const a=new Uint32Array(1);const limit=Math.floor(4294967296/n)*n;do{crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%n; }
export function makeGame(players:Player[]):Game {return {players,turn:0,status:'lobby',winner:null,moves:[],version:0,host:players[0].id};}
export function startGame(g:Game):Game {return {...g,players:g.players.map(p=>({...p,position:1})),turn:randomInt(g.players.length),status:'playing',winner:null,moves:[],version:g.version+1};}
export function moveGame(g:Game,roll:number):Game {
  if(g.status!=='playing'||!Number.isInteger(roll)||roll<1||roll>6)throw Error('Invalid move.');
  const p=g.players[g.turn],from=p.position,overshoot=from+roll>100,landed=overshoot?from:from+roll;
  const effect=overshoot?'overshoot':snakes[landed]?'snake':ladders[landed]?'ladder':'walk';
  const to=overshoot?from:(snakes[landed]||ladders[landed]||landed);
  const message=effect==='overshoot'?`${p.name} rolled ${roll}. An exact roll is needed!`:effect==='ladder'?`${p.name} climbed from ${landed} to ${to}!`:effect==='snake'?`${p.name} slid from ${landed} to ${to}. Keep going!`:`${p.name} rolled ${roll} and reached ${to}.`;
  const move:Move={id:crypto.randomUUID(),playerId:p.id,from,roll,landed,to,effect,message};
  return {...g,players:g.players.map(x=>x.id===p.id?{...x,position:to}:x),turn:to===100?g.turn:(g.turn+1)%g.players.length,status:to===100?'finished':'playing',winner:to===100?p.id:null,moves:[move,...g.moves].slice(0,30),version:g.version+1};
}
export function coordinates(square:number) { const row=Math.floor((square-1)/10),index=(square-1)%10,col=row%2===0?index:9-index;return {x:(col+.5)*10,y:(9-row+.5)*10}; }
