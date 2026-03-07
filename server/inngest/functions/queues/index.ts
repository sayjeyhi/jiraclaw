import { slackNotificationSender } from "./slack-notification";
import { channelMessageSender } from "./channel-message";

export default [slackNotificationSender, channelMessageSender];
