import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent 
  ]
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  
  if (!message.content) {
    message.reply('Please provide a valid input.');
    return;
  }

  await message.channel.sendTyping(); // Simulating typing indicator

  const sendTypingInterval = setInterval(() => {
    message.channel.sendTyping();
  }, 5000); 

  try {
    let conversation = [];
    let previousmessages = await message.channel.messages.fetch({ limit: 10 });
    previousmessages.reverse(); // Reverse the order to get the oldest messages first
    
    previousmessages.forEach((msg) => {
      if (msg.author.id === client.user.id) {
        conversation.push({ role: 'assistant', content: msg.content });
      }
      else if (!msg.author.bot) {
        conversation.push({ role: 'user', content: msg.content });
      }
    });
    
    console.log("Sending message to Claude:", message.content);
    
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 1024,
      messages: conversation,
    });
    
    console.log("Claude API response:", JSON.stringify(response, null, 2));
    
    if (response && response.content && response.content.length > 0) {
      const aiResponse = response.content[0].text;
      
      // Split long responses into chunks (Discord has a 2000 character limit)
      for (let i = 0; i < aiResponse.length; i += 1900) {
        const chunk = aiResponse.substring(i, i + 1900);
        await message.reply(chunk);
      }
    } else {
      console.error("Unexpected response structure:", response);
      message.reply('Sorry, I could not process your request.');
    }
  } catch (error) {
    console.error('Error with Anthropic Claude API:', error);
    message.reply('An error occurred while processing your request.');
  } finally {
    // Always clear the interval, regardless of success or failure
    clearInterval(sendTypingInterval);
  }
});

client.login(process.env.TOKEN);