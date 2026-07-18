export interface SelectedSlot {
  courtId: number;
  courtName: string;
  startTime: string; // "HH:MM:SS" or "HH:MM"
  endTime: string;
  price: number;
  date: string;
}

interface BookingPanelProps {
  selectedSlots: SelectedSlot[];
  venueName: string;
  onBook: () => void;
}

export default function BookingPanel({ selectedSlots, venueName, onBook }: BookingPanelProps) {
  // calculate total amount
  const totalAmount = selectedSlots.reduce((sum, slot) => sum + slot.price, 0);

  if (selectedSlots.length === 0) return null;

  // Format the display text for selected slot
  // Let's sort slots by startTime
  const sortedSlots = [...selectedSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  // Group consecutive slots by court
  let slotText = '';
  let courtText = '';

  const uniqueCourts = Array.from(new Set(sortedSlots.map(s => s.courtName)));
  
  if (uniqueCourts.length === 1) {
    const courtName = uniqueCourts[0];
    const firstSlot = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];
    
    const startDisp = formatTimeAMPM(firstSlot.startTime);
    const endDisp = formatTimeAMPM(lastSlot.endTime);
    
    slotText = `${startDisp} - ${endDisp}`;
    courtText = `${courtName} • ${venueName}`;
  } else {
    // Multiple courts or non-consecutive
    slotText = `${sortedSlots.length} Slots Selected`;
    courtText = `${uniqueCourts.join(', ')} • ${venueName}`;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[1520px] z-50">
      <div className="bg-white border border-outline-variant/30 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 md:px-6 md:py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
          </div>
          <div>
            <div className="font-bold text-on-surface text-body-md md:text-body-lg">
              Selected Slot: <span className="text-primary">{slotText}</span>
            </div>
            <div className="text-on-surface-variant font-body-sm text-sm">
              {courtText}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-outline-variant/20">
          <div className="text-left md:text-right">
            <div className="text-on-surface-variant text-[12px] font-medium uppercase tracking-wider">Total Amount</div>
            <div className="text-primary font-bold text-2xl md:text-3xl">
              ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          
          <button 
            onClick={onBook}
            className="px-6 py-3 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-95 text-body-sm shrink-0 flex items-center gap-2 cursor-pointer"
          >
            Book Selected Slot
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTimeAMPM(time24: string) {
  const parts = time24.split(':');
  let hour = parseInt(parts[0], 10);
  const minutes = parts[1] || '00';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12; 
  const hourStr = hour < 10 ? `0${hour}` : `${hour}`;
  return `${hourStr}:${minutes} ${ampm}`;
}
