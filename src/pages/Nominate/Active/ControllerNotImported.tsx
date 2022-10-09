// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CardWrapper, CardHeaderWrapper } from 'library/Graphs/Wrappers';
import { Button } from 'library/Button';
import { useBalances } from 'contexts/Balances';
import { useConnect } from 'contexts/Connect';
import { useStaking } from 'contexts/Staking';
import { PageRowWrapper } from 'Wrappers';
import { useModal } from 'contexts/Modal';
import { useUi } from 'contexts/UI';
import { useTheme } from 'contexts/Themes';
import { defaultThemes } from 'theme/default';

export const ControllerNotImported = () => {
  const { openModalWith } = useModal();
  const { isSyncing } = useUi();
  const { mode } = useTheme();
  const { getControllerNotImported } = useStaking();
  const { activeAccount, isReadOnlyAccount } = useConnect();
  const { getBondedAccount } = useBalances();
  const controller = getBondedAccount(activeAccount);

  return (
    <>
      {getControllerNotImported(controller) &&
        !isSyncing &&
        !isReadOnlyAccount(activeAccount) && (
          <PageRowWrapper className="page-padding" noVerticalSpacer>
            <CardWrapper
              style={{
                border: `1px solid ${defaultThemes.status.warning.transparent[mode]}`,
              }}
            >
              <CardHeaderWrapper>
                <h4>
                  You have not imported your controller account. If you have
                  lost access to your controller account, set a new one now.
                  Otherwise, import the controller into one of your active
                  extensions.
                </h4>
              </CardHeaderWrapper>
              <Button
                small
                primary
                inline
                title="Set New Controller"
                onClick={() => openModalWith('UpdateController', {}, 'large')}
              />
            </CardWrapper>
          </PageRowWrapper>
        )}
    </>
  );
};
