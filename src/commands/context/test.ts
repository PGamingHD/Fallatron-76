import { ApplicationCommandType } from 'discord.js';
import { ContextMenu } from '../../structures/ContextMenu';
import { sendError, sendSuccess } from '../../utils/messages';

export default new ContextMenu({
    name: 'Test ID',
    type: ApplicationCommandType.Message,
    defaultMemberPermissions: 'Administrator',
    run: async ({ interaction }) => {
        await sendSuccess(interaction, `This message has ID: ${interaction.targetId}`, true)
    },
});