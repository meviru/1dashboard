import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { config } from '../config';
import { Task, View } from './views.model';

@Injectable({
  providedIn: 'root'
})
export class TasksService {

  private apiUrl = config.API_URL;

  constructor(private http: HttpClient) { }

  getBoardViews(): Observable<View[]> {
    return this.http.get<View[]>(`${this.apiUrl}/categories.json`);
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks.json`);
  }

  addTask(task: Task) {
    return this.http.post<Task>(`${this.apiUrl}/tasks.json`, task);
  }

  updateTask(id: string, task: Task) {
    return this.http.patch<Task>(`${this.apiUrl}/tasks/${id}.json`, task);
  }

  updateTaskStatus(id: string, task: Task) {
    return this.http.patch(`${this.apiUrl}/tasks/${id}.json`, task);
  }

  deleteTask(id: string) {
    return this.http.delete(`${this.apiUrl}/tasks/${id}.json`);
  }
}
