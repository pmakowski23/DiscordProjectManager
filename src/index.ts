import { Client, Intents } from 'discord.js';
import { env } from 'process';
import * as express from 'express';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import deploy from './deployCommands';
import discord from './discord';

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
discord(client);
client.login(TOKEN);

const runApp = async (app: express.Application) => {
  app.listen(port, () =>
    console.log(`Server running on http://localhost:${port}`),
  );
};

runApp(app);
