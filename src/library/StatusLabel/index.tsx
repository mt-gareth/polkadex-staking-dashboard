// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useUi } from 'contexts/UI';
import { useStaking } from 'contexts/Staking';
import { usePoolMemberships } from 'contexts/Pools/PoolMemberships';
import { Wrapper } from './Wrapper';
import { StatusLabelProps } from './types';

export const StatusLabel = (props: StatusLabelProps) => {
  const status = props.status ?? 'sync_or_setup';

  const { isSyncing, services } = useUi();
  const { inSetup } = useStaking();
  const { membership } = usePoolMemberships();

  if (status === 'sync_or_setup') {
    if (isSyncing || !inSetup() || membership !== null) {
      return <></>;
    }
  }

  if (status === 'active_service') {
    if (services.includes(props.statusFor || '')) {
      return <></>;
    }
  }

  const { title } = props;
  const topOffset = props.topOffset ?? '40%';

  return (
    <Wrapper topOffset={topOffset}>
      <div>
        <FontAwesomeIcon icon={faExclamationTriangle} />
        <h2>
          &nbsp;&nbsp;
          {title}
        </h2>
      </div>
    </Wrapper>
  );
};

export default StatusLabel;
