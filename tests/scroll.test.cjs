const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  module._compile(outputText, filename);
};
const { sampleScroll, chapterDolly, heroTextOffset, animationDelta } = require('../lib/scroll-state.ts');
const { requestSceneFrame, subscribeSceneFrames } = require('../lib/motion.ts');
const makeBounds = (vh, mobile = false) => {
  let top=0;
  return [mobile?1.45:1.7,mobile?1.45:1.7,3.5,mobile?1.45:1.7,1.1].map(ratio=>{
    const section={top,height:ratio*vh};top+=section.height;return section;
  });
};
for (const [label,vh,mobile] of [['desktop',900,false],['mobile',844,true],['short viewport',600,true]]) {
  test(`${label}: first actual scroll changes camera and text without a second event`,()=>{
    const bounds=makeBounds(vh,mobile);
    for(const firstDelta of [.5,1,12,40,120,300]) {
      const state=sampleScroll(firstDelta,bounds);
      // Preserve the reading composition, but eliminate the old motionless hold.
      assert.equal(state.chapter,0);
      assert(chapterDolly(state.local,false)>0);
      assert(heroTextOffset(firstDelta,false)<0);
      const firstFrameDolly=chapterDolly(state.local,false)*(1-Math.exp(-animationDelta(0)*7));
      assert(firstFrameDolly>0,'the very first rendered frame must respond');
    }
  });
}
test('reverse scroll returns the original hero composition',()=>{
  const bounds=makeBounds(900);
  for(const y of [400,100,0]) {
    const state=sampleScroll(y,bounds);
    assert.equal(state.chapter,0);
    if(y===0){assert.equal(chapterDolly(state.local,false),0);assert.equal(heroTextOffset(y,false),0);}
  }
});
test('every chapter join is continuous and deep links resolve without prior scroll',()=>{
  const bounds=makeBounds(900);
  for(let i=1;i<bounds.length;i++){
    const before=sampleScroll(bounds[i].top-.001,bounds),at=sampleScroll(bounds[i].top,bounds);
    assert.equal(at.chapter,i);assert.equal(at.progress,i);
    assert(Math.abs(before.progress-at.progress)<.00001);
    assert(Math.abs(chapterDolly(before.local,false)-chapterDolly(at.local,false))<.00001);
  }
});
test('reduced motion never adds dolly or text transforms',()=>{
  const bounds=makeBounds(900);
  for(const y of [0,1,120,800,2400,6000]){
    const state=sampleScroll(y,bounds,true);
    assert.equal(state.progress,state.chapter);
    assert.equal(chapterDolly(state.local,true),0);
    assert.equal(heroTextOffset(y,true),0);
  }
});
test('elastic overscroll and stale offsets are bounded',()=>{
  const bounds=makeBounds(900);
  assert.deepEqual(sampleScroll(-100,bounds),sampleScroll(0,bounds));
  assert.equal(sampleScroll(1e9,bounds).progress,4);
  assert.equal(sampleScroll(0,[]).progress,0);
});
test('renderer wakes on the first request after idle and cleans up subscriptions',()=>{
  let renders=0;
  const unsubscribe=subscribeSceneFrames(()=>renders++);
  requestSceneFrame();assert.equal(renders,1);
  requestSceneFrame();assert.equal(renders,2);
  unsubscribe();requestSceneFrame();assert.equal(renders,2);
});
test('startup/idle delta cannot stall or skip animation; ordinary frame rates retain timing',()=>{
  for(const dt of [0,10,Infinity,NaN])assert.equal(animationDelta(dt),1/60);
  for(const dt of [1/120,1/60,1/30,1/20])assert.equal(animationDelta(dt),dt);
});
test('process chapters retain all five steps',()=>{
  const bounds=makeBounds(900),section=bounds[2];
  for(let i=0;i<5;i++)assert.equal(sampleScroll(section.top+section.height*(i*.72/5+.015),bounds).process,i);
});
