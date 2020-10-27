import { Button } from '@rmwc/button';
import { Card } from '@rmwc/card';
import { Typography } from '@rmwc/typography';
import React, { useState } from 'react';
import { connect } from 'react-redux';

import { createStructuredSelector } from '../../../store';
import { getAllowDuplicateEmails } from '../../../store/auth/selectors';
import styles from './OneAccountPerEmailCard.module.scss';
import OneAccountPerEmailDialog from './OneAccountPerEmailDialog';

export type OneAccountPerEmailCardProps = PropsFromStore;
export const OneAccountPerEmailCard: React.FC<OneAccountPerEmailCardProps> = ({
  allowDuplicateEmails,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className={styles.wrapper}>
        {allowDuplicateEmails ? (
          <div>
            <Typography
              use="headline6"
              tag="div"
              theme="textPrimaryOnBackground"
            >
              Multiple accounts per email address
            </Typography>
            <Typography use="body2" theme="textPrimaryOnBackground">
              Allowing users to create multiple accounts for authentication
              providers that use the same email address.{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://support.google.com/firebase/answer/6400716"
              >
                Learn more
              </a>
            </Typography>
          </div>
        ) : (
          <div>
            <Typography
              use="headline6"
              tag="div"
              theme="textPrimaryOnBackground"
            >
              One account per email address
            </Typography>
            <Typography use="body2" theme="textPrimaryOnBackground">
              Preventing users from creating multiple accounts using the same
              email address with different authentication providers.
            </Typography>
          </div>
        )}

        <div>
          <Button outlined={true} onClick={() => setOpen(true)}>
            Change
          </Button>
        </div>
      </Card>
      {open && <OneAccountPerEmailDialog onClose={() => setOpen(false)} />}
    </>
  );
};
export const mapStateToProps = createStructuredSelector({
  allowDuplicateEmails: getAllowDuplicateEmails,
});

export type PropsFromStore = ReturnType<typeof mapStateToProps>;
export default connect(mapStateToProps)(OneAccountPerEmailCard);
