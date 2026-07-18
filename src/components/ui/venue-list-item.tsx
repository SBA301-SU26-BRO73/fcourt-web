interface VenueListItemProps {
    imageSrc: string;
    title: string;
    location: string;
    rating: string;
    reviews: string;
  }
  
  export default function VenueListItem({
    imageSrc,
    title,
    location,
    rating,
    reviews,
  }: VenueListItemProps) {
    return (
      <div className="flex gap-4 p-4 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer group">
        <img
          className="w-24 h-24 rounded-xl object-cover"
          src={imageSrc}
          alt={title}
        />
        <div className="flex flex-col justify-center">
          <h4 className="font-bold text-on-surface">{title}</h4>
          <p className="text-label-sm text-on-surface-variant mb-2">{location}</p>
          <div className="flex items-center gap-1 text-primary">
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span className="font-label-sm">
              {rating} ({reviews} reviews)
            </span>
          </div>
        </div>
      </div>
    );
  }