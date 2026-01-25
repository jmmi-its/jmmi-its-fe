export type AdminRole = 'admin' | 'event' | 'mentoring' | 'publication';

export interface User {
  role: string;
  access_token: string;
  refresh_token: string;
}

export interface withTokens {
  access_token: string;
  refresh_token: string;
}

export interface UpdateUser {
  nama: string;
  phone_number: string;
  jenjang: string;
  provinsi_num: number;
}

export interface withToken {
  token: string;
}

export interface MyProfile {
  nama: string;
  email: string;
  phone_number: string;
  tahu_ise_darimana: string;
  jenjang: string;
  provinsi: string;
  is_email_verified: boolean;
  role: string;
  hasEvents?: event[];
}

export interface event {
  event_name: string;
  status: string;
  registrant_id: string;
}
