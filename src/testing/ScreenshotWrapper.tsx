import '/src/index.scss'; // load global css

import React from 'react';

export const ScreenshotWrapper: React.FC<React.PropsWithChildren<{}>> = (
  props
) => <div>{props.children}</div>;
