// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useApi } from 'contexts/Api';
import {
  humanNumber,
  planckBnToUnit,
  rmCommas,
  toFixedIfNecessary,
} from 'Utils';
import { ValidatorStatusWrapper } from 'library/ListItem/Wrappers';
import BN from 'bn.js';

export const PoolMemberBonded = (props: any) => {
  const { meta, batchKey, batchIndex, who } = props;
  const { network } = useApi();
  const { units, unit } = network;

  const poolMembers = meta[batchKey]?.poolMembers ?? [];
  const poolMember = poolMembers[batchIndex] ?? null;

  let bonded = 0;
  let status = '';
  let totalUnbonding = 0;
  if (poolMember) {
    const { points, unbondingEras } = poolMember;

    bonded = planckBnToUnit(new BN(rmCommas(points)), units);
    status = bonded > 0 ? 'active' : 'inactive';

    // converting unbonding eras from points to units
    let totalUnbondingBase: BN = new BN(0);
    Object.values(unbondingEras).forEach((amount: any) => {
      const amountBn: BN = new BN(rmCommas(amount));
      totalUnbondingBase = totalUnbondingBase.add(amountBn);
    });
    totalUnbonding = planckBnToUnit(new BN(totalUnbondingBase), network.units);
  }

  return (
    <>
      {!poolMember ? (
        <ValidatorStatusWrapper status="inactive">
          <h5>Syncing...</h5>
        </ValidatorStatusWrapper>
      ) : (
        <>
          {bonded > 0 && (
            <ValidatorStatusWrapper status={status}>
              <h5>
                Bonded: {humanNumber(toFixedIfNecessary(bonded, 3))} {unit}
              </h5>
            </ValidatorStatusWrapper>
          )}
        </>
      )}

      {poolMember && totalUnbonding > 0 && (
        <ValidatorStatusWrapper status="inactive">
          <h5>
            Unbonding {humanNumber(toFixedIfNecessary(totalUnbonding, 3))}{' '}
            {unit}
          </h5>
        </ValidatorStatusWrapper>
      )}
    </>
  );
};
