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
export function coordinates(square:number) { const row=Math.floor((square-1)/10),index=(square-1)%10,col=row%2===0?index:9-index;return {x:(75+(col+.5)*110.3)/12.54,y:(182+(9-row+.5)*96.8)/12.54}; }
