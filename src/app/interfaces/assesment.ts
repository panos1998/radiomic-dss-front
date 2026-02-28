export interface Assessment {
    id: string;
    patientId: number | string;
    score: number;
    date: Date;
    notes: string;
    heatmapURL: string;
  }