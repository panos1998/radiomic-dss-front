export interface PatientDTO {
    id: string | undefined;
    name: string | undefined;
    age: number;
    gender: string | undefined;
    diagnosis?: string;
}
