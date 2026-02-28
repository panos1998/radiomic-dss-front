import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, of, expand, reduce, EMPTY, delay, Subject } from 'rxjs';
import { PatientDTO } from '../interfaces/patient';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Bundle, Patient} from 'fhir/r4'

@Injectable({
  providedIn: 'root',
})
export class PatientsService {
  private patientsSubject  = new Subject<PatientDTO[]>;
  public patientObservable = this.patientsSubject.asObservable();
  private http = inject(HttpClient);
  // private FHIR_URL = 'http://localhost:8080/fhir/Patient';
  private BACKEND_URL = "https://unblossomed-tari-lightsomely.ngrok-free.dev"
  
  // Use BehaviorSubject to store and emit the current patient ID
  private selected_patient_changed = new BehaviorSubject<string | undefined>(undefined);
  public selected_patient_changed_observable = this.selected_patient_changed.asObservable();
  
  private mock_patients: PatientDTO[] | [] = [];
  private real_patients: PatientDTO[] | [] = [];



  constructor() {}

  getPatients(): Observable<PatientDTO[]> {
    const headers = new HttpHeaders({
      'ngrok-skip-browser-warning': '69420' // Value can be anything
    });
    return this.http.get<any>(this.BACKEND_URL+'/patients',{headers}).pipe(map((response) => response.patients),map((patients) =>  
      patients.map((patient: any) => this.convertPatientFHIRTODTO(patient))
    ));
  }
  fetchAllPaginatedPatients(initialUrl: string): Observable<PatientDTO[]> {
    // Start a stream by fetching the initial bundle from the provided URL
    return this.http.get<Bundle>(initialUrl).pipe(
      expand(bundle => {
        // Find the URL for the next page in the bundle's links
        const nextUrl = bundle.link?.find(link => link.relation === 'next')?.url;
        // If a 'next' URL exists, perform an HTTP GET for the next bundle.
        // Otherwise, return EMPTY to signal the end of the pagination.
        return nextUrl ? this.http.get<Bundle>(nextUrl) : EMPTY;
      }),
      // For each bundle in the stream (initial + all subsequent pages), extract the patient resources.
      map(bundle =>
        (bundle.entry ?? [])
          .map(entry => entry.resource as Patient) // Extract the resource
          .filter(resource => resource?.resourceType === 'Patient') // Ensure it's a Patient resource
      ),
      // Accumulate the arrays of patients from each page into a single array.
      reduce((allPatients, currentPagePatients) => allPatients.concat(currentPagePatients), [] as Patient[]),
      // After all pages are fetched and all patients are in one array,
      // map the final array of Patient resources to an array of PatientDTOs.
      map(fhirPatients => fhirPatients.map(patient => this.convertPatientFHIRTODTO(patient)))
    );
  }

  convertPatientFHIRTODTO(patient: Patient): PatientDTO {
    console.log(patient, "processed")
    return {
      id: patient.id,
      name: patient?.name?.[0]?.given && patient.name[0].family ? patient?.name?.[0]?.given?.join(' ') +" "+ patient?.name?.[0]?.family:"",
      age: patient.birthDate ? new Date().getFullYear() - new Date(patient.birthDate).getFullYear() : 0,
      gender: patient.gender,
    }
  }
  createMockPatients(): Observable<PatientDTO[]> {
    const mockPatients: PatientDTO[] = [
      { id: '1', name: 'John Doe', age: 30, gender: 'Male' },
      { id: '2', name: 'Jane Smith', age: 25, gender: 'Female' },
      { id: '3', name: 'Bob Johnson', age: 40, gender: 'Male' },
      { id: '4', name: 'Alice Brown', age: 35, gender: 'Female' },
      { id: '5', name: 'Charlie White', age: 28, gender: 'Male' }
    ];
    this.mock_patients = mockPatients;
    this.patientsSubject.next(mockPatients);
    return of(mockPatients).pipe(delay(500))
  }
  setSelectedPatientId(patientId: string | undefined){
    // A BehaviorSubject only emits when the new value is different from the old one.
    console.log("patientId", patientId)
    this.selected_patient_changed.next(patientId);
  }
  getSelectedPatientId(){
    // We can get the current value directly from the BehaviorSubject
    return this.selected_patient_changed.getValue();
  }

  getSelectedPatient(patientId: string | undefined): Observable<PatientDTO | undefined> {
    return of(this.real_patients.find(patient => patient.id === patientId))
  }
  setRealPatients(patients: PatientDTO[]){
    this.real_patients = patients;
  }
  getRealPatients(){
    return this.real_patients;
  }

}
