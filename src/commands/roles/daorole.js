module.exports={name:'daorole',category:'roles',description:'حذف تحديد الرول التلقائي',async execute(ctx){ctx.gState.autoRoleId=null;return ctx.reply('✅ تم حذف AutoRole');}};
