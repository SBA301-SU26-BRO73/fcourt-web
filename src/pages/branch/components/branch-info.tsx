export default function BranchInfo() {
    const amenities = [
      { icon: "lock", label: "Locker rooms" },
      { icon: "local_cafe", label: "Cafe" },
      { icon: "shopping_bag", label: "Pro shop" },
      { icon: "local_parking", label: "Free Parking" },
      { icon: "wifi", label: "Gigabit WiFi" },
      { icon: "shower", label: "Showers" },
    ];
  
    return (
      <section className="grid md:grid-cols-2 gap-gutter">
        <div className="space-y-stack-md">
          <h2 className="font-headline-md text-headline-md">About the Hub</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Our Westside location is the flagship of the Velocity network, featuring 12 professional-grade courts across three disciplines. Whether you're a seasoned pro or just picking up a racket, our climate-controlled indoor courts and scenic outdoor clay surfaces provide the ultimate environment for your game.
          </p>
          <div className="bg-surface-container rounded-xl p-stack-lg border border-outline-variant/30">
            <h3 className="font-label-md text-label-md mb-stack-md uppercase tracking-wider">Hours of Operation</h3>
            <div className="space-y-unit">
              <div className="flex justify-between font-body-sm text-body-sm">
                <span>Monday – Friday</span>
                <span className="font-medium">6:00 AM – 11:00 PM</span>
              </div>
              <div className="flex justify-between font-body-sm text-body-sm">
                <span>Saturday</span>
                <span className="font-medium">7:00 AM – 10:00 PM</span>
              </div>
              <div className="flex justify-between font-body-sm text-body-sm">
                <span>Sunday</span>
                <span className="font-medium">8:00 AM – 8:00 PM</span>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-stack-md">
          <h2 className="font-headline-md text-headline-md">Amenities</h2>
          <div className="grid grid-cols-2 gap-stack-md">
            {amenities.map((item, index) => (
              <div key={index} className="flex items-center gap-stack-sm p-stack-sm bg-surface-container-lowest border border-outline-variant/20 rounded-lg">
                <span className="material-symbols-outlined text-primary">{item.icon}</span>
                <span className="font-label-md text-label-md">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }