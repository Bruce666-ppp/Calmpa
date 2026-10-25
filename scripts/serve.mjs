import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const types={'.mp4':'video/mp4','.js':'text/javascript; charset=utf-8','.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.pdf':'application/pdf'};
http.createServer(async(req,res)=>{
 try {
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,'.'+(pathname.endsWith('/')?pathname+'index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
  const body=await readFile(file);
  const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes'};
  if(req.headers.range){
   const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
   let start=match?.[1]?Number(match[1]):0;
   let end=match?.[2]?Number(match[2]):body.length-1;
   if(match && !match[1] && match[2]){start=Math.max(0,body.length-Number(match[2]));end=body.length-1;}
   end=Math.min(end,body.length-1);
   if(!match||(!match[1]&&!match[2])||start>end||start>=body.length){res.writeHead(416,{'Content-Range':`bytes */${body.length}`});res.end();return;}
   res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${body.length}`,'Content-Length':end-start+1});res.end(req.method==='HEAD'?undefined:body.subarray(start,end+1));return;
  }
  res.writeHead(200,{...headers,'Content-Length':body.length});res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Page not found');}
}).listen(Number(process.argv[2] || 4173),'127.0.0.1',()=>console.log('Portfolio preview: http://127.0.0.1:'+(process.argv[2] || 4173)));
