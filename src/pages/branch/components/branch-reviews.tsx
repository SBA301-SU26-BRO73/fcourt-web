import { useState } from "react";
import { usePublicBranchReviews } from "@/hooks/use-public-branches";
import { getApiErrorMessage } from "@/common/utils/api-error";
import { ZoomableImage } from "@/components/ui/image-viewer";
import type { BranchReview } from "@/types/public-branch";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex text-primary" aria-label={`${rating} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <span key={value} className="material-symbols-outlined text-lg" style={{ fontVariationSettings: `'FILL' ${value <= Math.round(rating) ? 1 : 0}` }}>star</span>
      ))}
    </div>
  );
}

function formatReviewDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("vi-VN");
}

function ReviewCard({ review }: { review: BranchReview }) {
  return (
    <div className="p-stack-lg bg-surface-container-lowest border border-outline-variant/20 rounded-xl space-y-stack-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-stack-sm">
          {review.reviewerAvatarUrl ? (
            <img src={review.reviewerAvatarUrl} alt={review.reviewerName} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold">
              {review.reviewerName.trim().charAt(0).toUpperCase() || "K"}
            </div>
          )}
          <div>
            <div className="font-label-md text-label-md">{review.reviewerName}</div>
            <div className="font-label-sm text-label-sm text-on-surface-variant">{formatReviewDate(review.createdAt)}</div>
          </div>
        </div>
        <Stars rating={review.rating} />
      </div>
      {review.comment && <p className="font-body-sm text-body-sm italic">"{review.comment}"</p>}
      {review.imageUrls.length > 0 && (
        <div className="flex flex-wrap gap-stack-sm">
          {review.imageUrls.map((url, index) => (
            <ZoomableImage
              key={url}
              src={url}
              alt="Ảnh đánh giá"
              gallery={review.imageUrls.map((u, i) => ({ url: u, alt: `Ảnh đánh giá ${i + 1}` }))}
              index={index}
              className="h-20 w-20 rounded-lg object-cover"
            />
          ))}
        </div>
      )}
      {review.adminReply && (
        <div className="rounded-lg bg-surface-container px-stack-md py-stack-sm">
          <div className="font-label-sm text-label-sm text-primary">Phản hồi từ cơ sở</div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{review.adminReply}</p>
        </div>
      )}
    </div>
  );
}

export default function BranchReviews({ branchId }: { branchId: string }) {
  const [page, setPage] = useState(0);
  const { data, isPending, error } = usePublicBranchReviews(branchId, page);

  return (
    <section className="space-y-stack-lg">
      <div className="flex items-center justify-between gap-stack-md">
        <h2 className="font-headline-md text-headline-md">Đánh giá người chơi</h2>
        {data && data.totalElements > 0 && (
          <div className="flex items-center gap-unit text-on-surface">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="font-label-md text-label-md">{data.averageRating.toFixed(1)} ({data.totalElements} đánh giá)</span>
          </div>
        )}
      </div>
      {error ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getApiErrorMessage(error, "Không thể tải đánh giá.")}
        </div>
      ) : isPending ? (
        <div className="h-24 animate-pulse rounded-xl bg-surface-container" />
      ) : data.content.length === 0 ? (
        <div className="p-stack-lg text-center bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-on-surface-variant font-body-md">
          Chưa có đánh giá nào cho cơ sở này.
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-stack-md">
            {data.content.map((review) => <ReviewCard key={review.id} review={review} />)}
          </div>
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-stack-md">
              <button type="button" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))} className="px-stack-md py-unit rounded-full font-label-sm text-label-sm hover:bg-surface-container text-on-surface-variant disabled:opacity-40 cursor-pointer">Trang trước</button>
              <span className="font-label-sm text-label-sm text-on-surface-variant">{page + 1} / {data.totalPages}</span>
              <button type="button" disabled={page >= data.totalPages - 1} onClick={() => setPage((current) => current + 1)} className="px-stack-md py-unit rounded-full font-label-sm text-label-sm hover:bg-surface-container text-on-surface-variant disabled:opacity-40 cursor-pointer">Trang sau</button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
