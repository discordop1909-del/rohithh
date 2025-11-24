
import { User, ClassSession, AttendanceRecord, Notif } from './types';
import { LayoutDashboard, QrCode, User as UserIcon, Wallet, ShieldCheck, MapPin, Activity, Award } from 'lucide-react';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Rohith Kumar',
  role: 'STUDENT',
  avatar: 'https://picsum.photos/200/200',
};

// Haversine formula to calculate distance between two points in meters
export const getDistanceFromLatLonInM = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d * 1000; // Distance in meters
};

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export const CLASSES: ClassSession[] = [
  {
    id: 'c1',
    title: 'Advanced AI & ML',
    code: 'CS-401',
    time: '10:00 AM - 11:30 AM',
    location: 'Lab Complex B',
    teacher: 'Dr. Abdul',
    status: 'LIVE',
    distance: 0,
    lat: 17.4486,
    lng: 78.3912,
    radius: 50,
    attendanceCount: 42
  },
  {
    id: 'c2',
    title: 'Blockchain Architecture',
    code: 'CS-405',
    time: '02:00 PM - 03:30 PM',
    location: 'Seminar Hall 2',
    teacher: 'Prof. Sarah',
    status: 'UPCOMING',
    distance: 0,
    lat: 17.4500,
    lng: 78.3950,
    radius: 30,
    attendanceCount: 0
  },
];

export const MOCK_NOTIFICATIONS: Notif[] = [
  { id: 'n1', title: 'Attendance Marked', message: 'Successfully verified for AIML Class', time: '2m ago', read: false, type: 'SUCCESS' },
  { id: 'n2', title: 'Scholarship Update', message: 'You have earned 50 XP today!', time: '1h ago', read: false, type: 'INFO' },
];

export const MOCK_BLOCKS = [
  { id: '#8921', hash: '0x7f...3a2b', status: 'Verified', time: '10:05 AM' },
  { id: '#8920', hash: '0x3c...9d1e', status: 'Verified', time: 'Yesterday' },
];

export const NAV_ITEMS = [
  { id: 'home', icon: <LayoutDashboard size={24} />, label: 'Home' },
  { id: 'scan', icon: <QrCode size={24} />, label: 'Scan' },
  { id: 'wallet', icon: <Wallet size={24} />, label: 'Wallet' },
  { id: 'profile', icon: <UserIcon size={24} />, label: 'Profile' },
];
