import { TRS_MODULE_LABEL } from '../../trs/roleConfig';

export function FzContextBar({ sectionLabel = TRS_MODULE_LABEL }: { sectionLabel?: string }) {
  return (
    <div className="fz-subheader">
      <p className="fz-subheader__breadcrumb">{sectionLabel}</p>
      <div className="fz-subheader__filters">
        <label className="fz-subheader__field">
          <span className="fz-subheader__label">City</span>
          <select className="fz-subheader__select" defaultValue="reno">
            <option value="reno">Reno</option>
            <option value="london">London</option>
            <option value="nyc">New York</option>
          </select>
        </label>
        <label className="fz-subheader__field fz-subheader__field--wide">
          <span className="fz-subheader__label">Event search</span>
          <input
            className="fz-subheader__input"
            type="text"
            defaultValue="Burning Man 2027"
            readOnly
          />
        </label>
        <label className="fz-subheader__field">
          <span className="fz-subheader__label">Venue</span>
          <select className="fz-subheader__select" defaultValue="brc">
            <option value="brc">Black Rock City</option>
            <option value="fabrik">Fabrik</option>
          </select>
        </label>
        <button type="button" className="fz-subheader__show">
          Show
        </button>
      </div>
    </div>
  );
}
