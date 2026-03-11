const { PermissionFlagsBits } = require('discord.js');
function isOwner(config, userId){ return (config.owners || []).includes(userId); }
function hasAccess({ config, member, userId, category, permissionsByCategory }){
  if (isOwner(config, userId)) return true;
  if (member.permissions.has(PermissionFlagsBits.Administrator) && category !== 'owners') return true;
  if (category === 'owners') return false;
  const roleId = permissionsByCategory[category];
  if (!roleId) return true;
  return member.roles.cache.has(roleId);
}
module.exports={ isOwner, hasAccess };
