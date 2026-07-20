export default function StatsSection() {
  return (
    <section className="py-16 px-4 md:px-16 bg-[#faf8fe] dark:bg-[#1a1b1f]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: 500+ Sân */}
        <div className="bg-white dark:bg-[#2f3034] p-8 rounded-[24px] shadow-[0px_4px_20px_rgba(0,168,89,0.06)] border border-[#bccabc]/40 flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300">
          <div className="w-16 h-16 rounded-full bg-[#00a859]/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span
              className="material-symbols-outlined text-[#006d38] dark:text-[#59df89] text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              stadium
            </span>
          </div>
          <h3 className="text-4xl font-extrabold text-[#006d38] dark:text-[#59df89] mb-1">
            500+
          </h3>
          <p className="font-bold text-[#3d4a3f] dark:text-gray-300 text-sm">
            Sân thể thao toàn quốc
          </p>
        </div>

        {/* Card 2: 50K+ Người dùng */}
        <div className="bg-white dark:bg-[#2f3034] p-8 rounded-[24px] shadow-[0px_4px_20px_rgba(0,168,89,0.06)] border border-[#bccabc]/40 flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300">
          <div className="w-16 h-16 rounded-full bg-[#00a859]/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span
              className="material-symbols-outlined text-[#006d38] dark:text-[#59df89] text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              groups
            </span>
          </div>
          <h3 className="text-4xl font-extrabold text-[#006d38] dark:text-[#59df89] mb-1">
            50K+
          </h3>
          <p className="font-bold text-[#3d4a3f] dark:text-gray-300 text-sm">
            Người dùng tin tưởng
          </p>
        </div>

        {/* Card 3: 4.9★ Đánh giá */}
        <div className="bg-white dark:bg-[#2f3034] p-8 rounded-[24px] shadow-[0px_4px_20px_rgba(0,168,89,0.06)] border border-[#bccabc]/40 flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300">
          <div className="w-16 h-16 rounded-full bg-[#00a859]/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span
              className="material-symbols-outlined text-[#006d38] dark:text-[#59df89] text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              stars
            </span>
          </div>
          <h3 className="text-4xl font-extrabold text-[#006d38] dark:text-[#59df89] mb-1">
            4.9★
          </h3>
          <p className="font-bold text-[#3d4a3f] dark:text-gray-300 text-sm">
            Đánh giá trung bình
          </p>
        </div>
      </div>
    </section>
  );
}
