const path = require('node:path');
const { SlashCommandBuilder } = require('discord.js');
const catalog = require('../data/catalog');
function loadCommands(){
  const map = new Map();
  const bySlash = new Map();
  for (const [category, names] of Object.entries(catalog)) {
    for (const name of names) {
      const mod = require(path.join(process.cwd(), 'src', 'commands', category, `${name}.js`));
      map.set(mod.name, mod);
      bySlash.set(mod.name.toLowerCase(), mod.name);
    }
  }
  return { map, bySlash, catalog };
}
function buildSlashCommands(commands){
  return [...commands.values()].map(cmd=>new SlashCommandBuilder().setName(cmd.name.toLowerCase()).setDescription(cmd.description||`أمر ${cmd.name}`).addStringOption(o=>o.setName('args').setDescription('arguments').setRequired(false)).toJSON());
}
module.exports={ loadCommands, buildSlashCommands };
