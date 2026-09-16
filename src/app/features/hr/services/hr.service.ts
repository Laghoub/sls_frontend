import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../../../core/api.config';
import {
  AdminDocumentRequest, CompensationPlan, CompensationPlanRequest, ContractRequest, Employee, EmployeeProfile,
  EmployeeRequest, EmergencyContactRequest, EmploymentStatus, HistoryRequest, HrDashboard, JobPosition,
  JobPositionRequest, QualificationRequest, StaffNoteRequest, SubjectReference, SubjectRequest, Teacher,
  TeacherRate, TeacherRateRequest, TeacherRequest, TeacherStatus, TeachingAssignment, TeachingAssignmentRequest
} from '../models/hr.model';

@Injectable({ providedIn: 'root' })
export class HrService {
  private readonly http = inject(HttpClient);
  private readonly root = `${API_CONFIG.baseUrl}/hr`;

  employees(){return this.http.get<Employee[]>(`${this.root}/employees`)}
  employee(id:number){return this.http.get<Employee>(`${this.root}/employees/${id}`)}
  createEmployee(request:EmployeeRequest){return this.http.post<Employee>(`${this.root}/employees`,request)}
  updateEmployee(id:number,request:EmployeeRequest){return this.http.put<Employee>(`${this.root}/employees/${id}`,request)}
  changeEmployeeStatus(id:number,status:EmploymentStatus){return this.http.patch<void>(`${this.root}/employees/${id}/status/${status}`,{})}
  employeeProfile(id:number){return this.http.get<EmployeeProfile>(`${this.root}/employees/${id}/profile`)}
  addQualification(id:number,request:QualificationRequest){return this.http.post<any>(`${this.root}/employees/${id}/qualifications`,request)}
  addHistory(id:number,request:HistoryRequest){return this.http.post<any>(`${this.root}/employees/${id}/history`,request)}
  addContract(id:number,request:ContractRequest){return this.http.post<any>(`${this.root}/employees/${id}/contracts`,request)}
  addEmergencyContact(id:number,request:EmergencyContactRequest){return this.http.post<any>(`${this.root}/employees/${id}/emergency-contacts`,request)}
  addDocument(id:number,request:AdminDocumentRequest){return this.http.post<any>(`${this.root}/employees/${id}/documents`,request)}
  addNote(id:number,request:StaffNoteRequest){return this.http.post<any>(`${this.root}/employees/${id}/notes`,request)}

  teachers(){return this.http.get<Teacher[]>(`${this.root}/teachers`)}
  teacher(id:number){return this.http.get<Teacher>(`${this.root}/teachers/${id}`)}
  createTeacher(request:TeacherRequest){return this.http.post<Teacher>(`${this.root}/teachers`,request)}
  changeTeacherStatus(id:number,status:TeacherStatus){return this.http.patch<Teacher>(`${this.root}/teachers/${id}/status/${status}`,{})}
  addSubject(teacherId:number,subjectId:number){return this.http.post<void>(`${this.root}/teachers/${teacherId}/subjects/${subjectId}`,{})}
  removeSubject(teacherId:number,subjectId:number){return this.http.delete<void>(`${this.root}/teachers/${teacherId}/subjects/${subjectId}`)}

  subjects(includeInactive=false){return this.http.get<SubjectReference[]>(`${this.root}/subjects`,{params:new HttpParams().set('includeInactive',includeInactive)})}
  createSubject(request:SubjectRequest){return this.http.post<SubjectReference>(`${this.root}/subjects`,request)}
  updateSubject(id:number,request:SubjectRequest){return this.http.put<SubjectReference>(`${this.root}/subjects/${id}`,request)}
  setSubjectActive(id:number,active:boolean){return this.http.patch<SubjectReference>(`${this.root}/subjects/${id}/active/${active}`,{})}
  archiveSubject(id:number){return this.http.delete<SubjectReference>(`${this.root}/subjects/${id}`)}

  jobPositions(includeInactive=false){return this.http.get<JobPosition[]>(`${this.root}/job-positions`,{params:new HttpParams().set('includeInactive',includeInactive)})}
  createJobPosition(request:JobPositionRequest){return this.http.post<JobPosition>(`${this.root}/job-positions`,request)}
  updateJobPosition(id:number,request:JobPositionRequest){return this.http.put<JobPosition>(`${this.root}/job-positions/${id}`,request)}
  setJobPositionActive(id:number,active:boolean){return this.http.patch<JobPosition>(`${this.root}/job-positions/${id}/active/${active}`,{})}
  archiveJobPosition(id:number){return this.http.delete<JobPosition>(`${this.root}/job-positions/${id}`)}

  createAssignment(request:TeachingAssignmentRequest){return this.http.post<TeachingAssignment>(`${this.root}/teaching-assignments`,request)}
  assignmentsByTeacher(teacherId:number){return this.http.get<TeachingAssignment[]>(`${this.root}/teaching-assignments/teacher/${teacherId}`)}
  assignmentsByClass(classId:number,schoolYearId:number){return this.http.get<TeachingAssignment[]>(`${this.root}/teaching-assignments/class/${classId}`,{params:new HttpParams().set('schoolYearId',schoolYearId)})}
  endAssignment(id:number,date:string){return this.http.patch<TeachingAssignment>(`${this.root}/teaching-assignments/${id}/end`,{},{params:new HttpParams().set('date',date)})}

  plans(employeeId:number){return this.http.get<CompensationPlan[]>(`${this.root}/compensation/plans/employee/${employeeId}`)}
  createPlan(request:CompensationPlanRequest){return this.http.post<CompensationPlan>(`${this.root}/compensation/plans`,request)}
  rates(teacherId:number){return this.http.get<TeacherRate[]>(`${this.root}/compensation/teacher-rates/teacher/${teacherId}`)}
  createRate(request:TeacherRateRequest){return this.http.post<TeacherRate>(`${this.root}/compensation/teacher-rates`,request)}

  dashboard(schoolYearId?:number|null){let params=new HttpParams();if(schoolYearId)params=params.set('schoolYearId',schoolYearId);return this.http.get<HrDashboard>(`${this.root}/dashboard`,{params})}
}
