import { ReactNode, useEffect, useState } from 'react';
import React from 'react';
import { Redirect, useLocation, useRouteMatch } from 'react-router-dom';

/**
 * Given a list of collections or documents, auto select the first item. Only
 * works on root (`/firestore`) or top level collections (`/firestore/users`)
 * to prevent deep auto selection.
 */
export function useAutoSelect<T extends { id: string }>(list?: T[] | null) {
  const { url } = useRouteMatch()!;
  const { pathname } = useLocation();
  const [autoSelect, setAutoSelect] = useState<ReactNode | null>(null);

  useEffect(() => {
    const keys = url.split('/');
    const isRootOrRootCollection =
      keys.length === 2 ||
      // /firestore
      keys.length === 3; // /firestore/users
    const hasNothingSelected = url === pathname;
    const firstChild = list?.length ? list[0] : undefined;
    const shouldAutoSelect = isRootOrRootCollection && hasNothingSelected;

    setAutoSelect(
      shouldAutoSelect && firstChild ? (
        <Redirect to={`${url}/${firstChild.id}`} />
      ) : (
        undefined
      )
    );
  }, [pathname, url, list, setAutoSelect]);

  return autoSelect;
}
