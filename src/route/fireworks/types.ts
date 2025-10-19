export interface FireworksItem {
  id: number;
  prompt: string | null;
  aiModel: string | null;
  videoPath: string | null;
  videoPathNoWatermark: string | null;
  publicVideoPath: string | null;
  publicVideoPathNoWatermark: string | null;
  createAt: string;
}

export interface FireworksListResponse {
  data: FireworksItem[];
  total: number;
}

export interface FireworksFormData {
  prompt: string;
  aiModel: string;
  videoPath: string;
}

export interface GenerateFormData {
  prompt: string;
  aiModel: string;
}
