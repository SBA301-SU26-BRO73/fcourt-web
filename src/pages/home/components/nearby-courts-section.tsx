import SectionHeading from "../../../components/ui/section-heading";
import CourtCard from "../../../components/ui/court-card";
import { useRef } from "react";

export default function NearbyCourtsSection() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: direction === "left" ? -320 : 320,
        behavior: "smooth",
      });
    }
  };

  const courts = [
    {
      imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuAq_3P4Jv8GuYnIenQs1hRwbyEHzuJJNfPDXcPTdhgy7n0FwMsjBZoV5XZ-h3hJfeOVvgn0kYreCCMKFd6z7ZMN5CDHpzOzl6o8QkRPRF2WRSn4jTbX6_64fhirteDrMZXSFieQlbB6Csq9k1efkTn9T4poK9RRmWB--C2HDZSf8iKM_9-arFtTUTnmnaNaJvaW4HSg8JaOoWrLFNk_LZ6HfPY0Aodnn51l-Cxu0d6qboarynvVvSoRKpmsTqqB-gycrvM_fHUi4eI",
      title: "The Velocity Loft",
      rating: "4.9",
      location: "Downtown District",
      price: "45",
      isAvailableNow: true,
    },
    {
      imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7qNU4GPXp0oOmIK5S1Fr2lXvZRerTUAzhG3BCwgxYRZ9Vcfu9AV-JFqrJk38v2R0E8Ax-WFjs1Ode9VQyzN_VupvxHYTCVQux7s0Nt5nI0S8yO0mMDB_oMIXocUxzdMzDN9DYIOIJhM6ts2ypgQsG_dVgvdWV3q45uMt9pO5PVbO3SESFcSDOM5eKhXg6lae_H5QGJS0maJGQFxtFG4daysug9OfMAhQ3M9FJDeiLDO_QU1NrgRlHe6XRV5_exXbIoPGgzP1GR5w",
      title: "Greenline Arena",
      rating: "4.7",
      location: "North Park",
      price: "60",
    },
    {
      imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuDF1FJHORD-jcTPhaGVXKuWqRIe9Z_-O2-A9ho6gvBkEKSznrnpVD92ZnLMkZQcl4R9bAFk-DUZAV4YB1JqwdP9ytlxskGa-V97RZY27__xzpNI_-AF87PIQbTedMTGkl5IRPUGi7Evz1foCger5qKWBL1fQcsKa4kbO5mbt59HTmGJCizqj8yKZWMC7YBnm0E5J3dosrLNczdD5fUKqhJnd3x9Fo8voDUVBAAy-nlBV53exmWgkZMSeib8sfrLlYWoMqbGF24UKj4",
      title: "Ace Point",
      rating: "4.8",
      location: "Westside Hub",
      price: "35",
    },
    {
      imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSC10m0bzhu3ZSuyh8hp7RJbik7dhfO9Cflz2KcxzR5Ffg-s1GDlsXCmqFW1Duz_WQTawy0ii739frYXGvGommPmI7CDg1Q6STRL-DAFQ9ZpjqW6gtjG0JI4ouFnUyQw_2yM3ZczpGnFJh8N4H4cWBXTlY7xxeySNKmoEJ1sgWh58Xu96zjAHMBy9hPdGHkzSBL2L8URb7Ys4EjqAyUT0tGpfcVnoKEAxESaRPF2D8-4946_PzYK7uMrZcd0ddLkU0tf6nTBkTsfc",
      title: "The Summit Courts",
      rating: "5.0",
      location: "Skyline Ridge",
      price: "55",
    },
  ];

  return (
    <section className="py-stack-xl px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto overflow-hidden">
      <div className="flex justify-between items-end mb-stack-lg">
        <SectionHeading title="Nearby Courts" subtitle="Discover" />
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 border border-outline-variant rounded-full hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 border border-outline-variant rounded-full hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
      <div
        ref={carouselRef}
        className="flex gap-gutter overflow-x-auto no-scrollbar pb-8"
      >
        {courts.map((court, index) => (
          <CourtCard key={index} {...court} />
        ))}
      </div>
    </section>
  );
}