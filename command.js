import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const commands = [
    {
      name: 'create',
      description: 'short url generation command',
    },
];

// Use environment variables for sensitive data
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID; // Use the correct Client/Application ID from environment variables

if (!token || !clientId) {
    console.error('Error: DISCORD_TOKEN or CLIENT_ID is missing in the environment variables.');
    process.exit(1); // Exit if essential variables are missing
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
    console.log('Started refreshing application (/) commands.');

    // Use the clientId from environment variables
    await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error refreshing application commands:', error); // More specific error logging
}})();