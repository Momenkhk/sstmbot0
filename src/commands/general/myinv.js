module.exports={name:'myinv',category:'general',description:'عدد دعواتك',async execute(ctx){return ctx.reply(`دعواتك: **${ctx.state.inviteLeaders[`${ctx.guild.id}:${ctx.user.id}`]||0}**`);}};
