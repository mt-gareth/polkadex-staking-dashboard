// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useApi } from 'contexts/Api';
import { useStaking } from 'contexts/Staking';
import { Number } from 'library/StatBoxList/Number';

export const MinimumActiveBondStatBox = () => {
  const { network } = useApi();
  const { eraStakers } = useStaking();
  const { minActiveBond } = eraStakers;

  const params = {
    label: 'Minimum Active Bond',
    value: minActiveBond,
    unit: network.unit,
    helpKey: 'Bonding',
  };

  return <Number {...params} />;
};

export default MinimumActiveBondStatBox;
