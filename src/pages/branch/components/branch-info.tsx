import type { Branch, CourtResponse } from '../../../services/branch/branch.api';

interface BranchInfoProps {
  branch: Branch;
  courts: CourtResponse[];
}

export default function BranchInfo({ branch, courts }: BranchInfoProps) {
    const amenities = [
      { icon: "lock", label: "Locker rooms" },
      { icon: "local_cafe", label: "Cafe" },
      { icon: "shopping_bag", label: "Pro shop" },
      { icon: "local_parking", label: "Free Parking" },
      { icon: "wifi", label: "Gigabit WiFi" },
      { icon: "shower", label: "Showers" },
    ];
  
    return (
      <section className="grid md:grid-cols-2 gap-gutter">
        <div className="space-y-stack-md">
          <h2 className="font-headline-md text-headline-md">About the Hub</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {branch.name} hiện có {courts.length} sân thể thao. Chọn sân và khung giờ phù hợp để bắt đầu đặt sân.
          </p>
          <div className="bg-surface-container rounded-xl p-stack-lg border border-outline-variant/30">
            <h3 className="font-label-md text-label-md mb-stack-md uppercase tracking-wider">Hours of Operation</h3>
            <div className="flex justify-between font-body-sm text-body-sm">
              <span>Hằng ngày</span>
              <span className="font-medium">{formatTime(branch.openTime)} – {formatTime(branch.closeTime)}</span>
            </div>
          </div>
        </div>
        <div className="space-y-stack-md">
          <h2 className="font-headline-md text-headline-md">Amenities</h2>
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

function formatTime(value: string) {
  return value?.slice(0, 5) || '--:--';
}
