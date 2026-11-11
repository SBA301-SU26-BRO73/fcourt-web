import type { PublicBranchDetail } from '@/types/public-branch';
import type { CourtView } from '../branch-detail.types';
import { formatHour, formatPriceRange } from '../branch-search.utils';

interface BranchInfoProps {
  branch: PublicBranchDetail;
  courts: CourtView[];
}

export default function BranchInfo({ branch, courts }: BranchInfoProps) {
    const amenities = [
      { icon: "lock", label: "Phòng thay đồ" },
      { icon: "local_cafe", label: "Quầy nước" },
      { icon: "shopping_bag", label: "Cửa hàng thể thao" },
      { icon: "local_parking", label: "Bãi đỗ xe miễn phí" },
      { icon: "wifi", label: "WiFi tốc độ cao" },
      { icon: "shower", label: "Phòng tắm" },
    ];
    const prices = courts.map((court) => court.defaultPricePerHour);
    const priceRange = prices.length > 0 ? formatPriceRange(Math.min(...prices), Math.max(...prices)) : null;

    return (
      <section className="grid md:grid-cols-2 gap-gutter">
        <div className="space-y-stack-md">
          <h2 className="font-headline-md text-headline-md">Giới thiệu cơ sở</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {branch.name} hiện có {courts.length} sân thể thao. Chọn sân và khung giờ phù hợp để bắt đầu đặt sân.
          </p>
          <div className="bg-surface-container rounded-xl p-stack-lg border border-outline-variant/30">
            <h3 className="font-label-md text-label-md mb-stack-md uppercase tracking-wider">Giá tham khảo</h3>
            <div className="flex justify-between font-body-sm text-body-sm">
              <span>Mỗi giờ</span>
              <span className="font-medium">{priceRange ?? 'Chưa có giá'}</span>
            </div>
            {branch.openTime && branch.closeTime ? (
              <div className="mt-stack-md flex justify-between font-body-sm text-body-sm">
                <span>Giờ hoạt động</span>
                <span className="font-medium">{formatHour(branch.openTime)} – {formatHour(branch.closeTime)}</span>
              </div>
            ) : null}
            {branch.phone ? (
              <div className="mt-stack-md flex justify-between font-body-sm text-body-sm">
                <span>Số điện thoại</span>
                <a href={`tel:${branch.phone}`} className="font-medium text-primary hover:underline">{branch.phone}</a>
              </div>
            ) : null}
          </div>
        </div>
        <div className="space-y-stack-md">
          <h2 className="font-headline-md text-headline-md">Tiện ích</h2>
          <div className="grid grid-cols-2 gap-stack-md">
            {amenities.map((item, index) => (
              <div key={index} className="flex items-center gap-stack-sm p-stack-sm bg-surface-container-lowest border border-outline-variant/20 rounded-lg">
                <span className="material-symbols-outlined text-primary">{item.icon}</span>
                <span className="font-label-md text-label-md">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
