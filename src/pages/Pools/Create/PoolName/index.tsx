// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect } from 'react';
import { useConnect } from 'contexts/Connect';
import { useUi } from 'contexts/UI';
import { SetupStepProps } from 'library/SetupSteps/types';
import { SetupType } from 'contexts/UI/types';
import { Header } from 'library/SetupSteps/Header';
import { Footer } from 'library/SetupSteps/Footer';
import { MotionContainer } from 'library/SetupSteps/MotionContainer';
import { Input } from './Input';

export const PoolName = (props: SetupStepProps) => {
  const { section } = props;
  const { activeAccount } = useConnect();
  const { getSetupProgress, setActiveAccountSetup } = useUi();
  const setup = getSetupProgress(SetupType.Pool, activeAccount);

  const initialValue = setup.metadata;

  // store local pool name for form control
  const [metadata, setMetadata] = useState({
    metadata: initialValue,
  });

  // pool name valid
  const [valid, setValid] = useState<boolean>(initialValue !== '');

  // handler for updating bond
  const handleSetupUpdate = (value: any) => {
    setActiveAccountSetup(SetupType.Pool, value);
  };

  // update bond on account change
  useEffect(() => {
    setMetadata({
      metadata: initialValue,
    });
  }, [activeAccount]);

  // apply initial metadata to setup progress
  useEffect(() => {
    // only update if this section is currently active
    if (setup.section === section) {
      setActiveAccountSetup(SetupType.Pool, {
        ...setup,
        metadata: initialValue,
      });
    }
  }, [setup.section]);

  return (
    <>
      <Header
        thisSection={section}
        complete={setup.metadata !== ''}
        title="Pool Name"
        // helpKey="Bonding"
        setupType={SetupType.Pool}
      />
      <MotionContainer thisSection={section} activeSection={setup.section}>
        <Input
          listenIsValid={setValid}
          defaultValue={initialValue}
          setters={[
            {
              set: handleSetupUpdate,
              current: setup,
            },
            {
              set: setMetadata,
              current: metadata,
            },
          ]}
        />
        <Footer complete={valid} setupType={SetupType.Pool} />
      </MotionContainer>
    </>
  );
};
