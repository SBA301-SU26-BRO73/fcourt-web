import { MapPin, Calendar, Clock, User } from 'lucide-react';

export function BookingSummary() {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm sticky top-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Chi tiết đặt sân
      </h3>

      <div className="space-y-4">
        {/* Booking Code */}
        <div className="pb-4 border-b border-border">
          <div className="text-xs text-muted-foreground mb-1">Mã đặt sân</div>
          <div className="text-sm font-semibold text-foreground">
            SC240529ABCD
          </div>
        </div>

        {/* Sport Type Badge */}
        <div>
          <span className="inline-flex items-center bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-semibold">
            Bóng đá
          </span>
        </div>

        {/* Court Information */}
        <div className="space-y-3 pb-4 border-b border-border">
          <div>
            <div className="text-sm font-semibold text-foreground mb-1">
              Sân bóng số 3
            </div>
            <div className="text-xs text-muted-foreground">
              Chi nhánh Tân Bình
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-xs text-muted-foreground leading-relaxed">
              123 Đường Hoàng Văn Thụ, Phường 4, Quận Tân Bình, TP.HCM
            </span>
          </div>
        </div>

        {/* Date & Time */}
        <div className="space-y-3 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Ngày đặt</div>
              <div className="text-sm font-semibold text-foreground">
                Thứ 6, 29/05/2026
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">Thời gian</div>
              <div className="text-sm font-semibold text-foreground">
                18:00 - 19:30
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="pb-4 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">
              Thông tin khách hàng
            </span>
          </div>
          <div className="space-y-2 ml-7">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Họ tên</span>
              <span className="text-xs font-medium text-foreground">
                Nguyễn Văn An
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Số điện thoại</span>
              <span className="text-xs font-medium text-foreground">
                0901 234 567
              </span>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Giá thuê sân (1.5 giờ)
            </span>
            <span className="text-sm font-semibold text-foreground">
              350.000₫
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-foreground">
              Tổng thanh toán
            </span>
            <span className="text-2xl font-bold text-primary">
              350.000₫
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
