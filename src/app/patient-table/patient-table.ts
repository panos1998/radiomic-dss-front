import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonGrid, IonRow, IonCol, IonSpinner, IonTitle, IonItem } from '@ionic/angular/standalone';
import { PatientsService } from '../services/patients.service';
import { PatientDTO } from '../interfaces/patient';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-patient-table',
  imports: [IonGrid, IonRow, IonCol, IonSpinner, IonTitle,IonItem],
  templateUrl: './patient-table.html',
  styleUrl: './patient-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientTable {
  private patientsService = inject(PatientsService);

  // A signal to track the loading state.
  public isLoading = signal(true);

  public patients = toSignal(
    this.patientsService.getPatients().pipe(
      // When the observable completes or errors, set loading to false.
      finalize(() => {
        console.log("loading finished", this.patients())
        this.patientsService.setRealPatients(this.patients())
        this.isLoading.set(false)})
    ),
    { initialValue: [] as PatientDTO[] }
  );

  constructor() {}
  seeAssesments(patientId: string | undefined){
    console.log("klikara astheni: ", patientId)
    this.patientsService.setSelectedPatientId(patientId);

  }
}
