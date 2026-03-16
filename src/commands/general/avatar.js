module.exports={name:'avatar',category:'general',description:'عرض صورة شخص',async execute(ctx){const u=ctx.targetUserFromArgs()||ctx.user;return ctx.reply(u.displayAvatarURL({size:4096}));}};
