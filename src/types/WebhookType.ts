export enum WebhookMethod {POST=1, GET}
export type WebhookType = {
    method:WebhookMethod
    name:string,
    id:string,
    command:string,
    variables:string[],
    last: {
        date?:Date,
        ip?:string,
        result?:string
    },
    needPassword:boolean,
    password:string
}