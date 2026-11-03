// Netlify serverless function. NOAA Regional Climate Centers ACIS station observations.
const allowed=new Set('DEN COS PUB ALS GJT CYS LAR CPR SHR BIL BZN MSO GTF FCA SLC LGU FLG PRC RNO EKO BOI IDA PIH GEG YKM BDN LMT MSP DLH INL FAR BIS GFK RAP FSD OMA LBF DSM ORD MKE GRB MQT DTW BUF ROC SYR ALB BTV CON CAR PWM PIT CLE CMH IND STL MCI AMA LBB SAF ABQ'.split(' '));
exports.handler=async(event)=>{
 if(event.httpMethod!=='POST')return {statusCode:405,body:'Method not allowed'};
 try{
 const body=JSON.parse(event.body||'{}');const ids=[...new Set((body.stations||[]).filter(s=>allowed.has(s)))].slice(0,65);
 if(!ids.length)return {statusCode:400,body:'No valid stations'};
 const now=new Date(),end=new Date(now);end.setUTCDate(end.getUTCDate()-1); // last completed local climate day is typically yesterday
 const start=new Date(now);start.setUTCDate(start.getUTCDate()-3);
 const fmt=d=>d.toISOString().slice(0,10);
 const query={sids:ids.join(','),sdate:fmt(start),edate:fmt(now),elems:[{name:'snowdepth'}],meta:'name,state,uid'};
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),15000);
 let response;try{response=await fetch('https://data.rcc-acis.org/MultiStnData',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(query),signal:controller.signal})}finally{clearTimeout(timeout)}
 if(!response.ok)throw Error('ACIS response '+response.status);
 const payload=await response.json();if(payload.error)throw Error('ACIS: '+payload.error);
 const observations={};const stations=payload.data||[];
 for(let i=0;i<stations.length;i++){
 const st=stations[i];const id=ids[i];if(!id)continue;
 const entries=st.data||[];for(let j=entries.length-1;j>=0;j--){const [date,raw]=entries[j];const val=Array.isArray(raw)?raw[0]:raw;const depth=Number(val);
 // ACIS uses M for missing and T for trace. Neither counts as positive measured snow.
 if(Number.isFinite(depth)&&depth>0){const age=(Date.now()-Date.parse(date+'T23:59:59Z'))/3600000;if(age>=-24&&age<=48)observations[id]={depth,date};break}
 }
 }
 return {statusCode:200,headers:{'Content-Type':'application/json','Cache-Control':'public, max-age=1800'},body:JSON.stringify({observations,checkedAt:new Date().toISOString(),source:'NOAA Regional Climate Centers ACIS'})};
 }catch(e){return {statusCode:502,headers:{'Content-Type':'application/json'},body:JSON.stringify({error:'Observation provider unavailable',detail:String(e.message||e)})}}
};
