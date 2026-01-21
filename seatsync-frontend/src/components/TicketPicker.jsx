import React from 'react';
import { Ticket, Crown, Users, Star, Flame, Plus, Minus, AlertCircle } from 'lucide-react';

const TicketPicker = ({ tiers, selectedTickets, onQuantityChange, loading, soldCounts = {} }) => {
  
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 w-full bg-neutral-800/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 pb-32">
      <div className="text-left mb-8">
        <h3 className="text-xl font-bold text-white">Select Tickets</h3>
        <p className="text-neutral-400 text-sm">Choose the best experience for you</p>
      </div>

      <div className="space-y-4">
        {tiers.map((tier) => {
          const quantity = selectedTickets[tier.id] || 0;
          // Calculate remaining tickets
          const sold = soldCounts[tier.type] || 0;
          const remaining = tier.capacity - sold;
          const isAlmostOut = remaining > 0 && remaining <= 5;
          const isSoldOut = remaining <= 0 || tier.isSoldOut;

          return (
            <div 
              key={tier.id}
              className={`relative overflow-hidden group bg-[#1a1b26] border transition-all duration-300 rounded-2xl p-5 
                ${quantity > 0 ? 'border-orange-500 ring-1 ring-orange-500/50' : 'border-neutral-800 hover:border-neutral-700'}
                ${isSoldOut ? 'opacity-60 grayscale-[0.5]' : ''}`}
            >
              {/* Tier Icon Decoration */}
              <div className="absolute -right-4 -top-4 opacity-5 transform rotate-12 group-hover:scale-110 transition-transform">
                {tier.type === 'VVIP' ? <Crown size={120} /> : <Ticket size={120} />}
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-4">
                <div className="flex gap-4 items-start">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    tier.type === 'VVIP' ? 'bg-purple-500/10 text-purple-400' : 
                    tier.type === 'VIP' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {tier.type === 'VVIP' && <Crown size={24} />}
                    {tier.type === 'VIP' && <Star size={24} />}
                    {tier.type === 'GROUP' && <Users size={24} />}
                    {tier.type === 'EARLY' && <Flame size={24} />}
                    {tier.type === 'REGULAR' && <Ticket size={24} />}
                  </div>

                  <div className="text-left">
                    <h4 className="font-bold text-lg text-white flex items-center gap-2">
                      {tier.name}
                      {isSoldOut && (
                        <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full uppercase">
                          Sold Out
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-neutral-400 max-w-[200px] md:max-w-xs mb-2">
                      {tier.description}
                    </p>
                    
                    {/* Capacity Indicator */}
                    {!isSoldOut && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${isAlmostOut ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${isAlmostOut ? 'text-red-400' : 'text-neutral-500'}`}>
                          {isAlmostOut ? `Only ${remaining} left!` : `${remaining} available`}
                        </span>
                      </div>
                    )}
                    
                    <p className="text-orange-500 font-bold">KES {tier.price.toLocaleString()}</p>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center self-end md:self-center gap-4 bg-neutral-900/80 rounded-lg p-1 border border-neutral-800">
                  <button 
                    onClick={() => onQuantityChange(tier.id, -1)}
                    disabled={quantity === 0 || isSoldOut}
                    className="p-2 hover:bg-neutral-800 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-6 text-center font-bold text-white">{quantity}</span>
                  <button 
                    onClick={() => onQuantityChange(tier.id, 1)}
                    disabled={isSoldOut || quantity >= 10 || quantity >= remaining}
                    className="p-2 hover:bg-neutral-800 rounded-md disabled:opacity-30 transition-colors text-white"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TicketPicker;