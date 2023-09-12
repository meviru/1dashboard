import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SidebarModule } from 'primeng/sidebar';
import { BadgeModule } from 'primeng/badge';
import { Task } from 'src/app/services/views.model';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-view-task',
  templateUrl: './view-task.component.html',
  styleUrls: ['./view-task.component.scss'],
  standalone: true,
  imports: [SidebarModule, BadgeModule, CommonModule]
})
export class ViewTaskComponent {
  @Input() visible: boolean = false;
  @Output() onClose = new EventEmitter<boolean>();
  @Input() task: Task = null;

  onHide(isVisible: any) {
    if (!isVisible) {
      this.onClose.emit(true);
    }
  }
}
