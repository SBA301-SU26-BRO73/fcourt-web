import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ProgressStepper } from '../../components/ProgressStepper';
import { QRPaymentCard } from '../../components/QRPaymentCard';
import { UploadReceipt } from '../../components/UploadReceipt';
import { BookingSummary } from '../../components/BookingSummary';

export function PaymentPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>

            <div className="absolute left-1/2 -translate-x-1/2">
              <h1 className="text-xl font-bold text-primary">SportCourt</h1>
            </div>

            <div className="flex items-center gap-2 bg-accent/50 px-3 py-1.5 rounded-lg">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">SSL Secure</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Hoàn tất đặt sân
          </h1>
          <p className="text-muted-foreground">
            Vui lòng thanh toán qua QR code bên dưới để hoàn tất đặt sân
          </p>
        </div>

        <ProgressStepper currentStep={2} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <QRPaymentCard />
            <UploadReceipt />
          </div>
          <div className="lg:col-span-1">
            <BookingSummary />
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
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
