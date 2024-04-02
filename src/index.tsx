import React, { forwardRef } from 'react';
import Pages from './entry';

const MiniApp = forwardRef(({ dataSupper }: any) => {
  return (
    <Pages />
  );
});

export default MiniApp;