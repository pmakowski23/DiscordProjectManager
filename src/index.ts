import {
  Client,
  Intents,
  GuildMember,
  MessageButton,
  Collection,
  Role,
  RoleResolvable,
} from 'discord.js';
import { env } from 'process';
import * as express from 'express';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import deploy from './deployCommands';
import {
  addRoleChooser,
  checkProjectName,
  createCategory,
  createChannels,
  createProjectRoles,
  joinButton,
} from './commands/newProject';
import { clearChannels, clearRoles } from './commands/clear';

dotenv.config();
const app = express();
const port = env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.get('/', (_req: express.Request, res: express.Response) => {
  res.send("I'm alive");
});

const { TOKEN } = env;
deploy();

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
  console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  await interaction.deferReply();
  const { member, component, guild } = interaction;
  const guildMember = member as GuildMember;
  const button = component as MessageButton;
  let role:
    | RoleResolvable
    | Collection<string, Role>
    | readonly RoleResolvable[];
  if (button.customId.includes('join')) {
    const roleName = button.customId.split('-').slice(1, 10).join('-');
    role = guild.roles.cache.find((role) => role.name === roleName);
  } else {
    const roleName = button.label;
    role = guild.roles.cache.find((role) => role.name === roleName);
  }
  guildMember.roles.add(role);
  await interaction.editReply(
    `${guildMember.displayName} now is part of ${role.name} team!`,
  );
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;
  const { data } = options;

  if (commandName === 'new-project') {
    try {
      await interaction.deferReply();

      const { projectName, name, shortname } = await checkProjectName(
        interaction,
        data,
      );

      const roles = await createProjectRoles(interaction, shortname);
      const category = await createCategory(interaction, name, shortname);
      const channels = await createChannels(interaction, category, roles);
      const generalChannel = channels[0];
      await addRoleChooser(roles, generalChannel);

      await interaction.editReply({
        content: `You created project with name ${projectName}`,
        components: [joinButton(roles[0].name)],
      });
    } catch (err) {
      console.log(err);
    }
  } else if (commandName === 'clear') {
    try {
      await clearRoles(interaction);
      await clearChannels(interaction);
    } catch (err) {
      console.log(err);
    }

    await interaction.reply('Done');
  } else {
    await interaction.reply('Use proper command.');
  }
});

client.login(TOKEN);

const runApp = async (app: express.Application) => {
  app.listen(port, () =>
    console.log(`Server running on http://localhost:${port}`),
  );
};

runApp(app);
