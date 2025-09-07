import fs from 'node:fs';
import OpenAI from 'openai';
import Arcade from '@arcadeai/arcadejs';
import { Agent, run, tool } from '@openai/agents';
import { executeOrAuthorizeZodTool, toZod } from '@arcadeai/arcadejs/lib';

import { config } from '../config';
import { VoiceContext } from '../app';
import { convertOggToWav } from '../audio/convert';

const arcadeClient = new Arcade({
  apiKey: process.env['ARCADE_API_KEY'],
});
const openAIClient = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

const gmailToolkit = await arcadeClient.tools.list({
  toolkit: 'gmail',
  limit: 30,
});
const tessieToolkit = await arcadeClient.tools.list({
  toolkit: 'tessie',
  limit: 30,
});

const tools = toZod({
  client: arcadeClient,
  userId: config.userId,
  executeFactory: executeOrAuthorizeZodTool,
  tools: [...gmailToolkit.items, ...tessieToolkit.items],
}).map(tool);

const systemPrompt = `
  You are a helpful assistant with the name Kyoto, that can assist with Sending emails and managing a Tesla car rental system.
  These are the cars you can rent:
  ${Object.keys(config.carMap)
    .map((vin: string) => `VIN: ${vin}, ${config.carMap[vin]}`)
    .join('\n  ')},

  Your current time is ${new Date().toISOString()}.
  For the demo assume that the coordinates are Musterstrasse 3, Munich.

  These are the allowed users:
  ${Object.keys(config.allowedUsers)
    .map((email: string) => `Email: ${email}, Name: ${config.allowedUsers[email]}`)
    .join('\n  ')},

  Every booking is by default 1 day long.
  Every booking always start at 1pm.
  Every Rental starts immediately after the booking.
  Every Rental has to have a invitation link.
  For every booking you sent out a confirmation message.

    For the email use the following template:
    Hello [Your Name],
    Here is your invitation to the car rental system.
    [Invitation Link]
    I've just booked a car for you. Here are the details:
    - VIN: [VIN Number]
    - Car: [Car Name]
    - Start Time: [Start Time]
    - End Time: [End Time]
    - Current Location: [Current Location]
    - Current Battery: [Current Battery] (Please make sure the battery is returned with at-least the same battery level as your current battery).
    - Please confirm the booking by responding with 'Confirmed'.
    - If you have any questions, please let me know.
    - Thanks!
    - Your Assistant, [Your Name]

  Always make sure to sent the email.
  `;

const voiceAgent = new Agent({
  name: 'Voice Agent',
  instructions: systemPrompt,
  model: 'gpt-4o-mini',
  tools,
});

export const handleVoiceMessage = async (ctx: VoiceContext) => {
  await ctx.reply('We are working on your request... 🏎️');

  const file = await ctx.getFile();
  if (!file) {
    return ctx.reply('No audio file found in the message');
  }

  const path = await file.download();
  if (!fs.existsSync(path)) {
    return ctx.reply('Failed to download the audio file');
  }

  await convertOggToWav(path, `${path}.wav`);
  if (!fs.existsSync(`${path}.wav`)) {
    return ctx.reply('Failed to convert the audio file to WAV');
  }

  const transcription = await openAIClient.audio.transcriptions.create({
    file: fs.createReadStream(`${path}.wav`),
    model: 'gpt-4o-transcribe',
    language: 'en',
  });

  if (!transcription.text) {
    return ctx.reply('Failed to transcribe the audio file');
  }

  await ctx.reply(`Received audio transcription: ${transcription.text} \n\nProcessing... 🏎️`);

  const result = await run(voiceAgent, transcription.text);
  return ctx.reply(result.finalOutput || 'Error occurred while processing the request');
};
