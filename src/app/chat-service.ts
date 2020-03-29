import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';


@Injectable({providedIn: 'root'})
export class ChatService 
{
    constructor(private socket: Socket) {}

    sendMessage(message: any, type: string)
    {
        let payload = {
            type: type,
            sender: message.sender,
            message: message.message
        }

        this.socket.emit('chat', payload);
    }

    getMessages(): Observable<any>
    {
        return Observable.create( (observer) => {
            this.socket.on('chat', (chat) => 
            {
                observer.next(chat);
            })
        })
    }
}