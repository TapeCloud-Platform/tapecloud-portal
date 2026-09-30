export function SkeletonBlock({ className = '', style }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}

export function SkeletonStatsList({ rows = 3 }) {
  return (
    <ul className="user-menu__list">
      {Array.from({ length: rows }).map((_, index) => (
        <li key={index}>
          <SkeletonBlock className="skeleton--line" style={{ width: '60%' }} />
          <SkeletonBlock className="skeleton--line" style={{ width: '30%' }} />
        </li>
      ))}
    </ul>
  );
}
