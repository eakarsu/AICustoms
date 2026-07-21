'use strict';
const crypto=require('node:crypto');

const TRANSITIONS={intake:['classified'],classified:['screened'],screened:['ready_to_file','exception_review'],exception_review:['dual_approved','rejected'],dual_approved:['ready_to_file'],ready_to_file:['filed'],rejected:[],filed:[]};
function text(value,name,max=500){if(typeof value!=='string'||!value.trim())throw new Error(`${name} is required`);if(value.trim().length>max)throw new Error(`${name} exceeds ${max} characters`);return value.trim();}
function normalizeTradeCase(input){
  if(!input||typeof input!=='object')throw new Error('trade case is required');
  const effectiveAt=new Date(input.effectiveAt);if(Number.isNaN(effectiveAt.getTime()))throw new Error('effectiveAt must be an ISO timestamp');
  const parties=(input.parties||[]).map((party)=>({name:text(party.name,'party.name',255),country:text(party.country,'party.country',2).toUpperCase(),identifiers:Array.isArray(party.identifiers)?party.identifiers:[]}));
  if(!parties.length)throw new Error('at least one party is required');
  if(!Array.isArray(input.goods)||!input.goods.length)throw new Error('at least one good is required');
  const goods=input.goods.map((good)=>({sku:text(good.sku,'good.sku',100),description:text(good.description,'good.description',2000),origin:text(good.origin,'good.origin',2).toUpperCase(),destination:text(good.destination,'good.destination',2).toUpperCase(),value:String(good.value),currency:text(good.currency,'good.currency',3).toUpperCase()}));
  return {externalReference:text(input.externalReference,'externalReference',200),effectiveAt:effectiveAt.toISOString(),jurisdiction:text(input.jurisdiction,'jurisdiction',80),parties,goods};
}
function snapshotHash(value){return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');}
function assertTransition(from,to,role,context={}){
  if(!(TRANSITIONS[from]||[]).includes(to))throw new Error(`invalid transition: ${from} -> ${to}`);
  if(to==='classified'&&(!context.hsCode||!context.classificationSourceVersion||!context.sourceVersionIds?.length||!context.reasoning))throw new Error('classification requires HS code, durable source version, and reasoning');
  if(to==='screened'&&(!context.watchlistVersions?.length||!context.sourceVersionIds?.length||context.matchThreshold==null||!context.screenedAt))throw new Error('screening requires effective durable watchlist versions, threshold, and timestamp');
  if(to==='exception_review'&&(!context.exceptionReason||!context.licenseStatus))throw new Error('exception review requires reason and license status');
  if(to==='dual_approved'&&(role!=='compliance_reviewer'||!context.firstReviewerId||String(context.firstReviewerId)===String(context.secondReviewerId)))throw new Error('dual approval requires two distinct compliance reviewers');
  if(to==='ready_to_file'&&!context.evidenceHash)throw new Error('filing readiness requires an evidence snapshot hash');
  if(to==='filed'&&(role!=='filing_officer'||!context.gatewayReceipt||!context.payloadHash))throw new Error('filing requires officer, immutable payload hash, and gateway receipt');
  return true;
}
module.exports={normalizeTradeCase,snapshotHash,assertTransition};
