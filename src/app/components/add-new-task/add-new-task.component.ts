import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormGroup, FormsModule, Validators, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription, take } from 'rxjs';

import { SidebarModule } from 'primeng/sidebar';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ChipModule } from 'primeng/chip';
import { TabViewModule } from 'primeng/tabview';
import { AutoFocusModule } from 'primeng/autofocus';
import { DialogModule } from 'primeng/dialog';
import { BadgeModule } from 'primeng/badge';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';

import { AuthService } from 'src/app/services/auth.service';
import { Task, View } from 'src/app/services/views.model';
import { User } from 'src/app/services/user.model';
import { TasksService } from 'src/app/services/tasks.service';
import { CommunicationService } from 'src/app/services/communication.service';


@Component({
  selector: 'app-add-new-task',
  templateUrl: './add-new-task.component.html',
  styleUrls: ['./add-new-task.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DialogModule, BadgeModule, CalendarModule, ChipModule, TagModule, InputTextModule, DropdownModule, SidebarModule, AutoFocusModule, TabViewModule]
})

export class AddNewTaskComponent {

  @Input() visible: boolean = false;
  @Input() selectedView: View = null;
  @Input() status: View[] = [];
  @Input() totalTask: number = 0;
  @Output() onSidebarClose = new EventEmitter<boolean>();
  @Output() onAddTask = new EventEmitter<Task>();
  @Output() onEditTask = new EventEmitter<Task>();

  userData: User = null;
  userName: string = "";
  userSub: Subscription;
  viewSub: Subscription;

  taskForm: FormGroup;
  subTaskForm: FormGroup;
  selectedStatus: View = null;
  currentDate = new Date();

  isOpen: boolean = false;
  isEditing: boolean = false;
  selectedTaskId: string = "";
  selectedSubTaskId: number;
  isFormSubmitted: boolean = false;
  isSubTaskFormSubmitted: boolean = false;

  @Input() set selectedTask(value: Task) {
    this.isEditing = value ? true : false;
    this.selectedTaskId = value && value.id ? value.id : "";
    this.setFormValues(value);
  }

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private taskService: TasksService, private communicationService: CommunicationService, private messageService: MessageService) {
    this.setTaskForm();
    this.setSubTaskForm();
  }

  ngOnInit(): void {
    this.userSub = this.authService.user.subscribe((userData: User) => {
      this.userData = userData;
      if (userData && userData.email) {
        const atIndex = userData.email.indexOf("@");
        this.userName = userData.email.substring(0, atIndex);
      }
    });

    if (this.selectedView) {
      const { tasks, ...status } = this.selectedView;
      this.selectedStatus = status;
    }

    this.taskForm.patchValue({
      assignee: this.userName,
      categoryId: this.selectedStatus.id,
      status: this.selectedStatus,
    });

    this.subTaskForm.patchValue({
      status: this.status.find(item => item.slug == 'to-do')
    });
  }

  setTaskForm() {
    this.taskForm = this.formBuilder.group({
      assignee: [""],
      categoryId: [0],
      completed_count: [0],
      description: ["", Validators.required],
      due_date: [this.currentDate, Validators.required],
      priority: ["low"],
      status: [null, Validators.required],
      sub_tasks: this.formBuilder.array([]),
      title: ["", Validators.required],
      total_count: [0]
    });
  }

  setSubTaskForm() {
    this.subTaskForm = this.formBuilder.group({
      description: ["", Validators.required],
      status: [null, Validators.required],
      title: ["", Validators.required],
    })
  }

  setFormValues(value: Task) {
    if (this.taskForm && value) {
      this.taskForm.patchValue({
        assignee: value.assignee,
        categoryId: value.categoryId,
        completed_count: value.completed_count,
        description: value.description,
        due_date: new Date(value.due_date),
        priority: value.priority,
        status: value.status,
        title: value.title,
        total_count: value.total_count
      });

      const subTasks = this.taskForm.controls['sub_tasks'] as FormArray;
      value.sub_tasks && value.sub_tasks.length && value.sub_tasks.forEach((item) => {
        subTasks.push(this.formBuilder.control(item));
      })
    }
  }

  submitForm() {
    const completedSubTaskCount = this.subTasks.length ? this.subTasks.controls.filter((item: any) => item.value.status.slug == 'completed').length : 0;
    this.taskForm.patchValue({
      completed_count: completedSubTaskCount,
      total_count: this.subTasks.length,
    });

    if (this.taskForm.valid) {
      if (!this.isEditing) {
        this.taskService.addTask(this.taskForm.value).pipe(take(1)).subscribe((result: any) => {
          if (result && result.name) {
            const task: Task = { id: result.name, ...this.taskForm.value };
            this.onAddTask.emit(task);
            this.onSidebarClose.emit(true);
          }
        });
      } else {
        this.taskService.updateTask(this.selectedTaskId, this.taskForm.value).pipe(take(1)).subscribe((result: any) => {
          if (result) {
            const task: Task = { id: this.selectedTaskId, ...this.taskForm.value };
            this.onEditTask.emit(task);
            this.onSidebarClose.emit(true);
          }
        });
      }
    } else {
      this.isFormSubmitted = true;
      this.markFieldAsDirty(this.taskForm);
    }
  }

  isRequired(fieldName: string, isSubTaskForm: boolean = false): boolean {
    const field = !isSubTaskForm ? this.taskForm.get(fieldName) : this.subTaskForm.get(fieldName);
    if (field.hasError('required') && field.dirty) {
      return true;
    } else if (field.dirty && field.invalid) {
      return true;
    }
    else if (field.touched && field.invalid) {
      return true;
    }
    return false;
  }

  get subTasks(): FormArray {
    return this.taskForm.get('sub_tasks') as FormArray;
  }

  addSubTask() {
    if (this.subTaskForm.valid) {
      if (!this.selectedSubTaskId && this.selectedSubTaskId != 0) {
        this.subTasks.push(this.formBuilder.control(this.subTaskForm.value));
      } else {
        this.subTasks.at(this.selectedSubTaskId).setValue(this.subTaskForm.value);
      }
      this.isOpen = false;
    } else {
      this.isSubTaskFormSubmitted = true;
      this.markFieldAsDirty(this.subTaskForm);
    }
  }

  markFieldAsDirty(form: FormGroup) {
    for (let i in form.controls) {
      form.controls[i].markAsDirty();
    }
  }

  onHide(isVisible: any) {
    if (!isVisible) {
      this.onSidebarClose.emit(true);
    }
  }

  onStatusChange(event: DropdownChangeEvent, isSubTask: boolean = false) {
    if (!isSubTask) {
      this.taskForm.patchValue({
        status: event.value,
      });
    } else {
      this.subTaskForm.patchValue({
        status: event.value,
      });
    }
  }

  openSubTask(index: number) {
    this.selectedSubTaskId = index;
    const selectedSubTask = this.subTasks.controls[index].value;
    if (Object.keys(selectedSubTask).length) {
      this.subTaskForm.patchValue(selectedSubTask);
    }
    this.isOpen = true;
  }

  onRemoveSubTask(index: number, event: Event) {
    event.stopPropagation();
    const idx = this.subTasks.controls.indexOf(this.subTasks.controls[index]);
    if (idx > -1) {
      this.subTasks.controls.splice(idx, 1);
    }
  }

  onDialogShow() {
    // this.subTaskForm.patchValue({
    //   status: this.selectedStatus
    // })
  }

  onDialogHide() {
    this.selectedSubTaskId = null;
    this.subTaskForm.reset();
  }

  ngOnDestroy(): void {
    if (this.viewSub && this.userSub) {
      this.userSub.unsubscribe();
      this.viewSub.unsubscribe();
    }
  }
}
