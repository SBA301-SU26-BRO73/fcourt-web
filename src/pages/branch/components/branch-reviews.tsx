export default function BranchReviews() {
    return (
      <section className="space-y-stack-lg">
        <h2 className="font-headline-md text-headline-md">Đánh giá người chơi</h2>
        <div className="grid md:grid-cols-2 gap-stack-md">
          <div className="p-stack-lg bg-surface-container-lowest border border-outline-variant/20 rounded-xl space-y-stack-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-stack-sm">
                <div className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold">JD</div>
                <div>
                  <div className="font-label-md text-label-md">Julian D.</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">Tuần trước</div>
                </div>
              </div>
              <div className="flex text-primary">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
            </div>
            <p className="font-body-sm text-body-sm italic">"Ánh sáng tại sân trong nhà rất tuyệt vời. Cảm giác chuyên nghiệp và nhân viên hỗ trợ nhiệt tình!"</p>
          </div>
          <div className="p-stack-lg bg-surface-container-lowest border border-outline-variant/20 rounded-xl space-y-stack-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-stack-sm">
                <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold">SR</div>
                <div>
                  <div className="font-label-md text-label-md">Sarah R.</div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">2 tuần trước</div>
                </div>
              </div>
              <div className="flex text-primary">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 0" }}>star</span>
              </div>
            </div>
            <p className="font-body-sm text-body-sm italic">"Tôi rất thích sân tennis ngoài trời lúc hoàng hôn. Không gian tuyệt vời và chất lượng hoàn toàn xứng đáng."</p>
          </div>
        </div>
      </section>
    );
  }
