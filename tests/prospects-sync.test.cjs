const fs = require('fs'), os = require('os'), path = require('path'), assert = require('assert'), ts = require('typescript');
const root = process.cwd();
const source = fs.readFileSync('src/app/api/prospects/sync_espn.ts','utf8');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'bigboard-sync-test-'));
fs.mkdirSync(path.join(temp,'src/data'),{recursive:true});
const file = path.join(temp,'src/data/prospects.json');
const base = {id:1,name:'Test QB',position_group:'QB',espn_id:1,games:5,pass_yds:100,pass_td:1,interceptions_thrown:0,comp_pct:60,rush_yds:0,rush_td:0,audit_note:'Keep me'};
const data = [base,{...base,id:2,name:'Old season',espn_id:2},{...base,id:3,name:'Missing',espn_id:3},{...base,id:4,name:'OL',position_group:'OL'}];
fs.writeFileSync(file,JSON.stringify(data));
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
const mod={exports:{}};
process.chdir(temp);
new Function('require','module','exports',code)(require,mod,mod.exports);
global.fetch = async url => {
 if(url.includes('/3/')) return {ok:false,status:404};
 if(url.includes('gamelog')) {
   const latest=JSON.parse(fs.readFileSync(file)); latest[0].audit_note='Edited during sync'; fs.writeFileSync(file,JSON.stringify(latest));
   return {ok:true,json:async()=>({filters:[{name:'season',value:'2026'}],seasonTypes:[{categories:[{type:'event',events:[{eventId:'a',stats:['1']},{eventId:'b',stats:['2']}]}]}]})};
 }
 return {ok:true,json:async()=>({categories:[{name:'passing',names:['passingYards','passingTouchdowns','completionPct','interceptions'],statistics:[{season:{year:url.includes('/2/')?2025:2026},stats:['1,000','10','70','2']}]}]})};
};
(async()=>{
 const a=mod.exports.syncFromESPN(); assert.strictEqual(a,mod.exports.syncFromESPN());
 const report=await a; const saved=JSON.parse(fs.readFileSync(file));
 assert.equal(report.updated,1); assert.equal(report.skipped.length,3); assert.equal(saved[0].games,2); assert.equal(saved[0].pass_yds,1000); assert.equal(saved[0].ppi,149); assert.equal(saved[0].audit_note,'Edited during sync'); assert.equal(saved[1].pass_yds,100); assert.equal(saved[1].last_updated,undefined);
 console.log('PASS: current-season parsing, games/metrics, skips, concurrent edits, and duplicate sync protection');
 process.chdir(root);
})().catch(e=>{console.error(e);process.exitCode=1});
