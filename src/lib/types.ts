export type UserRole = "superadmin" | "employee";

export type EmployeeStatus = "active" | "inactive";

export type AttendanceType = "check_in" | "check_out";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  employee_id: string;
  department: string;
  position: string;
  phone: string;
  address: string;
  join_date: string;
  role: UserRole;
  status: EmployeeStatus;
  face_descriptor: number[] | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceLog {
  id: string;
  user_id: string;
  check_type: AttendanceType;
  captured_at: string;
  confidence_score: number;
  note: string | null;
  created_at: string;
}
