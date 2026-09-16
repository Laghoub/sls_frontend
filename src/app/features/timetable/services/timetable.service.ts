import {inject,Injectable} from '@angular/core'; import {HttpClient} from '@angular/common/http'; import {API_CONFIG} from '../../../core/api.config'; import {EligibleAssignment,ScheduleEntry,ScheduleEntryRequest} from '../models/timetable.model';
@Injectable({providedIn:'root'}) export class TimetableService { private http=inject(HttpClient); private url=`${API_CONFIG.baseUrl}/timetable`;
byClass(classId:number,yearId:number){return this.http.get<ScheduleEntry[]>(`${this.url}/class/${classId}`,{params:{schoolYearId:yearId}})}
eligible(yearId:number,classId:number){return this.http.get<EligibleAssignment[]>(`${this.url}/eligible-assignments`,{params:{schoolYearId:yearId,classGroupId:classId}})}
create(r:ScheduleEntryRequest){return this.http.post<ScheduleEntry>(`${this.url}/entries`,r)} update(id:number,r:ScheduleEntryRequest){return this.http.put<ScheduleEntry>(`${this.url}/entries/${id}`,r)} remove(id:number){return this.http.delete<void>(`${this.url}/entries/${id}`)} }
