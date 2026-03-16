const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'A5tsar',
  category: 'owners',
  description: 'بنل إنشاء اختصارات الأوامر',
  async execute(ctx) {
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🧩 لوحة إنشاء اختصار')
      .setDescription(
        [
          'اضغط الزر بالأسفل لإنشاء اختصار جديد.',
          '',
          '**أمثلة:**',
          '- alias: `م` | expansion: `clear 10`',
          '- alias: `طرد` | expansion: `kick`',
          '',
          'بعد الحفظ: لو كتبت `م` يمسح 10 رسائل.',
        ].join('\n')
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('a5tsar:create')
        .setLabel('إنشاء اختصار')
        .setStyle(ButtonStyle.Primary)
    );

    await ctx.reply({ embeds: [embed], components: [row] });
  },
};
