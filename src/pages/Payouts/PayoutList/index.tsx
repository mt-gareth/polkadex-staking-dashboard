// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { List, Header, Wrapper as ListWrapper } from 'library/List';
import { useApi } from 'contexts/Api';
import { StakingContext } from 'contexts/Staking';
import { useNetworkMetrics } from 'contexts/Network';
import { LIST_ITEMS_PER_PAGE, LIST_ITEMS_PER_BATCH } from 'consts';
import { clipAddress, planckToUnit } from 'Utils';
import { networkColors } from 'theme/default';
import { useTheme } from 'contexts/Themes';
import { AnySubscan } from 'types';
import { Pagination } from 'library/List/Pagination';
import { MotionContainer } from 'library/List/MotionContainer';
import { Identity } from 'library/ListItem/Labels/Identity';
import { useValidators } from 'contexts/Validators';
import { Validator } from 'contexts/Validators/types';
import { useBondedPools } from 'contexts/Pools/BondedPools';
import { PoolIdentity } from 'library/ListItem/Labels/PoolIdentity';
import { BondedPool } from 'contexts/Pools/types';
import { usePayoutList, PayoutListProvider } from './context';
import { ItemWrapper } from '../Wrappers';
import { PayoutListProps } from '../types';

export const PayoutListInner = (props: PayoutListProps) => {
  const { allowMoreCols, pagination } = props;

  const { mode } = useTheme();
  const { isReady, network } = useApi();
  const { units } = network;
  const { metrics } = useNetworkMetrics();
  const { listFormat, setListFormat } = usePayoutList();
  const { validators, meta } = useValidators();
  const { bondedPools } = useBondedPools();

  const disableThrottle = props.disableThrottle ?? false;

  // current page
  const [page, setPage] = useState<number>(1);

  // current render iteration
  const [renderIteration, _setRenderIteration] = useState<number>(1);

  // manipulated list (ordering, filtering) of payouts
  const [payouts, setPayouts] = useState(props.payouts);

  // is this the initial fetch
  const [fetched, setFetched] = useState<boolean>(false);

  // render throttle iteration
  const renderIterationRef = useRef(renderIteration);
  const setRenderIteration = (iter: number) => {
    renderIterationRef.current = iter;
    _setRenderIteration(iter);
  };

  // pagination
  const totalPages = Math.ceil(payouts.length / LIST_ITEMS_PER_PAGE);
  const pageEnd = page * LIST_ITEMS_PER_PAGE - 1;
  const pageStart = pageEnd - (LIST_ITEMS_PER_PAGE - 1);

  // render batch
  const batchEnd = renderIteration * LIST_ITEMS_PER_BATCH - 1;

  // refetch list when list changes
  useEffect(() => {
    setFetched(false);
  }, [props.payouts]);

  // configure list when network is ready to fetch
  useEffect(() => {
    if (isReady && metrics.activeEra.index !== 0 && !fetched) {
      setPayouts(props.payouts);
      setFetched(true);
    }
  }, [isReady, fetched, metrics.activeEra.index]);

  // render throttle
  useEffect(() => {
    if (!(batchEnd >= pageEnd || disableThrottle)) {
      setTimeout(() => {
        setRenderIteration(renderIterationRef.current + 1);
      }, 500);
    }
  }, [renderIterationRef.current]);

  // get list items to render
  let listPayouts = [];

  // get throttled subset or entire list
  if (!disableThrottle) {
    listPayouts = payouts.slice(pageStart).slice(0, LIST_ITEMS_PER_PAGE);
  } else {
    listPayouts = payouts;
  }

  if (!payouts.length) {
    return <></>;
  }

  // get validator metadata
  const batchKey = 'validators_browse';

  return (
    <ListWrapper>
      <Header>
        <div>
          <h4>{props.title}</h4>
        </div>
        <div>
          <button type="button" onClick={() => setListFormat('row')}>
            <FontAwesomeIcon
              icon={faBars}
              color={
                listFormat === 'row'
                  ? networkColors[`${network.name}-${mode}`]
                  : 'inherit'
              }
            />
          </button>
          <button type="button" onClick={() => setListFormat('col')}>
            <FontAwesomeIcon
              icon={faGripVertical}
              color={
                listFormat === 'col'
                  ? networkColors[`${network.name}-${mode}`]
                  : 'inherit'
              }
            />
          </button>
        </div>
      </Header>
      <List flexBasisLarge={allowMoreCols ? '33.33%' : '50%'}>
        {pagination && (
          <Pagination page={page} total={totalPages} setter={setPage} />
        )}
        <MotionContainer>
          {listPayouts.map((payout: AnySubscan, index: number) => {
            const {
              amount,
              block_timestamp,
              event_id,
              validator_stash,
              pool_id,
            } = payout;
            const label =
              event_id === 'PaidOut'
                ? 'Pool Claim'
                : event_id === 'Rewarded'
                ? 'Payout'
                : event_id;

            const labelClass =
              event_id === 'PaidOut'
                ? 'claim'
                : event_id === 'Rewarded'
                ? 'reward'
                : undefined;

            // get validator if it exists
            const validator = validators.find(
              (v: Validator) => v.address === validator_stash
            );

            // get pool if it exists
            const pool = bondedPools.find(
              (p: BondedPool) => String(p.id) === String(pool_id)
            );

            const batchIndex = validator
              ? validators.indexOf(validator)
              : pool
              ? bondedPools.indexOf(pool)
              : 0;

            return (
              <motion.div
                className={`item ${listFormat === 'row' ? 'row' : 'col'}`}
                key={`nomination_${index}`}
                variants={{
                  hidden: {
                    y: 15,
                    opacity: 0,
                  },
                  show: {
                    y: 0,
                    opacity: 1,
                  },
                }}
              >
                <ItemWrapper>
                  <div className="inner">
                    <div className="row">
                      <div>
                        <div>
                          <h4 className={`${labelClass}`}>
                            {event_id === 'Slashed' ? '-' : '+'}
                            {planckToUnit(amount, units)} {network.unit}
                          </h4>
                        </div>
                        <div>
                          <h5 className={`${labelClass}`}>{label}</h5>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div>
                        <div>
                          {label === 'Payout' && (
                            <>
                              {batchIndex > 0 ? (
                                <Identity
                                  meta={meta}
                                  address={validator_stash}
                                  batchIndex={batchIndex}
                                  batchKey={batchKey}
                                />
                              ) : (
                                <div>{clipAddress(validator_stash)}</div>
                              )}
                            </>
                          )}
                          {label === 'Pool Claim' && (
                            <>
                              {pool ? (
                                <PoolIdentity
                                  batchKey={batchKey}
                                  batchIndex={batchIndex}
                                  pool={pool}
                                />
                              ) : (
                                <h4>From Pool {pool_id}</h4>
                              )}
                            </>
                          )}
                          {label === 'Slashed' && <h4>Deducted from bond</h4>}
                        </div>
                        <div>
                          <h5>{moment.unix(block_timestamp).fromNow()}</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </ItemWrapper>
              </motion.div>
            );
          })}
        </MotionContainer>
      </List>
    </ListWrapper>
  );
};

export const PayoutList = (props: PayoutListProps) => {
  return (
    <PayoutListProvider>
      <PayoutListShouldUpdate {...props} />
    </PayoutListProvider>
  );
};

export class PayoutListShouldUpdate extends React.Component {
  static contextType = StakingContext;

  render() {
    return <PayoutListInner {...this.props} />;
  }
}

export default PayoutList;
