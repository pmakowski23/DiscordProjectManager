import {
  ButtonInteraction,
  GuildMember,
  MessageButton,
  Role,
} from 'discord.js';

const handleButtonClick = (interaction: ButtonInteraction) => {
  const { member, component, guild } = interaction;
  const guildMember = member as GuildMember;
  const button = component as MessageButton;
  let role: Role;
  let isRemove = false;
  if (button.customId.includes('remove')) {
    isRemove = true;
    const shortname = button.customId.split('-')[0];
    const roles = guild.roles.cache.find((role) =>
      role.name.includes(shortname),
    );
    guildMember.roles.remove(roles);
    role = {
      name: shortname,
    } as Role;
  } else {
    if (button.customId.includes('join')) {
      const roleName = button.customId.split('-').slice(1, 10).join('-');
      role = guild.roles.cache.find((role) => role.name === roleName);
    } else {
      const roleName = button.label;
      role = guild.roles.cache.find((role) => role.name === roleName);
    }
    guildMember.roles.add(role);
  }

  return { guildMember, role, isRemove };
};

export const buttonInteractionHandler = async (
  interaction: ButtonInteraction,
) => {
  await interaction.deferReply();

  const { guildMember, role, isRemove } = handleButtonClick(interaction);

  let action = 'is now part of';
  if (isRemove) action = 'left';

  await interaction.editReply(
    `${guildMember.displayName} ${action} ${role.name} team!`,
  );
};
