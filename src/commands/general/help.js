const { EmbedBuilder } = require('discord.js');
module.exports={name:'help',category:'general',description:'قائمة المساعدة',async execute(ctx){
  const e=new EmbedBuilder().setTitle('📚 قائمة الأوامر').setColor(0x5865f2).setDescription(`Prefix: ${ctx.config.prefix}`);
  for (const [cat, cmds] of Object.entries(ctx.catalog)) e.addFields({name:`قسم ${cat}`,value:cmds.map(c=>`\`${c}\``).join(' | ').slice(0,1024)});
  return ctx.reply({embeds:[e]});
}};
