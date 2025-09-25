import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  taskList: string[] = [];
  taskInput = "";
  protected readonly title = signal('Frontend');
  onCLick() {
    if (this.taskInput.trim() !== "") {
      this.taskList.push(this.taskInput);
      this.taskInput = "";
    }

  }
  onInput(event: Event) {
    this.taskInput = (event.target as HTMLInputElement).value;
  }
}
