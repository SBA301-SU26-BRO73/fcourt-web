interface CategoryCardProps {
    title: string;
    count: string;
    imageSrc: string;
    icon: string;
    bgOverlayClass: string;
  }
  
  export default function CategoryCard({
    title,
    count,
    imageSrc,
    icon,
    bgOverlayClass,
  }: CategoryCardProps) {
    return (
      <div className="group relative overflow-hidden rounded-3xl h-64 cursor-pointer">
        <div
          className={`absolute inset-0 ${bgOverlayClass} transition-colors z-10`}
        ></div>
        <img
          className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
          src={imageSrc}
          alt={title}
        />
        <div className="relative z-20 h-full flex flex-col items-center justify-center p-8 text-white space-y-2">
          <span className="material-symbols-outlined text-4xl">{icon}</span>
          <h3 className="font-headline-lg text-headline-lg">{title}</h3>
          <p className="font-label-sm opacity-80">{count}</p>
        </div>
      </div>
    );
  }