import { Card } from '@rmwc/card';
import React, { useState } from 'react';

import AddUserDialog from '../UserFormDialog/AddUserDialog';
import { AuthHeader } from './header/AuthHeader';
import UsersTable from './table/UsersTable';

export const UsersCard: React.FC = () => {
  const [showInputUserDialog, setShowInputUserDialog] = useState(false);

  return (
    <Card className="Auth-panels-wrapper">
      <AuthHeader onOpenNewUserDialog={() => setShowInputUserDialog(true)} />

      <UsersTable />

      {showInputUserDialog && (
        <AddUserDialog onClose={() => setShowInputUserDialog(false)} />
      )}
    </Card>
  );
};

export default UsersCard;
