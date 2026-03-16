module.exports={name:'wordlist',category:'security',description:'عرض الكلامات التي يعاقب كاتبها',async execute(ctx){return ctx.reply((ctx.gState.blockedWords||[]).join('\n')||'القائمة فارغة');}};
