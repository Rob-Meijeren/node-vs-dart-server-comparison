export interface IChargeLocation {
  id?: number;
  uuid: string;
  operator_id?: number;
  address_name: string;
  address_line_1: string;
  address_line_2?: string;
  address_city?: string;
  address_state?: string;
  address_postalcode?: string;
  address_country: string;
  latitude: number;
  longitude: number;
  contact_phone?: string;
  contact_email?: string;
}