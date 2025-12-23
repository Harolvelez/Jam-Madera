export interface AuditItem {
  id: number;
  changed_at: string;
  order: {
    id: number;
    order_number: string;
  };
  status: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface AuditResponse {
  data: AuditItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}