export interface Message {
    type: 'audio' | 'text',
    sender: string,
    message: any
}