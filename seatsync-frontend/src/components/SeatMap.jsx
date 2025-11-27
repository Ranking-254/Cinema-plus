import '../App.css'; 

const SeatMap = ({ seats, onSeatClick, loading }) => {
  
  // 1. SKELETON LOADER
  if (loading) {
    return (
      <div className="stage-container">
        <div className="legend" style={{ opacity: 0.5 }}>
           <div className="legend-item">Loading map...</div>
        </div>
        <div className="stage">SCREEN / STAGE</div>
        
        {/* Wrapper for mobile scrolling */}
        <div className="seat-map-overflow">
          <div className="seat-grid">
            {Array.from({ length: 50 }).map((_, index) => (
              <div key={index} className="skeleton-seat"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. REAL CONTENT
  return (
    <div className="stage-container">
      {/* Legend */}
      <div className="legend">
        <div className="legend-item"><span className="dot available"></span> Available</div>
        <div className="legend-item"><span className="dot held"></span> Held</div>
        <div className="legend-item"><span className="dot sold"></span> Sold</div>
      </div>

      <div className="stage">SCREEN / STAGE</div>

      {/* Wrapper for mobile scrolling */}
      <div className="seat-map-overflow">
        <div className="seat-grid">
          {seats.map((seat) => (
            <button
              key={seat._id}
              className={`seat ${seat.status}`}
              onClick={() => onSeatClick(seat)}
              disabled={seat.status !== 'AVAILABLE'}
              title={`Row ${seat.row} - Seat ${seat.number} ($${seat.price})`}
            >
              {seat.row}{seat.number}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeatMap;