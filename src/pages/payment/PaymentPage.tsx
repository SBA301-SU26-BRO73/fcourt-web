import { Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { QRPaymentCard } from '../../components/QRPaymentCard';
import { UploadReceipt } from '../../components/UploadReceipt';
import { BookingSummary } from '../../components/BookingSummary';
import { getBookingDetails } from '@/services/booking/booking.api';
import type { CreateBookingsResponse } from '@/types/booking';
import type { Voucher } from '@/types/voucher';

interface LocationState {
  booking?: CreateBookingsResponse;
}

export function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const bookingIdParam = searchParams.get('bookingId');

  const [bookingData, setBookingData] = useState<CreateBookingsResponse | null>(() => {
    return (location.state as LocationState | null)?.booking ?? null;
  });
  const [loading, setLoading] = useState(!bookingData && !!bookingIdParam);
  const [error, setError] = useState<string | null>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  useEffect(() => {
    if (bookingData) return;

    if (bookingIdParam) {
      const bId = parseInt(bookingIdParam, 10);
      if (isNaN(bId)) {
        setError('Mã đặt sân không hợp lệ.');
        setLoading(false);
        return;
      }

      setLoading(true);
      getBookingDetails(bId)
        .then((fetchedBooking) => {
          const mapped: CreateBookingsResponse = {
            branchId: fetchedBooking.branchId,
            branchName: fetchedBooking.branchName,
            branchAddress: fetchedBooking.branchAddress,
            bankAccountNumber: fetchedBooking.bankAccountNumber,
            bankAccountName: fetchedBooking.bankAccountName,
            bankName: fetchedBooking.bankName,
            bankQrImageUrl: fetchedBooking.bankQrImageUrl,
            totalAmount: fetchedBooking.totalPrice,
            bookings: [fetchedBooking],
          };
          setBookingData(mapped);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError('Không thể tải thông tin đặt sân. Lịch đặt sân có thể đã hết hạn hoặc không tồn tại.');
          setLoading(false);
        });
    }
  }, [bookingIdParam, bookingData]);

  // Manage countdown timer
  const expiredAt = bookingData?.bookings?.[0]?.expiredAt;
  const [timeLeft, setTimeLeft] = useState(() => {
    if (expiredAt) {
      const difference = +new Date(expiredAt) - +new Date();
      return difference > 0 ? Math.floor(difference / 1000) : 0;
    }
    return 300; // default 5 minutes
  });

  useEffect(() => {
    if (!expiredAt) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(expiredAt) - +new Date();
      return difference > 0 ? Math.floor(difference / 1000) : 0;
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [expiredAt]);

  const isExpired = timeLeft <= 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Đang tải thông tin đặt sân...</p>
        </div>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full text-center shadow-sm">
          <h1 className="text-xl font-bold text-foreground mb-2">Chưa có booking để thanh toán</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {error || 'Vui lòng chọn slot và tạo booking trước khi vào trang thanh toán.'}
          </p>
          <button
            onClick={() => navigate('/slot-booking')}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold"
          >
            Chọn sân
          </button>
        </div>
      </div>
    );
  }

  const handleVoucherChange = (voucher: Voucher | null, discount: number) => {
    setAppliedVoucher(voucher);
    setDiscountAmount(discount);
  };

  const paymentCode = `BOOK-${bookingData.bookings.map((booking) => booking.id).join('-')}`;
  const finalAmount = Math.max(0, bookingData.totalAmount - discountAmount);

  return (
    <div className="min-h-screen bg-[#f5faf6] text-[#191c1d]" style={{ zoom: 0.9 }}>
      <main className="mx-auto max-w-[1320px] px-4 py-8 md:px-8 md:py-10">
        <div className="mb-7">
          <h1 className="text-3xl font-bold tracking-tight text-[#191c1d]">Hoàn tất thanh toán</h1>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(340px,0.82fr)]">
          <div>
            <QRPaymentCard
              branchName={bookingData.branchName}
              bankName={bookingData.bankName}
              bankAccountNumber={bookingData.bankAccountNumber}
              bankAccountName={bookingData.bankAccountName}
              bankQrImageUrl={bookingData.bankQrImageUrl}
              amount={finalAmount}
              content={paymentCode}
              timeLeft={timeLeft}
            />
          </div>
          <div>
            <BookingSummary
              data={bookingData}
              paymentCode={paymentCode}
              onVoucherChange={handleVoucherChange}
            />
            <UploadReceipt
              bookingData={bookingData}
              paymentCode={paymentCode}
              isExpired={isExpired}
              discount={discountAmount}
              voucherCode={appliedVoucher?.code}
            />
          </div>
        </div>

        <div className="mt-7 text-center">
          <p className="text-xs text-[#667267]">
            Bằng việc thanh toán, bạn đồng ý với{' '}
            <a href="#" className="text-primary hover:underline">
              Điều khoản dịch vụ
            </a>{' '}
            và{' '}
            <a href="#" className="text-primary hover:underline">
              Chính sách bảo mật
            </a>{' '}
            của SportCourt
          </p>
        </div>
      </main>
    </div>
  );
}
