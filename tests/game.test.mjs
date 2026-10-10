import test from 'node:test';
import assert from 'node:assert/strict';
import {makeGame,startGame,moveGame,coordinates,snakes,ladders,isSavedGame} from '../app/game.ts';
const base=(position=1)=>({...makeGame([{id:'a',name:'Poppy',character:0,position},{id:'b',name:'Peanut',character:1,position:1}]),status:'playing'});
test('Every snake and reachable ladder uses the supplied endpoint',()=>{for(const [from,to] of Object.entries({...snakes,...ladders})){if(+from===1)continue;const g=moveGame(base(+from-1),1);assert.equal(g.players[0].position,to);}});
test('Starting square does not trigger a ladder',()=>{const g=startGame(base());assert.ok(g.players.every(p=>p.position===1));});
test('Only one effect: 28 climbs to 47 without following the snake',()=>assert.equal(moveGame(base(27),1).players[0].position,47));
test('Overshooting 100 stays put and passes the turn',()=>{const g=moveGame(base(97),5);assert.equal(g.players[0].position,97);assert.equal(g.turn,1);assert.equal(g.status,'playing');});
test('Exact finish and finish ladder both win',()=>{for(const pos of [99,79]){const g=moveGame(base(pos),1);assert.equal(g.winner,'a');assert.equal(g.status,'finished');}});
test('Six passes turn; passing over a ladder does not activate it',()=>{const g=moveGame(base(),6);assert.equal(g.players[0].position,7);assert.equal(g.turn,1);});
test('Sharing a square does not displace the other player',()=>{const g=base(2);g.players[1].position=3;const next=moveGame(g,1);assert.deepEqual(next.players.map(p=>p.position),[3,3]);});
test('Board coordinates follow zigzag from lower left to upper left',()=>{assert.ok(coordinates(1).x<coordinates(10).x);assert.equal(coordinates(10).x,coordinates(11).x);assert.equal(coordinates(1).x,coordinates(20).x);assert.ok(coordinates(100).y<coordinates(1).y);});
test('Damaged saved games cannot crash the board or strand a turn',()=>{
  assert.equal(isSavedGame(base()),true);
  for(const bad of [null,{}, {...base(),turn:4},{...base(),moves:null},{...base(),players:[...base().players,{id:'c',name:'x',character:1.5,position:1}]},{...base(),status:'broken'},{...base(),winner:'a'},{...base(),players:[base().players[0],base().players[0]]}])assert.equal(isSavedGame(bad),false);
  assert.equal(isSavedGame(moveGame(base(99),1)),true);
});
test('Every legal position and die result preserve turn and board invariants',()=>{
  for(let square=1;square<100;square++)for(let die=1;die<=6;die++){
    const g=base(square),snapshot=JSON.stringify(g),next=moveGame(g,die);
    assert.equal(JSON.stringify(g),snapshot,'moves must not mutate a saved snapshot');
    assert.ok(next.players.every(p=>p.position>=1&&p.position<=100));
    assert.equal(next.version,g.version+1);
    assert.equal(next.moves.length,1);
    assert.equal(next.turn,next.winner?0:1);
    assert.equal(isSavedGame(next),true);
  }
});
test('Finished games and invalid dice cannot advance',()=>{
  for(const die of [0,7,1.5,NaN])assert.throws(()=>moveGame(base(),die));
  assert.throws(()=>moveGame(moveGame(base(99),1),1));
});
