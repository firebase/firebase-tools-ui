import { Button } from '@rmwc/button';
import { Card } from '@rmwc/card';
import { Typography } from '@rmwc/typography';
import React, { useState } from 'react';

import styles from './OneAccountPerEmailCard.module.scss';
import OneAccountPerEmailDialog from './OneAccountPerEmailDialog';

export const OneAccountPerEmailCard: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Card className={styles.wrapper}>
        <div>
          <Typography use="body1" tag="div">
            One account per email address
          </Typography>
          <Typography use="body2">
            Preventing users from creating multiple accounts using the same
            email address with different authentication providers.
          </Typography>
        </div>

        <div>
          <Button onClick={() => setOpen(true)}>Change</Button>
        </div>
      </Card>
      {open && <OneAccountPerEmailDialog onClose={() => setOpen(false)} />}
    </>
  );
};
