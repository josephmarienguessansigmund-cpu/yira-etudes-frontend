export interface Cabinet {
  id: string;
  nom: string;
  email_contact: string;
  secteur?: string;
}

export interface AuthResponse {
  access_token: string;
  cabinet: Cabinet;
}

export type QuestionType = 'TEXT' | 'NUMBER' | 'GPS' | 'PHOTO' | 'SELECT' | 'MULTIPLE';

export interface Question {
  id: string;
  ordre: number;
  label: string;
  type: QuestionType;
  is_required: boolean;
  options?: string[];
}

export interface SurveyTemplate {
  id: string;
  titre: string;
  description?: string;
  is_active: boolean;
  country_code: string;
  nb_questions?: number;
  nb_reponses?: number;
  questions?: Question[];
  created_at: string;
  updated_at: string;
}

export interface SurveyResult {
  id: string;
  data: Record<string, any>;
  canal: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

export interface DashboardKpis {
  total_enquetes: number;
  total_reponses: number;
  reponses_7j: number;
  reponses_30j: number;
  tendance_7j_pct: number | null;
}

export interface DashboardHome {
  kpis: DashboardKpis;
  top_enquetes: { id: string; titre: string; total_reponses: number }[];
  par_canal: { canal: string; count: number; pct: number }[];
  feed_recent: {
    id: string;
    canal: string;
    created_at: string;
    enquete: { id: string; titre: string };
  }[];
}