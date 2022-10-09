// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Wrapper as StatWrapper } from 'library/Stat/Wrapper';
import { usePoolMemberships } from 'contexts/Pools/PoolMemberships';
import { Identicon } from 'library/Identicon';
import { useActivePool } from 'contexts/Pools/ActivePool';
import { useBondedPools } from 'contexts/Pools/BondedPools';
import { determinePoolDisplay } from 'Utils';
import Button from 'library/Button';
import { faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useConnect } from 'contexts/Connect';
import { useModal } from 'contexts/Modal';
import { useApi } from 'contexts/Api';
import { useTransferOptions } from 'contexts/TransferOptions';
import OpenHelpIcon from 'library/OpenHelpIcon';
import { Wrapper } from './Wrapper';

export const Membership = ({ label }: { label: string }) => {
  const { isReady } = useApi();
  const { activeAccount, isReadOnlyAccount } = useConnect();
  const { openModalWith } = useModal();
  const { membership } = usePoolMemberships();
  const { bondedPools, meta } = useBondedPools();
  const { activeBondedPool, isOwner } = useActivePool();
  const { getTransferOptions } = useTransferOptions();

  const { active } = getTransferOptions(activeAccount).pool;

  const inPool = membership !== null && activeBondedPool !== null;

  let display = 'Not in Pool';
  if (membership && activeBondedPool) {
    const pool = bondedPools.find((p: any) => {
      return p.addresses.stash === activeBondedPool.addresses.stash;
    });

    if (pool) {
      const metadata = meta.bonded_pools?.metadata ?? [];
      const batchIndex = bondedPools.indexOf(pool);
      display = determinePoolDisplay(membership.address, metadata[batchIndex]);
    }
  }

  const button = isOwner() ? (
    <Button
      primary
      inline
      title="Manage"
      icon={faCog}
      small
      disabled={!isReady || isReadOnlyAccount(activeAccount)}
      onClick={() => openModalWith('ManagePool', {}, 'small')}
    />
  ) : active?.gtn(0) ? (
    <Button
      primary
      inline
      title="Leave"
      icon={faSignOutAlt}
      small
      disabled={!isReady || isReadOnlyAccount(activeAccount)}
      onClick={() => openModalWith('LeavePool', { bondType: 'pool' }, 'small')}
    />
  ) : null;

  return (
    <StatWrapper>
      <h4>
        {label} <OpenHelpIcon helpKey="Pool Membership" />
      </h4>
      <Wrapper paddingLeft={inPool} paddingRight={button !== null}>
        <h2 className="hide-with-padding">
          <div className="icon">
            <Identicon value={membership?.address ?? ''} size={30} />
          </div>
          {display}
          {button && <div className="btn">{button}</div>}
        </h2>
      </Wrapper>
    </StatWrapper>
  );
};
