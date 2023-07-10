import { Message, Update } from 'telegraf/typings/core/types/typegram';
import { Context, NarrowedContext } from 'telegraf';

export type textContext = NarrowedContext<
	Context<Update>,
	{
		message: Update.New & Update.NonChannel & Message.TextMessage;
		update_id: number;
	}
>;

export type AudioContext = NarrowedContext<
	Context<Update>,
	Update.MessageUpdate<Record<'voice', {}> & Message.VoiceMessage>
>;

export type FileContext = NarrowedContext<
	Context<Update>,
	{
		message:
			| (Update.New & Update.NonChannel & Message.AnimationMessage)
			| (Update.New & Update.NonChannel & Message.DocumentMessage);
		update_id: number;
	}
>;
