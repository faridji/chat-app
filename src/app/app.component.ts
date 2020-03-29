import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ChatService } from './chat-service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { Message } from './models/message';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy
{
  title = 'chat-app';

  mediaRecorder: MediaRecorder;
  audioChunks: any[];
  audioStarted: boolean;
  isRecordingStarted: boolean;

  messagesList: Message[];

  theForm: FormGroup;
  flex: number;
  timerValue: string;
  subScription: Subscription;

  constructor(private chatService: ChatService, 
              private _fb: FormBuilder,
              private sanitizer: DomSanitizer,) 
  {
    this.messagesList = [];
    this.isRecordingStarted = false;
    this.flex = 95;
    this.timerValue = this.formatDuration(0);;

    this.theForm = this._fb.group(
      {
        sender: ['Farid', Validators.required],
        message: ['', Validators.required]
      }
    )
  }

  ngOnInit()
  {
    this.chatService.getMessages().subscribe( (message: Message) => 
    {
      if (message.type === 'audio')
      { 
        const audioBlob = new Blob(message.message, { type: 'audio/mpeg-3'});
        message.message = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(audioBlob));
      }

      this.messagesList.push(message);
    }, (error: any) => {
      console.error('error occured', error);
    });
  }

  ngOnDestroy()
  {
    this.subScription.unsubscribe();
  }
  
  sendMessage(type: Message['type'])
  {
    if (type === 'audio')
    {
      if (this.theForm.controls.sender.value)
      {
        let data = {
          message: this.audioChunks,
          sender: this.theForm.controls.sender.value
        }
  
        this.chatService.sendMessage(data, 'audio')
      }
    }
    else 
    {
      if (this.theForm.valid)
      {
        this.chatService.sendMessage(this.theForm.value, 'text');
        this.theForm.controls.message.setValue('');
      }
    }
  }

  onSendRecordedMessage()
  {
    this.onCancelRecording();
    this.mediaRecorder.addEventListener('stop', () => 
    {
      this.sendMessage('audio');
    });
  }

  onStartRecording()
  {
    this.isRecordingStarted = true;
    this.flex = 80;

    this.subScription = interval(1000).subscribe(val => {
      this.timerValue = this.formatDuration(val);
    });

    this.audioStarted = true;
    this.audioChunks = [];

    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => 
      {
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.start();

        this.mediaRecorder.addEventListener("dataavailable", event => 
        {
          this.audioChunks.push(event['data']);
        });
      });
  }

  onCancelRecording()
  {
    this.isRecordingStarted = false;
    this.flex = 95;
    this.timerValue = this.formatDuration(0);
    this.subScription.unsubscribe();

    this.audioStarted = false;
    this.mediaRecorder.stop();
  }

  formatDuration(val) 
  {
    const sec_num = parseInt(val, 10);

    const hours   = Math.floor(sec_num / 3600);
    const minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    const seconds = sec_num - (hours * 3600) - (minutes * 60);

    let m, s;
    if (minutes < 10) { m = '0' + minutes; } else {m = minutes; }
    if (seconds < 10) { s = '0' + seconds; } else {s = seconds; }

    return m + ':' + s;
  }
}
