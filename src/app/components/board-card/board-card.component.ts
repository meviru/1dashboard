import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { Task } from 'src/app/services/views.model';
import { SkeletonModule } from 'primeng/skeleton';
import { MenuModule } from 'primeng/menu';
import { MenuItem, PrimeIcons } from 'primeng/api';

@Component({
  selector: 'app-board-card',
  templateUrl: './board-card.component.html',
  styleUrls: ['./board-card.component.scss'],
  standalone: true,
  imports: [CommonModule, ProgressBarModule, SkeletonModule, MenuModule]
})
export class BoardCardComponent {

  @Input() taskItem: Task = null;
  @Output() viewItem = new EventEmitter<string>();
  @Output() editItem = new EventEmitter<string>();
  @Output() deleteItem = new EventEmitter<string>();

  items: MenuItem[] | undefined;

  ngOnInit(): void {
    this.items = [{
      label: "Options",
      items: [
        {
          label: 'View',
          icon: PrimeIcons.EYE,
          command: () => {
            this.viewItem.emit(this.taskItem.id);
          }
        },
        {
          label: 'Edit',
          icon: PrimeIcons.PENCIL,
          command: () => {
            this.editItem.emit(this.taskItem.id);
          }
        },
        {
          label: 'Delete',
          icon: PrimeIcons.TRASH,
          command: () => {
            this.deleteItem.emit(this.taskItem.id);
          }
        }]
    }]
  }

  get getProgress(): number {
    return (this.taskItem.completed_count / this.taskItem.total_count) * 100;
  }
}
