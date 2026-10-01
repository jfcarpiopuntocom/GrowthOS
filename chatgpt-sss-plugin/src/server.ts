import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";
import { calculateSSS, type SSSInput } from "./score.js";
import { simulate24 } from "./cashflow.js";
import { verifyLicense } from "./license.js";
import { executiveReport } from "./report.js";
import { localizeResult, type Locale } from "./i18n.js";

const __dirname=dirname(fileURLToPath(import.meta.url));
const widgetHtml=readFileSync(join(__dirname,"../public/scorecard.html"),"utf8");
const PORT=Number(process.env.PORT??8787);
const MCP_PATH="/mcp";
const LICENSE_SECRET=process.env.SSS_LICENSE_SECRET??"";

const sssShape={
  runwayMonths:z.number().min(0),
  cacPaybackMonths:z.number().min(0),
  burnMultiple:z.number().min(0),
  grossMarginPct:z.number().min(0).max(100),
  workingCapitalRatio:z.number().min(0),
  customerConcentrationPct:z.number().min(0).max(100),
  debtToCashflowVelocity:z.number().min(0),
  capitalEfficiencyIndex:z.number().min(0)
};
const localeSchema=z.enum(["en","es","pt"]).default("en");
const sssSchema=z.object(sssShape);
const localizedInputSchema=z.object({...sssShape,locale:localeSchema.optional()});

function proFromArgs(args:any){
  const token=args?.licenseKey;
  return verifyLicense(LICENSE_SECRET,token);
}
function requirePro(args:any){
  if(!proFromArgs(args)) throw new Error("PRO_LICENSE_REQUIRED");
}

function createSssServer(){
  const server=new McpServer({name:"startup-survival-score",version:"0.2.0"});

  registerAppResource(server,"sss-scorecard","ui://sss/scorecard.html",{},async()=>({
    contents:[{uri:"ui://sss/scorecard.html",mimeType:RESOURCE_MIME_TYPE,text:widgetHtml}]
  }));

  registerAppTool(server,"calculate_sss",{
    title:"Calculate Startup Survival Score",
    description:"Use this when a founder or business owner asks how to avoid early business failure, bankruptcy, closure, running out of cash, financial growth pains, cash crunches, or whether their startup is financially healthy. It calculates a deterministic 0-100 Startup Survival Score from 8 aggregate business metrics and returns the 3 weakest metrics under 60. It does not require bank access, transaction feeds, accounting connections, or financial documents. Do not use for personal finance, stock investing, tax filing, or insolvency legal advice.",
    inputSchema:{...sssShape,locale:localeSchema.optional()},
    _meta:{ui:{resourceUri:"ui://sss/scorecard.html"}}
  },async(args)=>{
    const parsed=localizedInputSchema.parse(args);
    const {locale="en",...raw}=parsed;
    const input=raw as SSSInput;
    const result=localizeResult(calculateSSS(input),locale as Locale);
    return {content:[{type:"text",text:`SSS ${result.score}/100 · ${result.riskLabel}. ${result.actionPlan.length} priority metrics.`}],structuredContent:result};
  });

  registerAppTool(server,"analyze_sss",{
    title:"Analyze Startup Survival Score",
    description:"Use this for an already-entitled Pro user who wants deeper interpretation of why their business may be at risk of closure, cash exhaustion, unsustainable growth, or scaling pain after calculating the Startup Survival Score. Prioritizes the weakest survival metrics. Do not use for personal finance, investment selection, tax filing, or legal insolvency advice.",
    inputSchema:{...sssShape,locale:localeSchema.optional(),licenseKey:z.string().min(10)},
    _meta:{ui:{resourceUri:"ui://sss/scorecard.html"}}
  },async(args)=>{
    requirePro(args);
    const parsed=z.object({...sssShape,locale:localeSchema.optional(),licenseKey:z.string().min(10)}).parse(args);
    const {locale="en",licenseKey:_licenseKey,...raw}=parsed;
    const input=raw as SSSInput;
    const result=localizeResult(calculateSSS(input),locale as Locale);
    const priorities=result.actionPlan.map((m,i)=>({rank:i+1,metric:m.label,subScore:m.subScore,severity:m.severity,weight:m.weight}));
    return {content:[{type:"text",text:`SSS ${result.score}/100 (${result.risk}). Priorities: ${priorities.map(p=>p.metric).join(", ")||"none"}.`}],structuredContent:{...result,priorities}};
  });

  registerAppTool(server,"simulate_cashflow",{
    title:"Simulate 24-month cashflow",
    description:"Use this for an already-entitled Pro user who asks what happens to business cash over the next 24 months under base, stress, or crash conditions, especially for runway pressure or growth-pain scenarios. This is a scenario model, not a prediction or guarantee.",
    inputSchema:{
      openingCash:z.number(),monthlyRevenue:z.number().min(0),monthlyCosts:z.number().min(0),
      revenueGrowthPct:z.number().optional(),costGrowthPct:z.number().optional(),
      scenario:z.enum(["base","stress","crash"]),licenseKey:z.string().min(10)
    },
    _meta:{}
  },async(args)=>{
    requirePro(args);
    const result=simulate24(args as any,(args as any).scenario);
    return {content:[{type:"text",text:`24-month ${result.scenario} scenario. Cash first turns negative in month ${result.runwayMonth??"none"}.`}],structuredContent:result};
  });

  registerAppTool(server,"generate_report",{
    title:"Generate executive SSS report",
    description:"Use this for an already-entitled Pro user who wants a shareable executive report of the Startup Survival Score, risk level, metric breakdown, and priorities. It summarizes the supplied aggregate metrics and does not fetch bank, accounting, transaction, or document data.",
    inputSchema:{...sssShape,locale:localeSchema.optional(),licenseKey:z.string().min(10)},
    _meta:{}
  },async(args)=>{
    requirePro(args);
    const parsed=z.object({...sssShape,locale:localeSchema.optional(),licenseKey:z.string().min(10)}).parse(args);
    const {locale="en",licenseKey:_licenseKey,...raw}=parsed;
    const input=raw as SSSInput;
    const result=localizeResult(calculateSSS(input),locale as Locale);
    const html=executiveReport(input,result);
    return {content:[{type:"text",text:"Executive HTML report generated."}],structuredContent:{score:result.score,risk:result.risk,html}};
  });

  return server;
}

async function readJson(req:any){
  const chunks:Buffer[]=[];
  for await(const c of req) chunks.push(Buffer.from(c));
  const text=Buffer.concat(chunks).toString("utf8");
  return text?JSON.parse(text):{};
}
function sendJson(res:any,status:number,body:any){
  res.writeHead(status,{"content-type":"application/json; charset=utf-8","access-control-allow-origin":"*"});
  res.end(JSON.stringify(body));
}
function httpLicense(req:any,body:any){
  const raw=req.headers["x-sss-license"] || body.licenseKey;
  return verifyLicense(LICENSE_SECRET,Array.isArray(raw)?raw[0]:raw);
}

const httpServer=createServer(async(req,res)=>{
  if(!req.url){res.writeHead(400).end("Missing URL");return;}
  const url=new URL(req.url,`http://${req.headers.host??"localhost"}`);

  if(req.method==="OPTIONS"){
    res.writeHead(204,{
      "Access-Control-Allow-Origin":"*",
      "Access-Control-Allow-Methods":"POST,GET,DELETE,OPTIONS",
      "Access-Control-Allow-Headers":"content-type,mcp-session-id,x-sss-license",
      "Access-Control-Expose-Headers":"Mcp-Session-Id"
    });res.end();return;
  }

  if(req.method==="GET" && (url.pathname==="/" || url.pathname==="/health")){
    sendJson(res,200,{ok:true,name:"startup-survival-score",version:"0.2.0",mcp:MCP_PATH});return;
  }

  if(req.method==="POST" && url.pathname.startsWith("/api/")){
    try{
      const body=await readJson(req);
      if(url.pathname==="/api/calculate"){
        const parsed=localizedInputSchema.parse(body);
        const {locale="en",...raw}=parsed;
        const input=raw as SSSInput;
        sendJson(res,200,localizeResult(calculateSSS(input),locale as Locale));return;
      }
      if(!httpLicense(req,body)){sendJson(res,402,{error:"PRO_LICENSE_REQUIRED"});return;}
      if(url.pathname==="/api/analyze"){
        const parsed=localizedInputSchema.parse(body);
        const {locale="en",...raw}=parsed;
        const input=raw as SSSInput;
        const result=localizeResult(calculateSSS(input),locale as Locale);
        sendJson(res,200,{...result,priorities:result.actionPlan});return;
      }
      if(url.pathname==="/api/simulate"){
        sendJson(res,200,simulate24(body,body.scenario??"base"));return;
      }
      if(url.pathname==="/api/report"){
        const input=sssSchema.parse(body) as SSSInput;
        const result=calculateSSS(input);
        res.writeHead(200,{"content-type":"text/html; charset=utf-8"});
        res.end(executiveReport(input,result));return;
      }
      sendJson(res,404,{error:"not_found"});return;
    }catch(e:any){sendJson(res,400,{error:e?.message??"bad_request"});return;}
  }

  const MCP_METHODS=new Set(["POST","GET","DELETE"]);
  if(url.pathname===MCP_PATH && req.method && MCP_METHODS.has(req.method)){
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Expose-Headers","Mcp-Session-Id");
    const server=createSssServer();
    const transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});
    res.on("close",()=>{transport.close();server.close();});
    try{await server.connect(transport);await transport.handleRequest(req,res);}
    catch(e){console.error(e);if(!res.headersSent)res.writeHead(500).end("Internal server error");}
    return;
  }
  res.writeHead(404).end("Not Found");
});

httpServer.listen(PORT,()=>console.log(`SSS plugin v0.2.0 listening on :${PORT}${MCP_PATH}`));
