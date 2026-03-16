const { EmbedBuilder } = require('discord.js');

const categoryTitles = {
  general: '📌 الأوامر العامة',
  admin: '🛡️ الأوامر الإدارية',
  roles: '🎭 أوامر الرولات',
  chat: '💬 أوامر الشات',
  security: '🔒 أوامر الحماية',
  settings: '⚙️ أوامر الإعدادات',
  tickets: '🎫 أوامر التذاكر',
  owners: '👑 أوامر الأونرز',
};

const categoryAliases = {
  عام: 'general',
  العامة: 'general',
  ادارة: 'admin',
  الادارة: 'admin',
  الادارية: 'admin',
  رولات: 'roles',
  الرولات: 'roles',
  شات: 'chat',
  الشات: 'chat',
  حماية: 'security',
  الحماية: 'security',
  اعدادات: 'settings',
  الاعدادات: 'settings',
  تذاكر: 'tickets',
  التذاكر: 'tickets',
  اونرز: 'owners',
  الاونرز: 'owners',
};

function normalizeCategory(input) {
  if (!input) return null;
  const raw = String(input).toLowerCase();
  return categoryAliases[raw] || raw;
}

function chunkCommands(commands, size = 12) {
  const chunks = [];
  for (let i = 0; i < commands.length; i += size) {
    chunks.push(commands.slice(i, i + size));
  }
  return chunks;
}

module.exports = {
  name: 'help',
  category: 'general',
  description: 'قائمة المساعدة',
  async execute(ctx) {
    const requested = normalizeCategory(ctx.args[0]);
    const categories = Object.keys(ctx.catalog);

    if (requested && !ctx.catalog[requested]) {
      await ctx.reply(`❌ القسم غير موجود. الأقسام المتاحة: ${categories.join(' , ')}`);
      return;
    }

    if (requested) {
      const cmds = ctx.catalog[requested];
      const embeds = [];
      const chunks = chunkCommands(cmds, 14);

      chunks.forEach((chunk, idx) => {
        const embed = new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle(`${categoryTitles[requested] || requested} ${chunks.length > 1 ? `(${idx + 1}/${chunks.length})` : ''}`)
          .setDescription(
            [
              `**عدد الأوامر في القسم:** ${cmds.length}`,
              `**طريقة الاستخدام:** \`${ctx.config.prefix}<command>\` أو \`/<command>\``,
              '',
              chunk.map((c) => `• \`${c}\``).join('\n'),
            ].join('\n')
          )
          .setFooter({ text: `طلب بواسطة ${ctx.user.username}` });

        embeds.push(embed);
      });

      await ctx.reply({ embeds });
      return;
    }

    const totalCommands = categories.reduce((sum, cat) => sum + ctx.catalog[cat].length, 0);

    const overview = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('✨ مركز مساعدة البوت')
      .setDescription(
        [
          `أهلاً ${ctx.user} 👋`,
          `**Prefix الحالي:** \`${ctx.config.prefix}\``,
          `**إجمالي الأوامر:** **${totalCommands}**`,
          '',
          '📍 **عرض قسم معين:**',
          `\`${ctx.config.prefix}help admin\` أو \`/help args:admin\``,
          '',
          '🧠 **نصيحة:** تقدر تستخدم نظام الاختصارات من \`/a5tsar\` (للأونرز).',
        ].join('\n')
      )
      .setThumbnail(ctx.guild.iconURL({ size: 512 }) || null);

    const categoriesEmbed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('📚 الأقسام المتاحة')
      .setDescription(
        categories
          .map((cat) => `${categoryTitles[cat] || cat} — **${ctx.catalog[cat].length}** أوامر`)
          .join('\n')
      )
      .addFields({
        name: '🛡️ الصلاحيات',
        value: [
          '• الأونرز فقط يقدرون يستخدمون قسم **owners**.',
          '• صاحب صلاحية **Administrator** يقدر يستخدم كل الأقسام (عدا owners).',
          `• تقدر تحدد رتبة لكل قسم بأمر: \`${ctx.config.prefix}permission <category> <role>\``,
        ].join('\n'),
      });

    await ctx.reply({ embeds: [overview, categoriesEmbed] });
  },
};
