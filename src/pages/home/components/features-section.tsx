export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 md:px-16 bg-[#f4f3f8] dark:bg-[#121316]">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-[#006d38] dark:text-[#59df89] font-bold text-xs tracking-widest uppercase">
            Tính năng nổi bật
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1a1b1f] dark:text-white mt-2">
            Mọi thứ bạn cần cho một buổi tập hoàn hảo
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left Column: Feature Items */}
          <div className="space-y-6">
            <div className="p-6 rounded-[24px] bg-white dark:bg-[#2f3034] border border-[#bccabc]/40 flex items-start gap-5 hover:shadow-md transition-shadow">
              <div className="p-3 bg-[#00a859]/15 rounded-xl shrink-0">
                <span className="material-symbols-outlined text-[#006d38] dark:text-[#59df89] text-3xl">
                  travel_explore
                </span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-[#1a1b1f] dark:text-white mb-1">
                  Tìm kiếm thông minh
                </h4>
                <p className="text-sm text-[#3d4a3f] dark:text-gray-300 leading-relaxed">
                  Hệ thống gợi ý sân gần bạn dựa trên vị trí hiện tại và thời gian trống thực tế. Tiết kiệm thời gian tìm kiếm tối đa.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-[24px] bg-white dark:bg-[#2f3034] border border-[#bccabc]/40 flex items-start gap-5 hover:shadow-md transition-shadow">
              <div className="p-3 bg-[#00a859]/15 rounded-xl shrink-0">
                <span className="material-symbols-outlined text-[#006d38] dark:text-[#59df89] text-3xl">
                  verified_user
                </span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-[#1a1b1f] dark:text-white mb-1">
                  Thanh toán an toàn
                </h4>
                <p className="text-sm text-[#3d4a3f] dark:text-gray-300 leading-relaxed">
                  Tích hợp đa dạng hình thức thanh toán từ thẻ nội địa, ví điện tử đến chuyển khoản ngân hàng với độ bảo mật tuyệt đối.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-[24px] bg-white dark:bg-[#2f3034] border border-[#bccabc]/40 flex items-start gap-5 hover:shadow-md transition-shadow">
              <div className="p-3 bg-[#00a859]/15 rounded-xl shrink-0">
                <span className="material-symbols-outlined text-[#006d38] dark:text-[#59df89] text-3xl">
                  calendar_month
                </span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-[#1a1b1f] dark:text-white mb-1">
                  Quản lý lịch đặt
                </h4>
                <p className="text-sm text-[#3d4a3f] dark:text-gray-300 leading-relaxed">
                  Dễ dàng theo dõi, thay đổi hoặc hủy lịch chỉ với vài chạm trên ứng dụng. Luôn cập nhật trạng thái đặt sân real-time.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive App Preview */}
          <div className="relative">
            <div className="rounded-[32px] overflow-hidden shadow-2xl border-8 border-white/50 dark:border-gray-800">
              <img
                className="w-full h-full object-cover"
                alt="FCourt Mobile App UI Render"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnzOEw3g21DfYlubILbeIV5NBN3eGDy_-8OBc1Zj8PeOulHzkVqmLJ0U-GV6qVd-CXCtp4oItF_WMF44ePanBqbutZ577l8bYvFi-dAndWCqGj_JXt4wQQwLET3WFRIKilZSspb3HQs09q78Fx2nEnaxvTT4wqL45l6zN2eaGRtdYldMW4lye7Fpe5kYycTFBHm0xaPZDWUdEgxV-dx2XYyiz1BNAgbfnhWCtIUfuF9grHPvyavz6nN8J8AfJUqs3RUAN-0F5R-6U"
              />
            </div>

            {/* Decorative Badge */}
            <div className="absolute -bottom-4 -right-4 bg-[#006d38] text-white p-5 rounded-2xl shadow-xl hidden md:block border border-white/20">
              <p className="font-bold text-center text-xs leading-tight">
                Đặt ngay trong
                <br />
                <span className="text-2xl font-extrabold text-[#77fca3]">
                  30 giây
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
