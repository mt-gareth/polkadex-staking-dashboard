// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import BN from 'bn.js';
import { OpenHelpIcon } from 'library/OpenHelpIcon';
import { useNetworkMetrics } from 'contexts/Network';
import { useStaking } from 'contexts/Staking';
import useInflation from 'library/Hooks/useInflation';
import { toFixedIfNecessary } from 'Utils';
import { InflationWrapper } from './Wrappers';

export const Inflation = () => {
  const { metrics } = useNetworkMetrics();
  const { staking } = useStaking();
  const { inflation, stakedReturn, idealStake } = useInflation();

  const { lastTotalStake } = staking;
  const { totalIssuance } = metrics;

  // total supply as percent
  let supplyAsPercent = 0;
  if (totalIssuance.gt(new BN(0))) {
    supplyAsPercent = lastTotalStake
      .div(totalIssuance.div(new BN(100)))
      .toNumber();
  }

  return (
    <InflationWrapper>
      <section>
        <div className="items">
          <div>
            <div className="inner">
              <h2>
                {totalIssuance.toString() === '0'
                  ? '0'
                  : toFixedIfNecessary(stakedReturn, 2)}
                %
              </h2>
              <h4>
                Historical Rewards Rate{' '}
                <OpenHelpIcon helpKey="Historical Rewards Rate" />
              </h4>
            </div>
          </div>
          <div>
            <div className="inner">
              <h2>
                {totalIssuance.toString() === '0'
                  ? '0'
                  : toFixedIfNecessary(inflation, 2)}
                %
              </h2>
              <h4>
                Inflation <OpenHelpIcon helpKey="Inflation" />
              </h4>
            </div>
          </div>
          <div>
            <div className="inner">
              <h2>{supplyAsPercent}%</h2>
              <h4>
                Supply Staked <OpenHelpIcon helpKey="Supply Staked" />
              </h4>
            </div>
          </div>
        </div>
      </section>
    </InflationWrapper>
  );
};
