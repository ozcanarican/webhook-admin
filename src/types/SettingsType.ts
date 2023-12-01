import { WebhookType } from "./WebhookType"

export type SettingsType = {
    servicePort: number,
    host: string,
    webhooks: WebhookType[]
}