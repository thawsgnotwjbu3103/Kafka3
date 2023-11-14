import {ExtendedClient} from "../structures/Client";
import {
    ChatInputApplicationCommandData,
    CommandInteraction,
    CommandInteractionOptionResolver, GuildMember,
    PermissionResolvable
} from "discord.js";
interface RunOptions {
    client: ExtendedClient,
    interaction: CommandInteraction,
    args: CommandInteractionOptionResolver
}

export interface ExtendedInteraction extends CommandInteraction {
    member: GuildMember;
}

type RunFunction = (options: RunOptions) => any;

export type CommandType = {
    userPermission?: PermissionResolvable[];
    run: RunFunction;
} & ChatInputApplicationCommandData;