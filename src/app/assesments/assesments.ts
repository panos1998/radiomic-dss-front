import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, Signal, effect, WritableSignal, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { PatientDTO } from '../interfaces/patient';
import { PatientsService } from '../services/patients.service';
import { trigger, style, transition, animate, query, stagger } from '@angular/animations';
import { IonTitle, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardContent, IonCardTitle, IonCardSubtitle, IonModal, IonHeader, IonToolbar, IonContent, IonButton, IonButtons, IonIcon, IonItem, IonImg, IonList, IonListHeader,IonLabel } from '@ionic/angular/standalone';
import { AssessmentService } from '../services/assessment.service';
import { Assessment } from '../interfaces/assesment';
import { Observation } from 'fhir/r4';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MarkdownConverterService } from '../services/markdown.service';

@Component({
  selector: 'app-assesments',
  imports: [
    CommonModule,
    IonTitle, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, 
    IonCardContent, IonCardTitle, IonCardSubtitle, IonModal, 
    IonHeader, IonToolbar, IonContent, IonButton, IonButtons, IonIcon,IonItem,IonImg,IonListHeader,IonList,IonLabel
  ],
  templateUrl: './assesments.html',
  styleUrl: './assesments.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideUp', [
      transition('void => *, * => *', [
        style({ transform: 'translateY(150px)', opacity: 0 }),
        animate('600ms cubic-bezier(0.35, 0, 0.25, 1)', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('cardAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
})
export class Assesments implements OnInit, OnDestroy {
  patientsService = inject(PatientsService);
  assessmentsService = inject(AssessmentService);

  patientIdSignal = toSignal(this.patientsService.selected_patient_changed_observable);
  selectedPatient: Signal<PatientDTO | undefined> = toSignal(
    toObservable(this.patientIdSignal).pipe(switchMap((id) => this.patientsService.getSelectedPatient(id)))
  );

  assessmentsLoading: WritableSignal<boolean> = signal(false);
  patientAssessments: WritableSignal<Assessment[]> = signal([]);
  isModalOpen = signal(false);
  destroy$: Subject<boolean> = new Subject<boolean>();
  selectedAssessment: WritableSignal<Assessment | undefined> = signal(undefined);
  modalMode: WritableSignal<'view' | 'add'> = signal('view');
  imageSelected:WritableSignal<boolean>=signal(false);
  imagePreview:WritableSignal<string  | null> = signal(null)
  selectedImage: any;
  invalidImage: WritableSignal<boolean> = signal(false);
  markdownConverter = inject(MarkdownConverterService)



  constructor() {
    effect(() => {
      const patient = this.selectedPatient();
      this.patientAssessments.set([]);

      if (patient) {
        this.assessmentsLoading.set(true);
        setTimeout(() => {
          this.assessmentsService.getPatientAssessments(patient.id).pipe(takeUntil(this.destroy$)).subscribe((assessments: Assessment[]) => {
            this.patientAssessments.set(assessments);
            this.assessmentsLoading.set(false);
          });
        }, 50);
      }
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen.set(isOpen);
  }
  showAssesment(assessment: Assessment){
    this.modalMode.set('view')
    this.selectedAssessment.set(assessment);
    this.setOpen(true)
  }
  hideAssessment(){
    this.selectedAssessment.set(undefined);
    this.setOpen(false)
  }
  showAddAssessment(){
    console.log("open add assessment form")
    this.modalMode.set('add');
    this.setOpen(true);

  }
  closeAddAssessment(){
    console.log("close add assessment form")
  }
  openContext(){
    const element = document.createElement("input");
  }
  onFileSelected($event: any) {
    const file = $event.target.files[0];
    
    if (file) {
      this.imageSelected.set(true);
      this.selectedImage = file;
      
      const reader = new FileReader();
      
      // 2. Update the signal inside the callback
      reader.onload = () => {
        // We cast to string because readAsDataURL returns a string
        this.imagePreview.set(reader.result as string); 
        
        console.log("imagePreview updated:", this.imagePreview());
      };
  
      reader.readAsDataURL(file); // Make sure this line exists!
    }
  }
  resetImage(inputElement?: HTMLInputElement){
    this.imageSelected.set(false)
    this.invalidImage.set(false);
    if (inputElement) {
      inputElement.value = '';
    }
  }
  submitAssessment(){
    const patientId = this.selectedPatient()?.id;
    const formData = new FormData();
    formData.append('image_file', this.selectedImage);
    formData.append('patient_id', patientId || '');
    console.log("patientId", patientId)
    this.invalidImage.set(false);
    if(patientId){
     this.assessmentsService.postPatientAssessment(formData).subscribe({
      next: (response:any) =>{
        if (response.status=="error"){
          console.log("Invalid image")
          this.invalidImage.set(true);
        } else {
          console.log("Successfully submitted")
          this.selectedAssessment.set( {
            id:response.result.id,
            patientId:response.result.subject.reference.split("/")[1],
            score:response.result.valueQuantity.value,
            date:new Date(),
            notes:response.result.note?.[0]?.text,
            heatmapURL:this.assessmentsService.getBackendURL()+response.result.component[1].valueString

          })
          this.modalMode.set('view');
          this.patientAssessments.set([
            ...this.patientAssessments(),
            ...(this.selectedAssessment() ? [this.selectedAssessment()!] : [])
          ]);         
        }
      },
      error:(error) => console.log("error")
     })
    }
  }

  getSafeNotes(notes: string): SafeHtml {
    return this.markdownConverter.toHtml(notes);
  }
  getFirstNWords(text: string, wordCount: number = 20): string {
    if (!text) return '';
    const words = text.split(/\s+/);
    return words.length > wordCount
      ? words.slice(0, wordCount).join(' ') + '...'
      : text;
  }
}
