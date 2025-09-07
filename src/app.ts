import { Bot, Context } from 'grammy';
import { FileFlavor, hydrateFiles } from '@grammyjs/files';

import { handleVoiceMessage } from './handler/voice';

export type VoiceContext = FileFlavor<Context>;

const bot = new Bot<VoiceContext>(process.env.BOT_TOKEN as string);
bot.api.config.use(hydrateFiles(bot.token));

bot.on('message', async (ctx: VoiceContext) => {
  if (ctx.update.message?.voice) {
    return handleVoiceMessage(ctx);
  }

  return ctx.reply('Only voice messages are supported at the moment. Please send a voice message. 🧑‍🎤');
});

bot.start();
