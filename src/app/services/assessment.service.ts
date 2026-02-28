import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Assessment } from '../interfaces/assesment';
import { HttpClient } from '@angular/common/http';
import { Observation } from 'fhir/r4';

@Injectable({
  providedIn: 'root',
})
export class AssessmentService {
  // Mock data for patient assessments
  private http = inject(HttpClient);
  private BACKEND_URL = "https://unblossomed-tari-lightsomely.ngrok-free.dev"
  private mockAssessments: Assessment[] = [
    { id:"123",
      patientId: '1',
      score: 85,
      date: new Date('2024-05-10'),
      notes: 'Patient shows significant improvement in motor skills. The exercises focused on the left hemisphere seem to be effective.',
      heatmapURL: 'https://placehold.co/400x400/ff6347/FFFFFF/png?text=Heatmap-A',
    },
    { id:"234",
      patientId: '1',
      score: 90,
      date: new Date('2024-06-15'),
      notes: 'Continued improvement noted. Patient is now able to perform tasks that were previously difficult. Cognitive functions are stable.',
      heatmapURL: 'https://placehold.co/400x400/ff4500/FFFFFF/png?text=Heatmap-B',
    },
    { id:"235",
      patientId: '2',
      score: 60,
      date: new Date('2024-06-20'),
      notes: 'Initial assessment. Patient has difficulty with coordination and balance. A new therapy plan is recommended.',
      heatmapURL: 'https://placehold.co/400x400/ffa500/FFFFFF/png?text=Heatmap-C',
    },
    { id:"239",
      patientId: '2',
      score: 68,
      date: new Date('2024-07-22'),
      notes: 'Follow-up shows slight improvement in balance. Coordination exercises will be intensified in the next sessions.',
      heatmapURL: 'https://placehold.co/400x400/ff8c00/FFFFFF/png?text=Heatmap-D',
    },
    { id:"233",
      patientId: '3',
      score: 75,
      date: new Date('2024-07-01'),
      notes: 'Follow-up assessment. Good progress in speech therapy. Some challenges remain with memory recall.',
      heatmapURL: 'https://placehold.co/400x400/ffd700/FFFFFF/png?text=Heatmap-E',
    },
    { id:"232",
      patientId: '4',
      score: 55,
      date: new Date('2024-07-18'),
      notes: 'Patient reports feeling more energetic, but objective measures show limited progress. Plan to re-evaluate medication.',
      heatmapURL: 'https://placehold.co/400x400/20b2aa/FFFFFF/png?text=Heatmap-F',
    },
  ];

  /**
   * Retrieves all assessments for a specific patient.
   * @param patientId The ID of the patient.
   * @returns An observable of an array of assessments.
   */
  getPatientAssessments(patientId: string | number | undefined): Observable<Assessment[]> {
    // if (!patientId) {
    //   return of([]);
    // }
    // const assessments = this.mockAssessments.filter(
    //   (assessment) => assessment.patientId === patientId
    // );
    // return of(assessments).pipe(delay(500));
    if(!patientId){
      return of([])
    }
    return this.http.post<Observation[]>(this.BACKEND_URL + '/assessments',  patientId.toString() )
    .pipe(map((response:any)=>response.observations),map((response) => response.map((obs: Observation) => this.convertObservationToAssessment(obs))));
  }
  postPatientAssessment(formData: FormData): Observable<any>{
    return this.http.post(this.BACKEND_URL+'/gemini/assessment/', formData)
  }
  getBackendURL():string{
    return this.BACKEND_URL;
  }
  convertObservationToAssessment(obs:Observation):Assessment {
    const assessment:Assessment = {
      id:obs?.id || "",
      patientId:obs?.subject?.reference?.split("/")[1] || "",
      score:obs.valueQuantity?.value || 0,
      date:new Date(),
      notes:obs.note?.[0]?.text || "",
      heatmapURL:this.BACKEND_URL+obs?.component?.[1]?.valueString || ""

    }
    return assessment
  }
}
