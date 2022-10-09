// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Number } from 'library/StatBoxList/Number';
import { planckBnToUnit } from 'Utils';
import { useApi } from 'contexts/Api';
import { usePoolsConfig } from 'contexts/Pools/PoolsConfig';

const MinCreateBondStatBox = () => {
  const { network } = useApi();
  const { units } = network;
  const { stats } = usePoolsConfig();

  const params = {
    label: 'Minimum Create Bond',
    value: planckBnToUnit(stats.minCreateBond, units),
    unit: network.unit,
    helpKey: 'Minimum Create Bond',
  };
  return <Number {...params} />;
};

export default MinCreateBondStatBox;
