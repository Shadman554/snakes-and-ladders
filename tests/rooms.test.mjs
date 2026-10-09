import assert from 'node:assert/strict';
const base=process.env.TEST_ORIGIN||'http://127.0.0.1:5173';
async function post(body,token){const r=await fetch(base+'/api/room',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body)});return {status:r.status,...await r.json()};}
const a=await post({action:'create',name:'Test Poppy',character:0});assert.equal(a.status,200);assert.match(a.code,/^[A-Z2-9]{6}$/);assert.ok(!a.game.players[0].token);
const bad=await post({action:'join',code:a.code,name:'Duplicate',character:0});assert.equal(bad.status,409);
const b=await post({action:'join',code:a.code,name:'Test Peanut',character:1});assert.equal(b.status,200);assert.equal(b.game.players.length,2);
const hidden=await fetch(base+'/api/room?code='+a.code);assert.equal(hidden.status,403);
const notHost=await post({action:'start',code:a.code,version:b.game.version},b.token);assert.equal(notHost.status,403);
const started=await post({action:'start',code:a.code,version:b.game.version},a.token);assert.equal(started.status,200);assert.equal(started.game.status,'playing');
const players=[a,b],active=players.find(p=>p.playerId===started.game.players[started.game.turn].id),other=players.find(p=>p!==active);
const wrongTurn=await post({action:'roll',code:a.code,version:started.game.version},other.token);assert.equal(wrongTurn.status,403);
const moves=await Promise.all([1,2].map(()=>post({action:'roll',code:a.code,version:started.game.version},active.token)));assert.equal(moves.filter(r=>r.status===200).length,1);assert.equal(moves.filter(r=>r.status===409).length,1);
const snapshots=await Promise.all(players.map(async p=>{const r=await fetch(base+'/api/room?code='+a.code,{headers:{Authorization:'Bearer '+p.token}});return (await r.json()).game;}));assert.deepEqual(snapshots[0],snapshots[1]);assert.equal(snapshots[0].moves.length,1);
const invalidJoin=await post({action:'join',code:a.code,name:'Late player',character:2});assert.equal(invalidJoin.status,409);
console.log('PASS: room creation, unique characters, joins, private state, host controls, turn enforcement, concurrent-roll protection, and synchronized results.');
