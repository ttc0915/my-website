import { sha256 } from '../js/sha256.js';

export async function onRequest(context) {
  const { request, env, next } = context;
  const response = await next();
  const contentType = response.headers.get("content-type") || "";
  
  if (contentType.includes("text/html")) {
    let html = await response.text();
    
    // 处理普通密码
    const password = env.PASSWORD || "";
    let passwordHash = "";
    if (password) {
      passwordHash = await sha256(password);
    }
    html = html.replace('window.__ENV__.PASSWORD = "{{PASSWORD}}";', 
      `window.__ENV__.PASSWORD = "${passwordHash}";`);

    // 处理管理员密码 - 确保这部分代码被执行
    const adminPassword = env.ADMINPASSWORD || "";
    let adminPasswordHash = "";
    if (adminPassword) {
      adminPasswordHash = await sha256(adminPassword);
    }
    html = html.replace('window.__ENV__.ADMINPASSWORD = "{{ADMINPASSWORD}}";',
      `window.__ENV__.ADMINPASSWORD = "${adminPasswordHash}";`);
    
    return new Response(html, {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
    });
  }
  
  return response;
}