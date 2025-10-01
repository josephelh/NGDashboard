import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.scss',
})
export class TodoComponent {
  taskArray: { taskName: string; isCompleted: boolean }[] = [];

  addTodo(form: NgForm) {
    const newTask = {
      taskName: form.controls['task'].value,
      isCompleted: false,
    };
    this.taskArray.push(newTask);
    form.reset();
  }

  deleteTask(index: number) {
    this.taskArray.splice(index, 1);
  }

  toggleCompletion(index: number) {
    this.taskArray[index].isCompleted = !this.taskArray[index].isCompleted;
  }
}
