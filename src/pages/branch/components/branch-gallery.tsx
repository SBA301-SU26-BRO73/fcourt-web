export default function BranchGallery() {
    return (
      <section className="bento-grid">
        <div className="bento-main relative overflow-hidden rounded-xl group">
          <img alt="Gallery Image 1" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkf1-dSdwtoABJkWeg8R_dEK6FxEDzKiL2xWYUVxhTLeiLg0TJOcxu0LTobNbkpWaPhhCFNcXwEtjckUaTiV9duWZVJnJIwqinb8kyiDyEBNy59ffqH4pY-MgnwHVwChqQi7dCGYoPV6NQ3x6jdZizWiifMKP-taxp_2DQyxSqWRj8eZ7KtIZVLqFULfyD4m_FYr18YJWSQBm3KtkEKJr7w2uKo7TLWBEy8HR9KVjjr_GTLewEHo-d6uJdI7vpUtHJuMwWKaS3m8Y" />
        </div>
        <div className="bento-sub-1 relative overflow-hidden rounded-xl group">
          <img alt="Gallery Image 2" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMGNwNi5oAYoXHTrbIAdveZLS_jlnipKuWZZkavVnBqeVNkmgizIW6z3kqljlTBINQoGffiYbPKvZKSoff70-GRfn21Du_RuDiyRZgLgSZXo6PDuxH1dU8Ff82L5HKrwi9gbVzb9j1AizozKjwA5ebOXrn-anJUPmSbFvZsfHTvytK5tjeBqr73bWBmnzAM9GYUlND9-owplaoLRh169H_3RznvSgFFjdEvkdPK95obZs1FC7nnDCRxCaUc5TwlJdwxVpde80OAYQ" />
        </div>
        <div className="bento-sub-2 relative overflow-hidden rounded-xl group">
          <img alt="Gallery Image 3" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCixMWLwvgosiwYViy13L4fCQ7VFkcQXOODOJU_s1mkUAlElpUHrRvspI1ApBDtkkj1Alhpzkyi_nXa2g-xSCNOSZFUB8QjowFo517vq7t3w8pt2Ei9Nmoc5ZAWzNO9A0HQYTjLV-bCQfqxtkjdqoLO_AsZx9KLZRWrGKUIYHtJj3knvtfjAv44HncnbLf-ivyJkfSPsSuOrqO_ksbUUAxG8HHMkBf7YumW3mDpUHH_bv38vIIbgNLj-RrIR0AhwjVjVxNsqU7XuzA" />
        </div>
        <div className="bento-sub-3 relative overflow-hidden rounded-xl group bg-surface-container-high flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-highest transition-colors">
          <span className="material-symbols-outlined text-display-lg text-primary">collections</span>
          <span className="font-label-md text-label-md mt-stack-xs">+12 Photos</span>
        </div>
      </section>
    );
  }