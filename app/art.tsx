import {useId,type CSSProperties,type ReactNode} from 'react';
const sheets:Record<string,[number,number]>={'icons':[1448,1086],'buttons':[1448,1086],'dice-pawns':[1448,1086],'characters':[1448,1086],'decor':[1448,1086],'title-sun-castle':[1254,1254],'character-labels':[1254,1254],'awards':[1254,1254],'counters':[1254,1254],'sign-dice':[1448,1086],'love-buttons':[1536,1024]};
export const sprites:Record<string,[string,number,number,number,number]>={
 settings:['icons',4,125,365,400],sound:['icons',366,125,363,400],music:['icons',730,125,363,400],back:['icons',1090,125,355,400],crown:['icons',0,595,465,385],trophy:['icons',483,545,530,440],medal:['icons',1010,597,436,388],
 roll:['buttons',20,30,710,280],start:['buttons',747,30,700,280],again:['buttons',24,322,705,278],winner:['buttons',736,300,712,324],turn:['buttons',27,610,700,260],waiting:['buttons',746,610,700,260],sign:['buttons',34,854,1408,225],
 'char-1':['characters',176,0,482,550],'char-0':['characters',792,0,488,550],'char-3':['characters',158,548,525,538],'char-2':['characters',765,548,522,538],
 'label-1':['character-labels',15,409,616,205],'label-0':['character-labels',626,409,625,205],'label-3':['character-labels',15,628,616,210],'label-2':['character-labels',626,628,625,210],
 heart:['decor',49,20,417,350],star:['decor',752,20,367,354],confetti:['decor',0,374,470,368],flowers:['decor',484,392,405,360],bush:['decor',889,366,550,367],rocks:['decor',87,747,713,339],mushrooms:['decor',807,739,637,347],
 title:['title-sun-castle',0,104,1254,457],sun:['title-sun-castle',0,580,680,652],castle:['title-sun-castle',592,543,660,695],
 'award-crown':['awards',60,104,552,526],'award-trophy':['awards',629,100,562,532],'award-medal':['awards',400,655,478,545],
 'counter-0':['counters',43,64,559,550],'counter-1':['counters',643,61,565,553],'counter-2':['counters',39,647,569,568],'counter-3':['counters',629,647,590,568],
 arrow:['sign-dice',126,10,680,575],'dice3d':['sign-dice',827,80,515,490],
 'die-1':['dice-pawns',29,82,234,249],'die-2':['dice-pawns',264,82,228,249],'die-3':['dice-pawns',493,82,226,249],'die-4':['dice-pawns',724,82,231,249],'die-5':['dice-pawns',956,82,235,249],'die-6':['dice-pawns',1186,82,257,249],
 'pawn-0':['dice-pawns',104,738,242,295],'pawn-1':['dice-pawns',440,738,238,295],'pawn-2':['dice-pawns',772,738,234,295],'pawn-3':['dice-pawns',1103,738,243,295],
 'love-again':['love-buttons',0,289,764,432],'hug':['love-buttons',769,289,767,432],
};
export function Sprite({name,className='',style}:{name:string,className?:string,style?:CSSProperties}){const clip=useId();const [sheet,x,y,w,h]=sprites[name];const [sw,sh]=sheets[sheet];return <svg className={'sprite '+className} style={style} viewBox={`${x} ${y} ${w} ${h}`} aria-hidden="true" focusable="false"><defs><clipPath id={clip}><rect x={x} y={y} width={w} height={h}/></clipPath></defs><image href={`/art/${sheet}.png`} width={sw} height={sh} clipPath={`url(#${clip})`}/></svg>;}
export function ArtButton({name,label,onClick,disabled=false,className=''}:{name:string,label:string,onClick:()=>void,disabled?:boolean,className?:string}){return <button type="button" className={'art-button '+className} aria-label={label} title={label} onClick={onClick} disabled={disabled}><Sprite name={name}/></button>;}
export function Scene({name,children,className=''}:{name:string,children:ReactNode,className?:string}){return <div className={'illustrated-scene '+className}><img className="scene-art" src={'/art/'+name+'.png'} alt="" draggable="false"/>{children}</div>;}
export function Hotspot({label,x,y,w,h,onClick,disabled=false,children,className=''}:{label:string,x:number,y:number,w:number,h:number,onClick:()=>void,disabled?:boolean,children?:ReactNode,className?:string}){return <button className={'hotspot '+className} style={{left:x+'%',top:y+'%',width:w+'%',height:h+'%'}} aria-label={label} title={label} onClick={onClick} disabled={disabled}>{children}</button>;}
