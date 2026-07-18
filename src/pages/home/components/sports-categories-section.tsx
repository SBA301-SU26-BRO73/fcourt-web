import SectionHeading from "../../../components/ui/section-heading";
import CategoryCard from "../../../components/ui/category-card";

export default function SportsCategoriesSection() {
  const categories = [
    {
      title: "Pickleball",
      count: "24 Venues",
      imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuAsImvfj2foNeNkSFQ-E3V0f_zhN05OYEC6L1z2hzNbAWefyr4raXjEUg1sUTG1zFBCsQIzR91ulqegMsIxW3LU04tOvsxRvj_aC7cArUFXvSbgh9AtvBmn_IaGqzVt8VB02jbNAMo-E8_5-9CCr1SZgOvUYSTvajXaLLa85RL7fdFdvxOh316QTqXw5Fe85kFlDS7CyZJvTPuK5PjIG6eD0nPz0vX37gjJvpdN2dlmW_hIa_Bzz39E1OCHBEyjN-IEvUppPI2tT0M",
      icon: "sports_tennis",
      bgOverlayClass: "bg-primary/80 group-hover:bg-primary/70",
    },
    {
      title: "Tennis",
      count: "18 Venues",
      imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpu4faGieZh02Fzqqoikm8ZyhUNOkNQMU0NUCEtxxC7kCyrpWDQa6CkQ7vzaqd-yeK2ZQTlV0ejrP9QhszJsiIHudO2PaFxe5Psdg6CetCG4o24Pnr4ljhRm6Ehu6isMXweZ9lVyIf7aWIbFaQdUoqTubLj-mC7_BXPu1H1RLA7-ZhPPCpI9wcLjJn0kHRSpVw3Wfv2qADei633qFXLkEi8Dvzwa967iCag0i0KG46EvOGr6ttzTCSDLohReu7zUOIEaK8P0R8THo",
      icon: "sports_volleyball",
      bgOverlayClass: "bg-secondary/80 group-hover:bg-secondary/70",
    },
    {
      title: "Badminton",
      count: "12 Venues",
      imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFu0tEhsCOQ2sU2rx2N-uj76emDxlMacFu60iKusNj8b9v8_tfpo8FHU-EUWkGRoNDUj_cC8zUfDZLNz8fu8kqqP5R8yZMQho667wGcODf5bvgd41rgYLLrCiFS8S5Hk1cJRJhkwLH3b2-HH_6jNn9GhHapzM33b3Gq9Dvdm5w2id6YGhc_itm43u50dQ5GTuLlWjS5r6Ze9LcKMhqA39Q-Z4GK3Rm7iG1jj4Offm3V3_0O9FmPRoNxMcbrj07N87JrE7klSgqvII",
      icon: "badminton",
      bgOverlayClass: "bg-tertiary/80 group-hover:bg-tertiary/70",
    },
  ];

  return (
    <section className="py-stack-xl px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
      <div className="mb-stack-lg">
        <SectionHeading title="Explore by Sport" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {categories.map((cat, index) => (
          <CategoryCard key={index} {...cat} />
        ))}
      </div>
    </section>
  );
}