import type { LocationSummary } from "../types/domain";

type Props = {
  locations: LocationSummary[];
  selectedAreaId: number | null;
  selectedBuildingId: number | null;
  onSelectArea: (id: number | null) => void;
  onSelectBuilding: (id: number | null) => void;
  onAddArea: () => void;
  onAddBuilding: (areaId: number) => void;
  onUseBuilding: (areaId: number, buildingId: number) => void;
};

const money = (value: number) => `AED ${value.toFixed(2)}`;

export function LocationsPage({
  locations,
  selectedAreaId,
  selectedBuildingId,
  onSelectArea,
  onSelectBuilding,
  onAddArea,
  onAddBuilding,
  onUseBuilding,
}: Props) {
  const areas = Array.from(
    new Map(locations.map((location) => [location.areaId, location])).values(),
  );
  const visibleBuildings = selectedAreaId
    ? locations.filter((location) => location.areaId === selectedAreaId)
    : locations;
  const selectedBuilding = locations.find((location) => location.buildingId === selectedBuildingId);

  if (selectedBuilding) {
    return (
      <section className="locations-page">
        <button className="profile-back" onClick={() => onSelectBuilding(null)}>
          ← Back to buildings
        </button>
        <div className="panel location-profile-hero">
          <div>
            <span className="ready">BUILDING 360°</span>
            <h2>{selectedBuilding.buildingName}</h2>
            <p>
              {selectedBuilding.propertyName} · {selectedBuilding.areaName}
            </p>
          </div>
          <button
            className="primary"
            onClick={() => onUseBuilding(selectedBuilding.areaId, selectedBuilding.buildingId)}
          >
            Use this building
          </button>
        </div>
        <div className="location-kpis">
          <article>
            <small>ACTIVE CUSTOMERS</small>
            <strong>{selectedBuilding.activeCustomers}</strong>
          </article>
          <article>
            <small>EXPECTED MONTHLY</small>
            <strong>{money(selectedBuilding.expectedRevenue)}</strong>
          </article>
          <article>
            <small>COLLECTED</small>
            <strong>{money(selectedBuilding.collected)}</strong>
          </article>
          <article>
            <small>OUTSTANDING</small>
            <strong>{money(selectedBuilding.outstanding)}</strong>
          </article>
          <article className={selectedBuilding.overdue > 0 ? "critical" : ""}>
            <small>OVERDUE</small>
            <strong>{money(selectedBuilding.overdue)}</strong>
          </article>
        </div>
        <section className="panel location-financial-panel">
          <h3>Financial performance</h3>
          <dl>
            <div>
              <dt>Total invoiced</dt>
              <dd>{money(selectedBuilding.invoiced)}</dd>
            </div>
            <div>
              <dt>Total collected</dt>
              <dd>{money(selectedBuilding.collected)}</dd>
            </div>
            <div>
              <dt>Collection rate</dt>
              <dd>
                {selectedBuilding.invoiced > 0
                  ? `${((selectedBuilding.collected / selectedBuilding.invoiced) * 100).toFixed(1)}%`
                  : "—"}
              </dd>
            </div>
          </dl>
        </section>
      </section>
    );
  }

  return (
    <section className="locations-page">
      <div className="location-toolbar">
        <div>
          <h2>Areas & buildings</h2>
          <p>Choose a location to view its customers and financial performance.</p>
        </div>
        <button className="primary" onClick={onAddArea}>
          + Add area
        </button>
      </div>
      <div className="area-cards">
        <button
          className={selectedAreaId === null ? "area-card active" : "area-card"}
          onClick={() => {
            onSelectArea(null);
            onSelectBuilding(null);
          }}
        >
          <strong>All areas</strong>
          <span>{locations.length} buildings</span>
        </button>
        {areas.map((area) => {
          const buildings = locations.filter((location) => location.areaId === area.areaId);
          const customers = buildings.reduce((sum, building) => sum + building.activeCustomers, 0);
          return (
            <button
              key={area.areaId}
              className={selectedAreaId === area.areaId ? "area-card active" : "area-card"}
              onClick={() => {
                onSelectArea(area.areaId);
                onSelectBuilding(null);
              }}
            >
              <strong>{area.areaName}</strong>
              <span>
                {buildings.length} buildings · {customers} customers
              </span>
            </button>
          );
        })}
      </div>
      <div className="building-grid">
        {visibleBuildings.map((building) => (
          <article className="panel building-card" key={building.buildingId}>
            <div>
              <small>{building.areaName}</small>
              <h3>{building.buildingName}</h3>
            </div>
            <div className="building-card-stats">
              <p>
                <span>Customers</span>
                <b>{building.activeCustomers}</b>
              </p>
              <p>
                <span>Expected</span>
                <b>{money(building.expectedRevenue)}</b>
              </p>
              <p>
                <span>Collected</span>
                <b>{money(building.collected)}</b>
              </p>
              <p>
                <span>Outstanding</span>
                <b>{money(building.outstanding)}</b>
              </p>
            </div>
            <button className="send-button" onClick={() => onSelectBuilding(building.buildingId)}>
              View building
            </button>
          </article>
        ))}
      </div>
      {selectedAreaId && (
        <button
          className="secondary location-add-building"
          onClick={() => onAddBuilding(selectedAreaId)}
        >
          + Add building to this area
        </button>
      )}
    </section>
  );
}
