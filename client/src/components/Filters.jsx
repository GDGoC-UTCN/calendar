import { Search, SlidersHorizontal, X } from 'lucide-react';
import { EVENT_STATUSES, EVENT_TYPES } from '../lib/constants.js';

export function Filters({ filters, onChange, onClear }) {
  return (
    <section className="filters-card">
      <div className="filters-title">
        <SlidersHorizontal size={18} />
        <span>Planner filters</span>
      </div>

      <label className="search-box">
        <Search size={18} />
        <input
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
          placeholder="Search title, description, location, notes..."
        />
      </label>

      <div className="select-row">
        <label>
          Type
          <select
            value={filters.type}
            onChange={(event) => onChange({ ...filters, type: event.target.value })}
          >
            {EVENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>

        <label>
          Status
          <select
            value={filters.status}
            onChange={(event) => onChange({ ...filters, status: event.target.value })}
          >
            {EVENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
      </div>

      <button className="ghost-button" onClick={onClear} type="button">
        <X size={16} />
        Clear filters
      </button>
    </section>
  );
}
