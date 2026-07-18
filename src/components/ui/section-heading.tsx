type SectionHeadingProps = {
  title: string;
  subtitle?: string;     // feature
  eyebrow?: string;      // dev
  description?: string;  // dev
};

export default function SectionHeading({
  title,
  subtitle,
  eyebrow,
  description,
}: SectionHeadingProps) {
  return (
    <div className="max-w-2xl space-y-3">
      {(subtitle || eyebrow) && (
        <p className="text-primary text-sm font-semibold uppercase tracking-[0.24em]">
          {subtitle ?? eyebrow}
        </p>
      )}

      <h2 className="font-headline-lg text-headline-lg">
        {title}
      </h2>

      {description && (
        <p className="text-base leading-7 text-slate-600">
          {description}
        </p>
      )}
    </div>
  );
}