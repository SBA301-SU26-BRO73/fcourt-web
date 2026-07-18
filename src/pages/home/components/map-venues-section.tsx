import SectionHeading from "../../../components/ui/section-heading";
import VenueListItem from "../../../components/ui/venue-list-item";

export default function MapVenuesSection() {
  const venues = [
    {
      imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKhJx1umyWHyw_2E-tqmJbGzyQYzYwBV193SX49xk2wzebq-Af4xIPDRZ7ZWphCGoSlXd1IazW6RKmuLb2pYU48dnkvIDv3ZYNipy-275XhvBCTG8QcQCQqwNTxKgU3jH4Qfw1wrmgDBm-bCaAx6Zo4bKGDYf1hdn2KfDKIuXmZdau53q4zCjmkZgXkEMBfvdGc2TITveZwMToNE6qqZzVzGnGMEN3CT9dlQcKgRkf6zEviE7SEOn7sEe9iod-jUI7ws0N4hHVrwI",
      title: "The Lab Pickleball",
      location: "Central Tech Park",
      rating: "4.9",
      reviews: "120",
    },
    {
      imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMbdC71hKTpFqcty0HYsEvP8UAS17Zxtmk_NPk4CJabjQe3npN9289Ozlgt5u63u10vvQqplyCsTSfchLabwHdZ0-I4TpHIi8zSFUeN2bIVJGcircdlru6ty04XY5HF2LQqQ0Dw840nWy9qRJMBzM9sIehSOYNNn4LZJ6sZr2ibd3j-8GfKEJJ-45J-R6BLZfGwpFXF7k91ekwmAUFh6PWsoELSZn_Mh402v7tKK48Wxl0wnxRTdK6xhoGCtk0ovNlIiihOwynlOs",
      title: "Ace Academy",
      location: "Heritage District",
      rating: "4.8",
      reviews: "85",
    },
    {
      imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFBKLUEUn2Sycjs_3j3PaYmwtX_YpCtNFHMOorBzcGfrnFyprbbDh6RZS8CFH86vAMm9EnXH_VQBbiDCbQmRyZMewQrC10mt_fk4yC4UlwetdTkA0pNPzFckLT-3bARvShYdoG95tQjw9KPgApOLjbo5yPhK42Tpq-Ocv5Jm0KWQEP0nQSeAvMMyLcK5nZb718room-3aEsLASnfJ0hxLLB9kgS-WDX9wohxiYm8w-ceUcmdK-ngY6gr5EGK7r9eyLuPbLiYQbVBs",
      title: "Velocity X",
      location: "Riverfront Plaza",
      rating: "5.0",
      reviews: "54",
    },
    {
      imageSrc: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_B3MpN59JDMJSfVii16HYFT2SOxMN87aLdV_NzQC-1kN5xi-i2Kk-13CDItePqriWSPhTTMjMexipUCgWB6Jj7SZCy2LCc4JNJxMCbp_LRjD4Q-2SMr639iUJxg0kfpmxUQ-9HkdUIQwF5K0GGTmgJIfDXdePGlY63ajbz1zw7QxsJJ2WGzhvjvltOvrpFYBAklaUUR54luurB16M2hDgIIs1fhq8M8jHJHufhlez2KrvEmuS9UqiGrOTPQWmNmn8c2RllVofqwc",
      title: "Shuttle Club",
      location: "Eastside Commons",
      rating: "4.7",
      reviews: "92",
    },
  ];

  return (
    <section className="py-stack-xl px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-3 gap-gutter">
      <div className="lg:col-span-2 space-y-stack-lg">
        <SectionHeading title="Popular Venues" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
          {venues.map((venue, index) => (
            <VenueListItem key={index} {...venue} />
          ))}
        </div>
      </div>

      {/* Map Preview */}
      <div className="space-y-stack-lg">
        <SectionHeading title="Court Density" />
        <div className="rounded-3xl border border-outline-variant/30 overflow-hidden h-[300px] relative">
          <img
            alt="Map showing court density"
            className="w-full h-full object-cover grayscale opacity-80"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2ByZH69bLIXtaAVLdmRvlpnA4Fvr6_6RpvR9Us4PZXTSlRC2M99pOh18Pa-LTkwWm-5MpqwnNwrBRecosPnK5q61VCeDNDRUbLERO2wif-fFCeyzEx4yof48NdWLGSPMiYlcvMn5NXQfSRhQwtafhiNb8VGNBucdyZUMPwnpgY-vAQOO-SRPNprJ7Ga1cfORGh5MG1sEWv7u1MYZkmf99brhDtXPpd1kdRFUlixKivQfyQ8t8j9bbkFKFBEhudvfz1vsj8zQg5kY"
          />
          <div className="absolute inset-0 bg-primary/10 pointer-events-none"></div>
          <div className="absolute bottom-4 left-4 right-4 glass-card p-4 rounded-2xl border border-white/20">
            <p className="font-label-md text-on-surface">
              42 Available courts near you
            </p>
            <p className="font-label-sm text-on-surface-variant">
              Update location for better results
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}