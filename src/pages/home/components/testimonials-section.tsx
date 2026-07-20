export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Minh Quân',
      role: 'Người chơi Cầu lông',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBOpr286VPPZOp9oIA3ri0isMfuDi7_kzgeATpbhR_zag-YlA6F0bCu-pHgB_ZpXooE4G7_PcJhoaRfIExr16yyql7FEDMtWvVnfkGcKApFJrZjW7nqzPRlQQapONbSMMc6J4Xx3c9w--vqg26mkTUcI1nWpKGQdcCCj3z-N_nGGBPQuZkpv1s0XGOKrn8wKdGBoPyM4wg2bPWTJvTatVitkIKaDiUdCVw2Rwo_bW-nyv8WxXK0RqiHA9Wwd3bpnItK_pOYYyoDSg4',
      quote:
        'Ứng dụng cực kỳ mượt mà, mình tìm được sân cầu lông gần nhà chỉ trong vài giây. Rất tiện lợi cho những người bận rộn.',
    },
    {
      name: 'Thu Hương',
      role: 'Người chơi Tennis',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA-QfqvPfvc3UIxOlqficrZxAnAFBsj6nuAv-HiNDESafE0Mhi7w5C-7MGlME12Hr4OY87iDhEDYIMd6VtJArp6TIVn9FGzgdIStLtDkXuXao4qSAwxMWgPt-Blr2d3EFGAw59V8jLw4jTEBU3G1NZrN-3S1wjZWcfn9w88KklU5D4-eECypONpte22OyBK5isRsD7VBhZ9r6Vp7l_Hl_VPfk9aWK3dgHZzcu6080qPKEVDPu75iJ_iq71sTr10XnZTbIp94dQG4WA',
      quote:
        'Thanh toán rất nhanh và bảo mật. Mình thích cách ứng dụng nhắc nhở lịch thi đấu trước 1 tiếng. Tuyệt vời!',
    },
    {
      name: 'Anh Tuấn',
      role: 'Chủ sân bóng đá',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBFsjN_k8wqhQGLPWDtGUSMDgSI98HRKL4UcHp32RA5dcz10OHZPy2BJQryfKuHU7NDtEeuitBKv4eGWXDAabEUvU2dRwLL2YL7_Bc4NZpfYsJxOQuZX9wM14866GmJ7hzumH955wOqQIe54vRO5w2RBZRzTb4VuJxbpu-KB9JxwsonCxeMhuWZY96tBYxBWB9A98oDQASgRB1VB1RXFm0UG_rdGLa1nxQwY50Vy0cXnlR-jWZZW8JMPTBQcHno5WGZ0SxxEQlwIn8',
      quote:
        'Quản lý sân bãi của tôi trở nên dễ dàng hơn bao giờ hết từ khi hợp tác với FCourt. Tỉ lệ lấp đầy sân tăng 40%.',
    },
  ]

  return (
    <section className="py-20 px-4 md:px-16 bg-[#faf8fe] dark:bg-[#1a1b1f] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-16 text-[#1a1b1f] dark:text-white">
          Người dùng nói gì về FCourt?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#2f3034] p-8 rounded-[24px] border border-[#bccabc]/40 relative shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <span
                className="material-symbols-outlined text-[#006d38]/20 dark:text-[#59df89]/20 absolute top-4 right-6 text-5xl select-none"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                format_quote
              </span>

              <div>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className="material-symbols-outlined text-[#006d38] dark:text-[#59df89] text-xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                  ))}
                </div>

                <p className="text-base text-[#1a1b1f] dark:text-gray-200 mb-8 leading-relaxed italic">
                  "{item.quote}"
                </p>
              </div>

              <div className="flex items-center gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-emerald-500/30">
                  <img
                    className="w-full h-full object-cover"
                    alt={item.name}
                    src={item.avatar}
                  />
                </div>
                <div>
                  <p className="font-bold text-[#1a1b1f] dark:text-white text-sm">
                    {item.name}
                  </p>
                  <p className="text-xs text-[#3d4a3f] dark:text-gray-400">
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
