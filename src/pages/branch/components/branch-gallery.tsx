import { useState } from "react";
import { usePublicBranchImages } from "@/hooks/use-public-branches";

const FALLBACK_IMAGE = "https://lh3.googleusercontent.com/aida-public/AB6AXuDkf1-dSdwtoABJkWeg8R_dEK6FxEDzKiL2xWYUVxhTLeiLg0TJOcxu0LTobNbkpWaPhhCFNcXwEtjckUaTiV9duWZVJnJIwqinb8kyiDyEBNy59ffqH4pY-MgnwHVwChqQi7dCGYoPV6NQ3x6jdZizWiifMKP-taxp_2DQyxSqWRj8eZ7KtIZVLqFULfyD4m_FYr18YJWSQBm3KtkEKJr7w2uKo7TLWBEy8HR9KVjjr_GTLewEHo-d6uJdI7vpUtHJuMwWKaS3m8Y";

export default function BranchGallery({ branchId, branchName }: { branchId: string; branchName: string }) {
  const { data, isPending } = usePublicBranchImages(branchId);
  const [showAll, setShowAll] = useState(false);
  const images = data ?? [];

  if (isPending) {
    return <section className="bento-grid animate-pulse"><div className="bento-main rounded-xl bg-surface-container" /></section>;
  }

  if (images.length === 0) {
    return (
      <section className="bento-grid">
        <div className="bento-main relative overflow-hidden rounded-xl">
          <img alt={branchName} className="w-full h-full object-cover" src={FALLBACK_IMAGE} />
        </div>
      </section>
    );
  }

  const [main, sub1, sub2, ...rest] = images;
  const tile = (image: typeof main | undefined, cls: string, index: number) => image && (
    <div className={`${cls} relative overflow-hidden rounded-xl group`}>
      <img alt={`${branchName} ${index}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={image.url} />
    </div>
  );

  return (
    <>
      <section className="bento-grid">
        {tile(main, "bento-main", 1)}
        {tile(sub1, "bento-sub-1", 2)}
        {tile(sub2, "bento-sub-2", 3)}
        {rest.length > 0 && (
          <button type="button" onClick={() => setShowAll((value) => !value)} className="bento-sub-3 relative overflow-hidden rounded-xl group bg-surface-container-high flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined text-display-lg text-primary">collections</span>
            <span className="font-label-md text-label-md mt-stack-xs">{showAll ? "Thu gọn" : `Xem thêm ${rest.length} ảnh`}</span>
          </button>
        )}
      </section>
      {showAll && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-stack-sm">
          {rest.map((image, index) => (
            <div key={image.id} className="aspect-video overflow-hidden rounded-xl">
              <img alt={`${branchName} ${index + 4}`} className="w-full h-full object-cover" src={image.url} />
            </div>
          ))}
        </section>
      )}
    </>
  );
}
