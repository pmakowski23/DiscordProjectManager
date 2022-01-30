import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();
const { TOKEN, CLIENT_ID } = process.env;

const commands = [];
const commandFiles = fs
  .readdirSync(`${process.cwd()}\\src\\commands`)
  .filter((file) => file.endsWith('.ts'));

export default async () => {
  for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: '9' }).setToken(TOKEN);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(CLIENT_ID), {
      body: commands,
    });

    console.log('Successfully reloaded application (/) commands:');
    commands.forEach(command => console.log(` - ${command.name}`))
  } catch (error) {
    console.error(error);
  }
};
