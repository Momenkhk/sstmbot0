const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Partials, REST, Routes } = require('discord.js');
const { loadState, saveState, loadPermissions, savePermissions } = require('./core/storage');
const { loadCommands, buildSlashCommands } = require('./core/commandRegistry');
const { isOwner, hasAccess } = require('./core/permissions');

const configPath = path.join(process.cwd(), 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const state = loadState();
const { map: commands, bySlash, catalog } = loadCommands();
const permissionsByCategory = loadPermissions(config.defaultPermissionRoleByCategory || {});
const aliases = { removeshortcut: 'removeShortcut' };

const client = new Client({ intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildInvites,GatewayIntentBits.GuildVoiceStates,GatewayIntentBits.MessageContent], partials:[Partials.Channel] });
function saveConfig(){ fs.writeFileSync(configPath, JSON.stringify(config, null, 2)); }
function getGuildState(guildId){ if(!state.guilds[guildId]) state.guilds[guildId]={securityToggles:{},blockedWords:[],channels:{},colorRoleIds:[],ownersOnlyNoPrefix:false,autoRoleId:null}; return state.guilds[guildId]; }

function resolveCommand(raw, slash=false){ if(!raw) return raw; if(slash && bySlash.has(raw)) return bySlash.get(raw); const k=String(raw).toLowerCase(); if(state.shortcuts[k]) return state.shortcuts[k]; if(aliases[k]) return aliases[k]; if(commands.has(raw)) return raw; return [...commands.keys()].find(x=>x.toLowerCase()===k)||raw; }

function buildCtx(source,args,commandName){
  const guild=source.guild, member=source.member, user=source.user||source.author, channel=source.channel, gState=getGuildState(guild.id);
  const reply=async(payload)=>{ if(typeof source.isChatInputCommand==='function'){ if(source.replied||source.deferred) return source.followUp(payload); return source.reply(payload);} return source.reply(payload); };
  return { client,config,state,catalog,commands,permissionsByCategory,savePermissions:()=>savePermissions(permissionsByCategory),saveConfig,guild,member,user,channel,gState,args,commandName,reply,
    targetMemberFromArgs:(i=0)=>{const id=(args[i]||'').replace(/[<@!>]/g,'');return source.mentions?.members?.first()||guild.members.cache.get(id);},
    targetUserFromArgs:(i=0)=>{const id=(args[i]||'').replace(/[<@!>]/g,'');return source.mentions?.users?.first()||guild.members.cache.get(id)?.user;},
    targetRoleFromArgs:(i=0)=>{const id=(args[i]||'').replace(/[<@&>]/g,'');return source.mentions?.roles?.first()||guild.roles.cache.get(id);},
    targetChannelFromArgs:(i=0)=>{const id=(args[i]||'').replace(/[<#>]/g,'');return source.mentions?.channels?.first()||guild.channels.cache.get(id);},
  };
}

async function runCommand(source,raw,args,slash=false){
  const name=resolveCommand(raw,slash); const cmd=commands.get(name); if(!cmd) return source.reply('❌ الأمر غير موجود');
  const userId=(source.user||source.author).id;
  if(!hasAccess({config,member:source.member,userId,category:cmd.category,permissionsByCategory})) return source.reply('⛔ ليس لديك صلاحية لاستخدام هذا الأمر');
  state.userPoints[`${source.guild.id}:${userId}`]=(state.userPoints[`${source.guild.id}:${userId}`]||0)+1;
  await cmd.execute(buildCtx(source,args,name));
  saveState(state);
}

client.once('ready', async()=>{
  console.log(`Logged in as ${client.user.tag}`);
  const rest=new REST({version:'10'}).setToken(config.token);
  try{ await rest.put(Routes.applicationCommands(config.clientId),{body:buildSlashCommands(commands)}); console.log(`Registered ${commands.size} slash commands`);}catch(e){console.error('Slash register error:',e.message);} 
  for(const [,g] of client.guilds.cache){try{const invites=await g.invites.fetch(); state.inviteSnapshot[g.id]=Object.fromEntries(invites.map(i=>[i.code,i.uses||0]));}catch{}}
  saveState(state);
});

client.on('guildMemberAdd', async(member)=>{
  const gs=getGuildState(member.guild.id); if(gs.autoRoleId){const r=member.guild.roles.cache.get(gs.autoRoleId); if(r) await member.roles.add(r).catch(()=>null);} 
  try{const before=state.inviteSnapshot[member.guild.id]||{}; const invites=await member.guild.invites.fetch(); const after=Object.fromEntries(invites.map(i=>[i.code,i.uses||0])); state.inviteSnapshot[member.guild.id]=after; const used=Object.keys(after).find(c=>(after[c]||0)>(before[c]||0)); if(used){const inv=invites.get(used); if(inv?.inviterId){const k=`${member.guild.id}:${inv.inviterId}`; state.inviteLeaders[k]=(state.inviteLeaders[k]||0)+1;}} saveState(state);}catch{}
});

client.on('messageCreate', async(message)=>{
  if(!message.guild||message.author.bot) return; const gs=getGuildState(message.guild.id); const noPrefix=gs.ownersOnlyNoPrefix&&isOwner(config,message.author.id); if(!message.content.startsWith(config.prefix)&&!noPrefix) return;
  const raw=message.content.startsWith(config.prefix)?message.content.slice(config.prefix.length).trim():message.content.trim(); if(!raw) return;
  const parts=raw.split(/\s+/); const cmd=parts.shift();
  try{ await runCommand(message,cmd,parts,false);}catch(e){console.error(e);message.reply(`❌ ${e.message}`);} 
});

client.on('interactionCreate', async(interaction)=>{
  if(!interaction.isChatInputCommand()||!interaction.guild) return; const args=(interaction.options.getString('args')||'').split(/\s+/).filter(Boolean);
  try{await runCommand(interaction,interaction.commandName,args,true);}catch(e){console.error(e); if(interaction.replied||interaction.deferred) await interaction.followUp(`❌ ${e.message}`); else await interaction.reply(`❌ ${e.message}`);} 
});

if(!config.token||config.token.includes('PUT_YOUR_BOT_TOKEN_HERE')){console.error('Please set token in config.json');process.exit(1);} 
client.login(config.token);
