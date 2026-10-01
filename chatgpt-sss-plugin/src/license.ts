import { createHmac, timingSafeEqual } from "node:crypto";

type Payload = { plan:"pro"; exp:number; sub?:string };

const b64u = (s:string) => Buffer.from(s).toString("base64url");

export function issueLicense(secret:string, days=365, sub?:string){
  const payload:Payload = { plan:"pro", exp:Date.now()+days*86400000, ...(sub?{sub}:{}) };
  const body = b64u(JSON.stringify(payload));
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return body+"."+sig;
}

export function verifyLicense(secret:string, token?:string):Payload|null{
  if(!secret || !token) return null;
  const [body,sig] = token.split(".");
  if(!body || !sig) return null;
  const expected = createHmac("sha256", secret).update(body).digest();
  let got:Buffer;
  try { got = Buffer.from(sig, "base64url"); } catch { return null; }
  if(got.length !== expected.length || !timingSafeEqual(got, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body,"base64url").toString("utf8")) as Payload;
    return payload.plan==="pro" && payload.exp>Date.now() ? payload : null;
  } catch { return null; }
}
