
export type Role = 'STUDENT' | 'TEACHER' | 'PARENT';

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
}

export interface ClassSession {
  id: string;
  title: string;
  code: string;
  time: string;
  location: string;
  teacher: string;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
  distance?: number; // meters from user
  lat?: number;
  lng?: number;
  radius?: number; // allowed radius in meters
  attendanceCount?: number;
}

export interface AttendanceRecord {
  id: string;
  studentName: string;
  className: string;
  timestamp: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'FRAUD_FLAG';
  confidenceScore: number;
  hash: string;
}

export interface BlockData {
  blockId: string;
  prevHash: string;
  hash: string;
  timestamp: string;
  studentId: string;
  classId: string;
}

export interface Notif {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
}

export enum ScanStep {
  IDLE = 'IDLE',
  GPS = 'GPS',
  FACE = 'FACE',
  MOTION = 'MOTION',
  FUSION = 'FUSION',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}
