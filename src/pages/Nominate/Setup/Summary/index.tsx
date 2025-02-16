// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { useApi } from 'contexts/Api';
import { useUi } from 'contexts/UI';
import { useConnect } from 'contexts/Connect';
import { Button } from 'library/Button';
import { humanNumber } from 'Utils';
import { useSubmitExtrinsic } from 'library/Hooks/useSubmitExtrinsic';
import { Warning } from 'library/Form/Warning';
import { SetupStepProps } from 'library/SetupSteps/types';
import { SetupType } from 'contexts/UI/types';
import { Header } from 'library/SetupSteps/Header';
import { MotionContainer } from 'library/SetupSteps/MotionContainer';
import { defaultStakeSetup } from 'contexts/UI/defaults';
import { EstimatedTxFee } from 'library/EstimatedTxFee';
import { useTxFees } from 'contexts/TxFees';
import { SummaryWrapper } from './Wrapper';

export const Summary = (props: SetupStepProps) => {
  const { section } = props;

  const { api, network } = useApi();
  const { units } = network;
  const { activeAccount, accountHasSigner } = useConnect();
  const { getSetupProgress, setActiveAccountSetup } = useUi();
  const { txFeesValid } = useTxFees();

  const setup = getSetupProgress(SetupType.Stake, activeAccount);

  const { controller, bond, nominations, payee } = setup;

  const txs = () => {
    if (!activeAccount || !api) {
      return null;
    }
    const stashToSubmit = {
      Id: activeAccount,
    };
    const bondToSubmit = bond * 10 ** units;
    const targetsToSubmit = nominations.map((item: any) => {
      return {
        Id: item.address,
      };
    });
    const controllerToSubmit = {
      Id: controller,
    };

    // construct a batch of transactions
    const _txs = [
      api.tx.staking.bond(stashToSubmit, bondToSubmit, payee),
      api.tx.staking.nominate(targetsToSubmit),
      api.tx.staking.setController(controllerToSubmit),
    ];
    return api.tx.utility.batch(_txs);
  };

  const { submitTx, submitting } = useSubmitExtrinsic({
    tx: txs(),
    from: activeAccount,
    shouldSubmit: true,
    callbackSubmit: () => {},
    callbackInBlock: () => {
      // reset localStorage setup progress
      setActiveAccountSetup(SetupType.Stake, defaultStakeSetup);
    },
  });

  return (
    <>
      <Header
        thisSection={section}
        complete={null}
        title="Summary"
        setupType={SetupType.Stake}
      />
      <MotionContainer thisSection={section} activeSection={setup.section}>
        {!accountHasSigner(activeAccount) && (
          <Warning text="Your account is read only, and cannot sign transactions." />
        )}
        <SummaryWrapper>
          <section>
            <div>
              <FontAwesomeIcon
                icon={faCheckCircle as IconProp}
                transform="grow-1"
              />{' '}
              &nbsp; Controller:
            </div>
            <div>{controller}</div>
          </section>
          <section>
            <div>
              <FontAwesomeIcon
                icon={faCheckCircle as IconProp}
                transform="grow-1"
              />{' '}
              &nbsp; Reward Destination:
            </div>
            <div>{payee}</div>
          </section>
          <section>
            <div>
              <FontAwesomeIcon
                icon={faCheckCircle as IconProp}
                transform="grow-1"
              />{' '}
              &nbsp; Nominations:
            </div>
            <div>{nominations.length}</div>
          </section>
          <section>
            <div>
              <FontAwesomeIcon
                icon={faCheckCircle as IconProp}
                transform="grow-1"
              />{' '}
              &nbsp; Bond Amount:
            </div>
            <div>
              {humanNumber(bond)} {network.unit}
            </div>
          </section>
          <section>
            <EstimatedTxFee format="table" />
          </section>
        </SummaryWrapper>
        <div
          style={{
            flex: 1,
            flexDirection: 'row',
            width: '100%',
            display: 'flex',
            justifyContent: 'end',
          }}
        >
          <Button
            onClick={() => submitTx()}
            disabled={
              submitting || !accountHasSigner(activeAccount) || !txFeesValid
            }
            title="Start Nominating"
            primary
          />
        </div>
      </MotionContainer>
    </>
  );
};

export default Summary;
