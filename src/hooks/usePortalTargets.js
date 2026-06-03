import { useLayoutEffect, useState } from 'react';

/** Resolve DOM mount points for React portals after the HTML shell renders. */
export function usePortalTargets(ids) {
  const [targets, setTargets] = useState({});

  useLayoutEffect(() => {
    const next = {};
    ids.forEach((id) => {
      next[id] = document.getElementById(id);
    });
    setTargets(next);
  }, [ids.join('|')]);

  return targets;
}
