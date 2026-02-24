// DonorCard component - renders a single donor with all their details and request button

function DonorCard({ donor, onRequest, requested }) {
    // Disable the button if already requested OR donor is unavailable
    const isDisabled = requested || !donor.availability;
    return (
        <div className={`donor-card ${!donor.availability ? 'donor-card--unavailable' : ''}`}>
            {/* Blood group badge - top-right accent */}
            <span className="blood-badge">{donor.bloodGroup}</span>

            {/* Donor info */}
            <h2 className="donor-name">{donor.name}</h2>
            <p className="donor-city">
                <span className="icon">📍</span> {donor.city}
            </p>

            {/* Availability chip */}
            <span className={`availability-chip ${donor.availability ? 'available' : 'unavailable'}`}>
                {donor.availability ? '● Available' : '● Unavailable'}
            </span>

            {/* Request button - disabled if already requested OR donor is unavailable */}
            <button
                className={`request-btn ${isDisabled ? 'request-btn--sent' : ''}`}
                onClick={() => onRequest(donor.id)}
                disabled={isDisabled}
                aria-label={requested ? 'Request already sent' : !donor.availability ? 'Donor unavailable' : `Request help from ${donor.name}`}
            >
                {requested ? 'Request Sent ✅' : 'Request Help'}
            </button>
        </div>
    )
}

export default DonorCard
