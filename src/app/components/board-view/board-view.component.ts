import { Component } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Subscription, take, tap } from "rxjs";
import { Task, View } from 'src/app/services/views.model';
import { TasksService } from 'src/app/services/tasks.service';
import { BoardCardComponent } from '../board-card/board-card.component';
import { AddNewTaskComponent } from '../add-new-task/add-new-task.component';
import { ViewTaskComponent } from '../view-task/view-task.component';
import { CommunicationService } from 'src/app/services/communication.service';

@Component({
  selector: 'app-board-view',
  templateUrl: './board-view.component.html',
  styleUrls: ['./board-view.component.scss'],
  standalone: true,
  imports: [CdkDropList, CdkDrag, CdkDropListGroup, BoardCardComponent, CommonModule, AddNewTaskComponent, ViewTaskComponent],
  providers: []
})

export class BoardViewComponent {
  public allViews: View[] = [];
  public viewList: View[] = [];
  public connectedContainersList: string[] = []


  public selectedView: View = null;
  public selectedTask: Task = null;
  public totalTask: number = 0;

  public isSidebarOpen: boolean = false;
  public isView: boolean = false;


  taskSubscription: Subscription;

  constructor(private taskService: TasksService, private communicationService: CommunicationService) { }

  ngOnInit(): void {
    this.getViews();

    this.communicationService.isTaskUpdated.subscribe((isUpdated: boolean) => {
      if (isUpdated) {
        this.getViews();
      }
    })
  }

  getViews() {
    this.taskService.getBoardViews().subscribe((view: View[]) => {
      this.viewList = view;
      if (this.viewList && this.viewList.length) {
        this.getTasks(this.viewList);
      }
    });
  }

  getTasks(viewList: View[]) {
    this.taskService.getTasks().subscribe((tasks: Task[]) => {
      const allTasks: Task[] = this.generateId(tasks);
      viewList.map((item: View) => {
        item.tasks = allTasks.length && allTasks.filter((task: Task) => item.id == task.categoryId);
        this.connectedContainersList.push(item.slug);
      })
      this.totalTask = allTasks.length ? allTasks.length : 0;
    });
  }

  generateId(tasks: Task[]): Task[] {
    for (let [key, value] of Object.entries(tasks)) {
      value['id'] = key;
    }
    return Object.values(tasks);
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      this.updateStatus(event.item.data, event.container);
    }
  }

  updateStatus(data: Task, dropContainer: CdkDropList) {
    this.viewList.forEach((item: any) => {
      if (item.slug == dropContainer.id) {
        data.categoryId = item.id;
        const { tasks, ...rest } = item;
        data.status = rest;
      }
    });
    this.taskService.updateTaskStatus(data.id, data).pipe(take(1)).subscribe();
  }

  onAddTask(task: Task) {
    this.viewList.forEach((item) => {
      if (item.slug == task.status.slug) {
        item.tasks.push(task);
      }
    });
  }

  onView(id: string) {
    this.selectedTask = this.selectTask(id);
    console.log(this.selectedTask);
  }

  onEdit(id: string) {
    this.selectedTask = this.selectTask(id);
    const view: any = { ...this.selectedTask };
    this.openSidebar(view, this.selectedTask);
  }

  selectTask(id: string) {
    let selectedTask: Task;
    this.viewList.some((item: View) => {
      selectedTask = item.tasks.find((task: Task) => task.id == id);
      return selectedTask ? true : false;
    });
    return selectedTask;
  }

  onEditTask(task: Task) {
    if (this.selectedView.slug == task.status.slug) {
      this.viewList.map((item: View) => {
        item.tasks = item.tasks.map((item: Task) => {
          item = item.id == task.id ? task : item;
          return item;
        })
      })
    } else {
      this.viewList.map((item: View) => {
        item.tasks = item.tasks.filter((item: Task) => item.id != task.id);
        if (item.slug == task.status.slug) {
          task.categoryId = item.id;
          const { tasks, ...rest } = item;
          task.status = rest;
          item.tasks.push(task);
        }
      })
      this.taskService.updateTaskStatus(task.id, task).pipe(take(1)).subscribe();
    }
  }

  onDelete(id: string) {
    this.viewList.forEach((item) => {
      item.tasks = item.tasks.filter((task: Task) => task.id != id);
    });

    this.taskService.deleteTask(id).pipe(take(1)).pipe(take(1)).subscribe();
  }

  openSidebar(view: View, selectedTask: Task = null) {
    this.isSidebarOpen = true;
    this.selectedView = view;
    this.selectedTask = selectedTask;
    this.allViews = this.viewList.map(({ tasks, ...rest }) => {
      return rest;
    });
  }

  onSidebarClose(isVisible: boolean) {
    this.isSidebarOpen = !isVisible;
  }

  ngOnDestroy(): void {
    if (this.taskSubscription) {
      this.taskSubscription.unsubscribe();
    }
  }

}
