import { Injectable } from '@angular/core';
import { User } from '../../models/auth.models';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';
import { EventInput } from '@fullcalendar/core';
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

//   getAll() {
//     return this.http.get<User[]>(`${environment.baseUrl}/api/login`);
// }

  register(user: User) {
      return this.http.post(`${environment.baseUrl}/api/register`, user);
  }

  login(user: User) {
    return this.http.post<{token:string}>(`${environment.baseUrl}/api/login`, user);
}

  addNewEvent(event:any){
      return this.http.post(`${environment.baseUrl}/api/add-event`, event);
  }

  getEvents(){
    return this.http.get<EventInput[]>(`${environment.baseUrl}/api/events`);
  }

  updateEvent(event:any){
    return this.http.post(`${environment.baseUrl}/api/update-event`, event);
  }

  deleteEvent(eventId:number){
    return this.http.delete(`${environment.baseUrl}/api/delete-event/${eventId}`);
  }


  registerMember(member){
    return this.http.post(`${environment.baseUrl}/api/members/add`, member);
  }

  getMembers(){
    return this.http.get(`${environment.baseUrl}/api/members/get-all`);
  }

  getOneMember(memberId:string){
    return this.http.get(`${environment.baseUrl}/api/members/get/${memberId}`);
  }

}
