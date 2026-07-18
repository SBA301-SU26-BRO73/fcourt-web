export type BookingStatus = 'pending' | 'approved' | 'rejected';

export interface Booking {
  id: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  courtName: string;
  courtNumber: string;
  branch: string;
  address: string;
  sport: string;
  date: string;
  timeSlot: string;
  durationHours: number;
  amount: number;
  status: BookingStatus;
  receiptColor: string; // used for mock receipt placeholder
  submittedAt: string;
  notes?: string;
}

const now = new Date();
const sub = (mins: number) => new Date(now.getTime() - mins * 60 * 1000).toISOString();

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: '1',
    bookingCode: 'SC240529ABCD',
    customerName: 'Nguyễn Văn An',
    customerPhone: '0901 234 567',
    customerEmail: 'nguyenvanan@gmail.com',
    courtName: 'Sân bóng số 3',
    courtNumber: '3',
    branch: 'Chi nhánh Tân Bình',
    address: '123 Đường Hoàng Văn Thụ, P.4, Q.Tân Bình, TP.HCM',
    sport: 'Bóng đá',
    date: 'Thứ 6, 29/05/2026',
    timeSlot: '18:00 - 19:30',
    durationHours: 1.5,
    amount: 350000,
    status: 'pending',
    receiptColor: '#10b981',
    submittedAt: sub(5),
  },
  {
    id: '2',
    bookingCode: 'SC240529EFGH',
    customerName: 'Trần Thị Bình',
    customerPhone: '0912 345 678',
    customerEmail: 'tranthib@gmail.com',
    courtName: 'Sân cầu lông A',
    courtNumber: 'A',
    branch: 'Chi nhánh Bình Thạnh',
    address: '45 Đường Phan Văn Trị, P.11, Q.Bình Thạnh, TP.HCM',
    sport: 'Cầu lông',
    date: 'Thứ 7, 30/05/2026',
    timeSlot: '07:00 - 08:00',
    durationHours: 1,
    amount: 120000,
    status: 'pending',
    receiptColor: '#6366f1',
    submittedAt: sub(12),
  },
  {
    id: '3',
    bookingCode: 'SC240529IJKL',
    customerName: 'Lê Quang Dũng',
    customerPhone: '0933 456 789',
    customerEmail: 'lequangd@gmail.com',
    courtName: 'Sân tennis 2',
    courtNumber: '2',
    branch: 'Chi nhánh Quận 7',
    address: '88 Đường Nguyễn Thị Thập, P.Tân Phú, Q.7, TP.HCM',
    sport: 'Tennis',
    date: 'Chủ nhật, 01/06/2026',
    timeSlot: '06:00 - 07:30',
    durationHours: 1.5,
    amount: 210000,
    status: 'pending',
    receiptColor: '#f59e0b',
    submittedAt: sub(28),
  },
  {
    id: '4',
    bookingCode: 'SC240528MNOP',
    customerName: 'Phạm Thị Lan',
    customerPhone: '0977 567 890',
    customerEmail: 'phamlan@gmail.com',
    courtName: 'Sân bóng rổ số 1',
    courtNumber: '1',
    branch: 'Chi nhánh Tân Bình',
    address: '123 Đường Hoàng Văn Thụ, P.4, Q.Tân Bình, TP.HCM',
    sport: 'Bóng rổ',
    date: 'Thứ 5, 28/05/2026',
    timeSlot: '20:00 - 21:00',
    durationHours: 1,
    amount: 180000,
    status: 'approved',
    receiptColor: '#ec4899',
    submittedAt: sub(180),
    notes: 'Đã xác nhận chuyển khoản đúng nội dung.',
  },
  {
    id: '5',
    bookingCode: 'SC240528QRST',
    customerName: 'Hoàng Minh Tuấn',
    customerPhone: '0988 678 901',
    customerEmail: 'hoangminhtuan@gmail.com',
    courtName: 'Sân bóng số 1',
    courtNumber: '1',
    branch: 'Chi nhánh Quận 7',
    address: '88 Đường Nguyễn Thị Thập, P.Tân Phú, Q.7, TP.HCM',
    sport: 'Bóng đá',
    date: 'Thứ 5, 28/05/2026',
    timeSlot: '17:00 - 18:30',
    durationHours: 1.5,
    amount: 350000,
    status: 'rejected',
    receiptColor: '#8b5cf6',
    submittedAt: sub(240),
    notes: 'Sai nội dung chuyển khoản.',
  },
  {
    id: '6',
    bookingCode: 'SC240529UVWX',
    customerName: 'Vũ Thị Hoa',
    customerPhone: '0966 789 012',
    customerEmail: 'vuthihoa@gmail.com',
    courtName: 'Sân cầu lông B',
    courtNumber: 'B',
    branch: 'Chi nhánh Bình Thạnh',
    address: '45 Đường Phan Văn Trị, P.11, Q.Bình Thạnh, TP.HCM',
    sport: 'Cầu lông',
    date: 'Thứ 6, 29/05/2026',
    timeSlot: '19:00 - 20:00',
    durationHours: 1,
    amount: 120000,
    status: 'pending',
    receiptColor: '#14b8a6',
    submittedAt: sub(45),
  },
  {
    id: '7',
    bookingCode: 'SC240527YZAB',
    customerName: 'Đỗ Văn Khoa',
    customerPhone: '0944 890 123',
    customerEmail: 'dovank@gmail.com',
    courtName: 'Sân tennis 1',
    courtNumber: '1',
    branch: 'Chi nhánh Tân Bình',
    address: '123 Đường Hoàng Văn Thụ, P.4, Q.Tân Bình, TP.HCM',
    sport: 'Tennis',
    date: 'Thứ 4, 27/05/2026',
    timeSlot: '16:00 - 17:30',
    durationHours: 1.5,
    amount: 210000,
    status: 'approved',
    receiptColor: '#f97316',
    submittedAt: sub(1440),
  },
];

export const formatAmount = (amount: number) =>
  new Intl.NumberFormat('vi-VN').format(amount) + '₫';

export const formatRelativeTime = (isoString: string) => {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return `${diff} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
};
