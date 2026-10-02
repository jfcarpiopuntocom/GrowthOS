import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";
import { calculateSSS, type SSSInput } from "./score.js";
import { localizeResult, type Locale } from "./i18n.js";

const __dirname=dirname(fileURLToPath(import.meta.url));
const widgetHtml=readFileSync(join(__dirname,"../public/scorecard.html"),"utf8");
const PORT=Number(process.env.PORT??8787);
const MCP_PATH="/mcp";

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
const localizedInputSchema=z.object({...sssShape,locale:localeSchema.optional()});

function createSssServer(){
  const server=new McpServer({name:"business-survival-score",version:"1.0.10"},{instructions:"Business Survival Score is an educational, deterministic business-health diagnostic using eight aggregate business metrics. Use its calculation tool only when the user wants a business-health score, metric breakdown, or review priorities from those metrics. It does not predict bankruptcy, guarantee survival, make lending or investment decisions, or provide legal, tax, or accounting advice."});

  registerAppResource(server,"sss-scorecard","ui://sss/scorecard.html",{},async()=>({
    contents:[{uri:"ui://sss/scorecard.html",mimeType:RESOURCE_MIME_TYPE,text:widgetHtml}]
  }));

  registerAppTool(server,"calculate_business_survival_score",{
    title:"Calculate Business Survival Score",
    description:"Calculates a deterministic 0-100 Business Survival Score from eight aggregate business metrics and returns the metric breakdown plus up to three lowest-scoring review priorities. Use it for business-health scoring and metric prioritization when the user supplies the required inputs. It does not predict bankruptcy or guarantee survival and does not make lending, investment, legal, tax, or accounting decisions.",
    inputSchema:{...sssShape,locale:localeSchema.optional()},
    _meta:{ui:{resourceUri:"ui://sss/scorecard.html"}},
    annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}
  },async(args)=>{
    const parsed=localizedInputSchema.parse(args);
    const {locale="en",...raw}=parsed;
    const input=raw as SSSInput;
    const result=localizeResult(calculateSSS(input),locale as Locale);
    return {
      content:[{type:"text",text:`Business Survival Score ${result.score}/100 · ${result.riskLabel}. ${result.actionPlan.length} priority metrics.`}],
      structuredContent:result
    };
  });

  return server;
}

async function readJson(req:any){
  const chunks:Buffer[]=[];
  for await(const chunk of req) chunks.push(Buffer.from(chunk));
  const text=Buffer.concat(chunks).toString("utf8");
  return text?JSON.parse(text):{};
}

function sendJson(res:any,status:number,body:any){
  res.writeHead(status,{
    "content-type":"application/json; charset=utf-8",
    "access-control-allow-origin":"*"
  });
  res.end(JSON.stringify(body));
}

const httpServer=createServer(async(req,res)=>{
  if(!req.url){res.writeHead(400).end("Missing URL");return;}
  const url=new URL(req.url,`http://${req.headers.host??"localhost"}`);

  if(req.method==="OPTIONS"){
    res.writeHead(204,{
      "Access-Control-Allow-Origin":"*",
      "Access-Control-Allow-Methods":"POST,GET,DELETE,OPTIONS",
      "Access-Control-Allow-Headers":"content-type,mcp-session-id",
      "Access-Control-Expose-Headers":"Mcp-Session-Id"
    });
    res.end();
    return;
  }

  if((req.method==="GET" || req.method==="HEAD") && url.pathname==="/.well-known/openai-apps-challenge"){
    res.writeHead(200,{
      "content-type":"text/plain; charset=utf-8",
      "cache-control":"no-store"
    });
    if(req.method==="HEAD") res.end();
    else res.end("YcAqQF2X6HWUHvVRd7hImDU0OxzFolxRJIeWMTpoX4s");
    return;
  }

  if(req.method==="GET" && (url.pathname==="/" || url.pathname==="/health")){
    sendJson(res,200,{
      ok:true,
      name:"business-survival-score",
      version:"1.0.10",
      mode:"anonymous-stateless",
      mcp:MCP_PATH
    });
    return;
  }

  if(req.method==="POST" && url.pathname==="/api/calculate"){
    try{
      const body=await readJson(req);
      const parsed=localizedInputSchema.parse(body);
      const {locale="en",...raw}=parsed;
      const input=raw as SSSInput;
      sendJson(res,200,localizeResult(calculateSSS(input),locale as Locale));
    }catch(e:any){
      sendJson(res,400,{error:e?.message??"bad_request"});
    }
    return;
  }

  const MCP_METHODS=new Set(["POST","GET","DELETE"]);
  if(url.pathname===MCP_PATH && req.method && MCP_METHODS.has(req.method)){
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Expose-Headers","Mcp-Session-Id");
    const server=createSssServer();
    const transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});
    res.on("close",()=>{transport.close();server.close();});
    try{
      await server.connect(transport);
      await transport.handleRequest(req,res);
    }catch{
      if(!res.headersSent)res.writeHead(500).end("Internal server error");
    }
    return;
  }

  res.writeHead(404).end("Not Found");
});

httpServer.listen(PORT,()=>console.log(`Business Survival Score v1.0.10 listening on :${PORT}${MCP_PATH}`));