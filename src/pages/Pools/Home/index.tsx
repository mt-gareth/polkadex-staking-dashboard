// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from 'react';
import {
  PageRowWrapper,
  RowPrimaryWrapper,
  RowSecondaryWrapper,
} from 'Wrappers';
import { CardWrapper } from 'library/Graphs/Wrappers';
import { PageTitle } from 'library/PageTitle';
import { StatBoxList } from 'library/StatBoxList';
import { PoolList } from 'library/PoolList';
import { useActivePool } from 'contexts/Pools/ActivePool';
import { useBondedPools } from 'contexts/Pools/BondedPools';
import {
  SECTION_FULL_WIDTH_THRESHOLD,
  SIDE_MENU_STICKY_THRESHOLD,
} from 'consts';
import { usePoolMemberships } from 'contexts/Pools/PoolMemberships';
import ActivePoolsStatBox from './Stats/ActivePools';
import MinJoinBondStatBox from './Stats/MinJoinBond';
import PoolMembershipBox from './Stats/PoolMembership';
import MinCreateBondStatBox from './Stats/MinCreateBond';
import { Status } from './Status';
import { ManageBond } from './ManageBond';
import { ManagePool } from './ManagePool';
import { Roles } from '../Roles';
import { PoolsTabsProvider, usePoolsTabs } from './context';
import { Favourites } from './Favourites';
import { Members } from './Members';
import { ClosurePrompts } from './ClosurePrompts';
import { PoolStats } from './PoolStats';

export const HomeInner = () => {
  const { membership } = usePoolMemberships();
  const { bondedPools } = useBondedPools();
  const { getPoolRoles, activeBondedPool } = useActivePool();
  const { activeTab, setActiveTab } = usePoolsTabs();

  // back to tab 0 if not in a pool
  useEffect(() => {
    if (!activeBondedPool) {
      setActiveTab(0);
    }
  }, [activeBondedPool]);

  const ROW_HEIGHT = 275;

  let tabs = [
    {
      title: 'Overview',
      active: activeTab === 0,
      onClick: () => setActiveTab(0),
    },
  ];

  if (activeBondedPool) {
    tabs = tabs.concat({
      title: 'Members',
      active: activeTab === 1,
      onClick: () => setActiveTab(1),
    });
  }

  tabs = tabs.concat(
    {
      title: 'All Pools',
      active: activeTab === 2,
      onClick: () => setActiveTab(2),
    },
    {
      title: 'Favourites',
      active: activeTab === 3,
      onClick: () => setActiveTab(3),
    }
  );

  return (
    <>
      <PageTitle title="Pools" tabs={tabs} />
      {activeTab === 0 && (
        <>
          <StatBoxList>
            <ActivePoolsStatBox />
            <MinJoinBondStatBox />
            <MinCreateBondStatBox />
          </StatBoxList>

          <ClosurePrompts />

          <PageRowWrapper className="page-padding" noVerticalSpacer>
            <RowPrimaryWrapper
              hOrder={1}
              vOrder={0}
              thresholdStickyMenu={SIDE_MENU_STICKY_THRESHOLD}
              thresholdFullWidth={SECTION_FULL_WIDTH_THRESHOLD}
            >
              <Status height={ROW_HEIGHT} />
            </RowPrimaryWrapper>
            <RowSecondaryWrapper
              hOrder={0}
              vOrder={1}
              thresholdStickyMenu={SIDE_MENU_STICKY_THRESHOLD}
              thresholdFullWidth={SECTION_FULL_WIDTH_THRESHOLD}
            >
              <CardWrapper height={ROW_HEIGHT}>
                <ManageBond />
              </CardWrapper>
            </RowSecondaryWrapper>
          </PageRowWrapper>
          {membership !== null && (
            <>
              <ManagePool />
              <PageRowWrapper className="page-padding" noVerticalSpacer>
                <CardWrapper>
                  <Roles
                    batchKey="pool_roles_manage"
                    defaultRoles={getPoolRoles()}
                  />
                </CardWrapper>
              </PageRowWrapper>
              <PageRowWrapper className="page-padding" noVerticalSpacer>
                <PoolStats />
              </PageRowWrapper>
            </>
          )}
        </>
      )}
      {activeTab === 1 && <Members />}
      {activeTab === 2 && (
        <>
          <StatBoxList>
            <PoolMembershipBox />
            <ActivePoolsStatBox />
            <MinJoinBondStatBox />
          </StatBoxList>
          <PageRowWrapper className="page-padding" noVerticalSpacer>
            <CardWrapper>
              <PoolList
                batchKey="bonded_pools"
                pools={bondedPools}
                title="Active Pools"
                allowMoreCols
                allowSearch
                pagination
              />
            </CardWrapper>
          </PageRowWrapper>
        </>
      )}
      {activeTab === 3 && (
        <>
          <Favourites />
        </>
      )}
    </>
  );
};

export const Home = () => {
  return (
    <PoolsTabsProvider>
      <HomeInner />
    </PoolsTabsProvider>
  );
};

export default Home;
