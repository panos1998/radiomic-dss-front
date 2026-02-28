import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFooter, IonCol,IonGrid,IonRow,IonImg } from '@ionic/angular/standalone';
import { PatientTable } from '../patient-table/patient-table';
import { PatientsService } from '../services/patients.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Assesments } from '../assesments/assesments';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, PatientTable, IonFooter, Assesments, IonRow,IonGrid,IonCol,IonImg],
})
export class HomePage {
  constructor() {}

  patientsService = inject(PatientsService);
  patientChangedSignal = toSignal(this.patientsService.selected_patient_changed_observable,
      { initialValue: null as unknown as string | undefined }
  );
}
