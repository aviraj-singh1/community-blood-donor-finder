import { useState, useEffect, useMemo } from 'react'
import DonorCard from './components/DonorCard'

// Fixed ordered list of blood groups used for deterministic assignment
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
const ALL_BLOOD_GROUPS = ['All', ...BLOOD_GROUPS]

// Maps a raw API user object to our donor shape.
// Assignments are deterministic — same user.id always produces same bloodGroup/availability.
function mapUserToDonor(user) {
    return {
        id: user.id,
        name: user.name,
        city: user.address.city,
        // Deterministic blood group: cycle through the list using modulo
        bloodGroup: BLOOD_GROUPS[user.id % BLOOD_GROUPS.length],
        // Deterministic availability: unavailable when id is divisible by 3
        availability: user.id % 3 !== 0,
    }
}

function App() {
    // ── Core state ──────────────────────────────────────────────────────────────
    const [donors, setDonors] = useState([])          // Full donor list from API
    const [loading, setLoading] = useState(true)       // True while API call is in-flight
    const [selectedGroup, setSelectedGroup] = useState('All')  // Dropdown filter value
    const [citySearch, setCitySearch] = useState('')   // City search input (bonus)
    // Per-donor request status: { [donorId]: true } when "Request Help" was clicked
    const [requestStatus, setRequestStatus] = useState({})

    // ── Fetch donors on mount ───────────────────────────────────────────────────
    useEffect(() => {
        setLoading(true)
        fetch('https://jsonplaceholder.typicode.com/users')
            .then((res) => res.json())
            .then((users) => {
                // Map API users to our donor shape client-side
                setDonors(users.map(mapUserToDonor))
                setLoading(false)
            })
            .catch(() => {
                // On error just stop loading; donors stays []
                setLoading(false)
            })
    }, []) // Empty dep array → runs once on mount

    // ── Derived state ───────────────────────────────────────────────────────────
    // filteredDonors is computed from donors + selectedGroup + citySearch.
    // useMemo prevents recomputation unless those three values change.
    const filteredDonors = useMemo(() => {
        return donors.filter((donor) => {
            const matchesGroup =
                selectedGroup === 'All' || donor.bloodGroup === selectedGroup
            const matchesCity =
                citySearch.trim() === '' ||
                donor.city.toLowerCase().includes(citySearch.trim().toLowerCase())
            return matchesGroup && matchesCity
        })
    }, [donors, selectedGroup, citySearch])

    // availableCount is derived from the currently visible (filtered) donors only
    const availableCount = useMemo(
        () => filteredDonors.filter((d) => d.availability).length,
        [filteredDonors]
    )

    // ── Event handlers ──────────────────────────────────────────────────────────
    // Mark a donor as "requested" — this state must not revert, so we spread and add.
    // Safety guard: if the donor is unavailable, return early and do nothing.
    function handleRequest(donorId) {
        const donor = donors.find((d) => d.id === donorId)
        if (!donor || !donor.availability) return   // guard: block unavailable donors
        setRequestStatus((prev) => ({ ...prev, [donorId]: true }))
    }

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="app-wrapper">
            {/* ── Header ── */}
            <header className="header">
                <div className="header-top">
                    <div className="header-title-group">
                        <div className="header-icon">🩸</div>
                        <div>
                            <h1 className="header-title">Community Blood Donor Finder</h1>
                            <p className="header-subtitle">
                                Connect with registered donors in your community
                            </p>
                        </div>
                    </div>

                    {/* Available donors badge — count updates as filter changes */}
                    <div className="available-badge">
                        <span className="available-badge__dot" />
                        <span>
                            Available: <strong>{availableCount}</strong>
                        </span>
                    </div>
                </div>

                {/* ── Controls row: blood group dropdown + city search ── */}
                <div className="controls">
                    <div className="control-group">
                        <label htmlFor="blood-group-select" className="control-label">
                            Blood Group
                        </label>
                        <select
                            id="blood-group-select"
                            className="select-input"
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                        >
                            {ALL_BLOOD_GROUPS.map((group) => (
                                <option key={group} value={group}>
                                    {group}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* BONUS: City search input — case-insensitive substring match */}
                    <div className="control-group">
                        <label htmlFor="city-search" className="control-label">
                            Search by City
                        </label>
                        <input
                            id="city-search"
                            type="text"
                            className="text-input"
                            placeholder="e.g. Gwenborough"
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            {/* ── Main content ── */}
            <main className="main-content">
                {loading ? (
                    /* Loading state */
                    <div className="state-container">
                        <div className="spinner" aria-label="Loading donors" />
                        <p className="state-text">Fetching donors…</p>
                    </div>
                ) : filteredDonors.length === 0 ? (
                    /* Empty state */
                    <div className="state-container">
                        <div className="empty-icon">🔍</div>
                        <p className="state-text">No donors found</p>
                        <p className="state-subtext">Try a different blood group or city.</p>
                    </div>
                ) : (
                    /* Donor grid — keyed by donor.id per requirements */
                    <div className="donor-grid">
                        {filteredDonors.map((donor) => (
                            <DonorCard
                                key={donor.id}
                                donor={donor}
                                onRequest={handleRequest}
                                requested={!!requestStatus[donor.id]}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default App
