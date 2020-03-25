import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ChatService } from './chat-service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit
{
  title = 'chat-app';
  messagesList: any[];

  theForm: FormGroup;

  constructor(private chatService: ChatService, private _fb: FormBuilder) 
  {
    this.messagesList = [];
    this.theForm = this._fb.group(
      {
        sender: ['', Validators.required],
        message: ['', Validators.required]
      }
    )
  }

  ngOnInit()
  {
    this.chatService.getMessages().subscribe( (chat) => {

      console.log('Chat List =', chat);
      this.messagesList.push(chat);
    })
  }
  sendMessage()
  {
    if (this.theForm.valid)
    {
      this.chatService.sendMessage(this.theForm.value);
      this.theForm.controls.message.setValue('');
    }
  }
}
