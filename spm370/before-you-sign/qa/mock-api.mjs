// Isolated synthetic backend for browser QA. Never deploy this file as the real endpoint.
import http from 'node:http';import {testHandler} from '../backend/test-support.mjs';
const handler=await testHandler();
http.createServer(async(req,res)=>{try{const chunks=[];for await(const chunk of req)chunks.push(chunk);const body=Buffer.concat(chunks);const response=await handler(new Request('http://127.0.0.1:8766'+req.url,{method:req.method,headers:req.headers,...(body.length?{body}:{})}));res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}catch{res.writeHead(500);res.end('{"error":"Test server error"}');}}).listen(8766,'127.0.0.1',()=>console.log('Synthetic backend ready'));
