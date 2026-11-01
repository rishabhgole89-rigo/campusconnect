export function SkillBadge({ skill, size = 'sm' }) {
  const classes = size === 'xs'
    ? 'px-2 py-0.5 text-xs'
    : 'px-2.5 py-0.5 text-xs';
  return (
    <span className={`inline-flex items-center ${classes} rounded-full font-medium bg-blue-100 text-blue-800`}>
      {skill}
    </span>
  );
}

export function InterestBadge({ interest }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
      {interest}
    </span>
  );
}

export function YearBadge({ year }) {
  const labels = { 1: '1st Year', 2: '2nd Year', 3: '3rd Year', 4: '4th Year', 5: '5th Year' };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
      {labels[year] || `Year ${year}`}
    </span>
  );
}

export function TypeBadge({ type }) {
  const styles = {
    hackathon: 'bg-orange-100 text-orange-800',
    project: 'bg-blue-100 text-blue-800',
    research: 'bg-purple-100 text-purple-800',
    internship: 'bg-green-100 text-green-800',
    other: 'bg-gray-100 text-gray-800'
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[type] || styles.other}`}>
      {type}
    </span>
  );
}
