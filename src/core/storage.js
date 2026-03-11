const fs = require('node:fs');
const path = require('node:path');
const dataDir = path.join(process.cwd(), 'data');
const statePath = path.join(dataDir, 'state.json');
const permissionsPath = path.join(dataDir, 'permissions.json');
const defaultState = { guilds:{}, userPoints:{}, userWarnings:{}, inviteSnapshot:{}, inviteLeaders:{}, shortcuts:{} };
function ensure(){ if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir,{recursive:true}); }
function readJson(p,f){ if(!fs.existsSync(p)) return f; return JSON.parse(fs.readFileSync(p,'utf8')); }
function writeJson(p,v){ fs.writeFileSync(p, JSON.stringify(v,null,2)); }
function loadState(){ ensure(); if(!fs.existsSync(statePath)) writeJson(statePath, defaultState); return { ...defaultState, ...readJson(statePath, defaultState) }; }
function saveState(s){ writeJson(statePath,s); }
function loadPermissions(d){ ensure(); if(!fs.existsSync(permissionsPath)) writeJson(permissionsPath, d||{}); return readJson(permissionsPath, d||{}); }
function savePermissions(v){ writeJson(permissionsPath,v); }
module.exports={ loadState, saveState, loadPermissions, savePermissions };
