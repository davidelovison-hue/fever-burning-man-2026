import { Link } from 'react-router-dom';

export function PageTitle({
  title,
  section,
  sectionLink,
  subsection,
}: {
  title: string;
  section?: string;
  sectionLink?: string;
  subsection?: string;
}) {
  return (
    <div className="fz-page-head">
      {(section || subsection) && (
        <nav className="fz-page-head__breadcrumb" aria-label="Breadcrumb">
          {section && sectionLink ? (
            <Link to={sectionLink}>{section}</Link>
          ) : section ? (
            <span>{section}</span>
          ) : null}
          {subsection && (
            <>
              <span className="fz-page-head__sep">/</span>
              <span>{subsection}</span>
            </>
          )}
        </nav>
      )}
      <h1 className="fz-page-title">{title}</h1>
    </div>
  );
}

export function EventFilterBar({ summary }: { summary: string }) {
  return (
    <>
      <div className="fz-events-bar">
        <label className="fz-field">
          <span className="fz-field__label">Department</span>
          <select className="fz-input fz-select" defaultValue="placement">
            <option value="placement">Placement</option>
            <option value="dmv">DMV</option>
            <option value="art">Art Department</option>
          </select>
        </label>
        <label className="fz-field">
          <span className="fz-field__label">Program</span>
          <select className="fz-input fz-select" defaultValue="theme-camps">
            <option value="theme-camps">Theme camps</option>
          </select>
        </label>
        <button type="button" className="fz-btn-primary">Show</button>
      </div>
      <p className="fz-filter-summary">{summary}</p>
    </>
  );
}

export function TrsShell() {
  return null;
}
