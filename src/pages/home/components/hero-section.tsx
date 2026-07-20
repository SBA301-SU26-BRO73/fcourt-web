import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    const el = document.getElementById("features");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full min-h-[750px] flex items-center overflow-hidden">
      {/* Background Image with Brightness Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center brightness-[0.85] transition-all duration-700"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuA073iprHSsyxCne_4Kpq3Oiw-leOG3cDshOZvaTYZDN0D7NG3AdtJDqf2gCFxj1oDZqEy0bhHRTS4n8_R2vozEZ0Nc0_LBQwM8bPtM2sFdLzyzbcwBQ7rvu1iizB0sYQMjqfunVLrHvb5HpYKl8K2CF3dIEOvr7F42Uw--Eq6L_lD0kT06uHkoPwa_UFIN2MA1ccAHV6thUa78ySsWZxvS0qmwx_u8XW8rzMZILwQ1yFsa8RYot5vs4SKY4w0YG1pgCNZoVDJiGrU')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      </div>

      <div className="relative z-10 w-full px-4 md:px-16 py-20">
        <div className="max-w-2xl bg-white/10 backdrop-blur-md p-6 sm:p-10 rounded-[32px] border border-white/20 shadow-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="material-symbols-outlined text-[#77fca3]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              stars
            </span>
            <span className="text-white font-bold text-xs tracking-widest uppercase">
              Nền tảng #1 Việt Nam
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Đặt sân thể thao <br />
            <span className="text-[#59df89] drop-shadow-sm">
              nhanh chóng &amp; tiện lợi
            </span>{" "}
            nhất
          </h1>

          <p className="text-base sm:text-lg text-white/90 mb-8 max-w-lg leading-relaxed">
            Hơn 500 sân thể thao trên toàn quốc. Đặt sân trong 30 giây, hủy miễn
            phí, thanh toán bảo mật.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate("/branches")}
              className="bg-[#006d38] hover:bg-[#00a859] active:scale-95 text-white px-8 py-4 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Đặt ngay
              <span className="material-symbols-outlined text-xl">
                arrow_forward
              </span>
            </button>

            <button
              onClick={scrollToFeatures}
              className="bg-white/20 hover:bg-white/30 active:scale-95 text-white border border-white/30 backdrop-blur px-8 py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center"
            >
              Tìm hiểu thêm
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer" onClick={scrollToFeatures}>
        <span className="material-symbols-outlined text-white/60 text-4xl hover:text-white transition-colors">
          keyboard_double_arrow_down
        </span>
      </div>
    </section>
  );
}