// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState, useRef } from 'react';
import { useApi } from 'contexts/Api';
import { useConnect } from 'contexts/Connect';
import { useValidators } from 'contexts/Validators';
import { ValidatorList } from 'library/ValidatorList';
import { useModal } from 'contexts/Modal';
import { LargeItem } from 'library/Filter/LargeItem';
import {
  faHeart,
  faUserEdit,
  faChartPie,
  faCoins,
  faPlus,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { ValidatorFilterProvider } from 'library/Filter/context';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Wrapper } from 'pages/Overview/NetworkSats/Wrappers';
import { SelectableWrapper } from 'library/List';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  GenerateNominationsInnerProps,
  Nominations,
} from '../SetupSteps/types';
import { GenerateOptionsWrapper } from './Wrappers';
import { useFetchMehods } from './useFetchMethods';

export const GenerateNominationsInner = (
  props: GenerateNominationsInnerProps
) => {
  // functional props
  const setters = props.setters ?? [];
  const defaultNominations = props.nominations;
  const { batchKey } = props;

  const { openModalWith } = useModal();
  const { isReady, consts } = useApi();
  const { activeAccount, isReadOnlyAccount } = useConnect();
  const { removeValidatorMetaBatch, validators, meta } = useValidators();
  const {
    fetch: fetchFromMethod,
    add: addNomination,
    available: availableToNominate,
  } = useFetchMehods();
  const { maxNominations } = consts;

  let { favouritesList } = useValidators();
  if (favouritesList === null) {
    favouritesList = [];
  }
  // store the method of fetching validators
  const [method, setMethod] = useState<string | null>(
    defaultNominations.length ? 'Manual' : null
  );

  // store whether validators are being fetched
  const [fetching, setFetching] = useState<boolean>(false);

  // store the currently selected set of nominations
  const [nominations, setNominations] = useState(defaultNominations);

  // store the height of the container
  const [height, setHeight] = useState<number | null>(null);

  // ref for the height of the container
  const heightRef = useRef<HTMLDivElement>(null);

  const rawBatchKey = 'validators_browse';

  // update selected value on account switch
  useEffect(() => {
    removeValidatorMetaBatch(batchKey);
    setNominations([...defaultNominations]);
  }, [activeAccount, defaultNominations]);

  // refetch if fetching is triggered
  useEffect(() => {
    if (!isReady || !validators.length) {
      return;
    }

    // wait for validator meta data to be fetched
    const batch = meta[rawBatchKey];
    if (batch === undefined) {
      return;
    }
    if (batch.stake === undefined) {
      return;
    }

    if (fetching) {
      fetchNominationsForMethod();
    }
  });

  // reset fixed height on window size change
  useEffect(() => {
    window.addEventListener('resize', resizeCallback);
    return () => {
      window.removeEventListener('resize', resizeCallback);
    };
  }, []);

  const resizeCallback = () => {
    setHeight(null);
  };

  // fetch nominations based on method
  const fetchNominationsForMethod = () => {
    if (method) {
      const _nominations = fetchFromMethod(method);
      // update component state
      setNominations([..._nominations]);
      setFetching(false);
      updateSetters(_nominations);
    }
  };

  // add nominations based on method
  const addNominationByType = (type: string) => {
    if (method) {
      const _nominations = addNomination(nominations, type);
      removeValidatorMetaBatch(batchKey);
      setNominations([..._nominations]);
      updateSetters([..._nominations]);
    }
  };

  const updateSetters = (_nominations: Nominations) => {
    for (const s of setters) {
      const { current, set } = s;
      const callable = current?.callable ?? false;
      let _current;

      if (!callable) {
        _current = current;
      } else {
        _current = current.fn();
      }
      const _set = {
        ..._current,
        nominations: _nominations,
      };
      set(_set);
    }
  };

  // callback function for adding nominations
  const cbAddNominations = ({ setSelectActive }: any) => {
    setSelectActive(false);

    const updateList = (_nominations: Nominations) => {
      removeValidatorMetaBatch(batchKey);
      setNominations([..._nominations]);
      updateSetters(_nominations);
    };
    openModalWith(
      'SelectFavourites',
      {
        nominations,
        callback: updateList,
      },
      'xl'
    );
  };

  // function for clearing nomination list
  const clearNominations = () => {
    setMethod(null);
    removeValidatorMetaBatch(batchKey);
    setNominations([]);
    updateSetters([]);
  };

  // callback function for removing selected validators
  const cbRemoveSelected = ({
    selected,
    resetSelected,
    setSelectActive,
  }: any) => {
    removeValidatorMetaBatch(batchKey);
    const _nominations = [...nominations].filter((n: any) => {
      return !selected.map((_s: any) => _s.address).includes(n.address);
    });
    setNominations([..._nominations]);
    updateSetters([..._nominations]);
    setSelectActive(false);
    resetSelected();
  };

  const disabledMaxNominations = () => {
    return nominations.length >= maxNominations;
  };
  const disabledAddFavourites = () => {
    return !favouritesList?.length || nominations.length >= maxNominations;
  };

  // accumulate generation methods
  const methods = [
    {
      title: 'Optimal Selection',
      subtitle: 'Selects a mix of majority active and inactive validators.',
      icon: faChartPie as IconProp,
      onClick: () => {
        setMethod('Optimal Selection');
        removeValidatorMetaBatch(batchKey);
        setNominations([]);
        setFetching(true);
      },
    },
    {
      title: 'Active Low Commission',
      subtitle: 'Gets a set of active validators with low commission.',
      icon: faCoins as IconProp,
      onClick: () => {
        setMethod('Active Low Commission');
        removeValidatorMetaBatch(batchKey);
        setNominations([]);
        setFetching(true);
      },
    },
    {
      title: 'From Favourites',
      subtitle: 'Gets a set of your favourite validators.',
      icon: faHeart as IconProp,
      onClick: () => {
        setMethod('From Favourites');
        removeValidatorMetaBatch(batchKey);
        setNominations([]);
        setFetching(true);
      },
    },
    {
      title: 'Manual Selection',
      subtitle: 'Add validators from scratch.',
      icon: faUserEdit as IconProp,
      onClick: () => {
        setMethod('Manual');
        removeValidatorMetaBatch(batchKey);
        setNominations([]);
      },
    },
  ];

  // accumulate actions
  const actions = [
    {
      title: 'Add From Favourites',
      onClick: cbAddNominations,
      onSelected: false,
      isDisabled: disabledAddFavourites,
    },
    {
      title: `Remove Selected`,
      onClick: cbRemoveSelected,
      onSelected: true,
      isDisabled: () => false,
    },
    {
      title: 'Parachain Validator',
      onClick: () => addNominationByType('Parachain Validator'),
      onSelected: false,
      icon: faPlus,
      isDisabled: () =>
        disabledMaxNominations() ||
        !availableToNominate(nominations).parachainValidators.length,
    },
    {
      title: 'Active Validator',
      onClick: () => addNominationByType('Active Validator'),
      onSelected: false,
      icon: faPlus,
      isDisabled: () =>
        disabledMaxNominations() ||
        !availableToNominate(nominations).activeValidators.length,
    },
    {
      title: 'Random Validator',
      onClick: () => addNominationByType('Random Validator'),
      onSelected: false,
      icon: faPlus,
      isDisabled: () =>
        disabledMaxNominations() ||
        !availableToNominate(nominations).randomValidators.length,
    },
  ];

  return (
    <>
      {method && (
        <SelectableWrapper>
          <button type="button" onClick={() => clearNominations()}>
            <FontAwesomeIcon icon={faTimes as IconProp} />
            {method}
          </button>

          {['Active Low Commission', 'Optimal Selection'].includes(
            method || ''
          ) && (
            <button
              type="button"
              onClick={() => {
                // set a temporary height to prevent height snapping on re-renders.
                setHeight(heightRef?.current?.clientHeight || null);
                setTimeout(() => setHeight(null), 200);
                removeValidatorMetaBatch(batchKey);
                setFetching(true);
              }}
            >
              Re-Generate
            </button>
          )}
        </SelectableWrapper>
      )}
      <Wrapper
        style={{
          height: height ? `${height}px` : 'auto',
          marginTop: method ? '1rem' : 0,
        }}
      >
        <div>
          {!isReadOnlyAccount(activeAccount) && !method && (
            <>
              <GenerateOptionsWrapper>
                {methods.map((m: any, n: number) => (
                  <LargeItem
                    key={`gen_method_${n}`}
                    title={m.title}
                    subtitle={m.subtitle}
                    icon={m.icon}
                    transform="grow-2"
                    active={false}
                    onClick={m.onClick}
                  />
                ))}
              </GenerateOptionsWrapper>
            </>
          )}
        </div>

        {fetching ? (
          <></>
        ) : (
          <>
            {isReady && method !== null && (
              <div
                ref={heightRef}
                style={{
                  width: '100%',
                }}
              >
                <ValidatorList
                  bondType="stake"
                  validators={nominations}
                  batchKey={batchKey}
                  selectable
                  actions={actions}
                  allowMoreCols
                  allowListFormat={false}
                />
              </div>
            )}
          </>
        )}
      </Wrapper>
    </>
  );
};

export const GenerateNominations = (props: GenerateNominationsInnerProps) => {
  return (
    <ValidatorFilterProvider>
      <GenerateNominationsInner {...props} />
    </ValidatorFilterProvider>
  );
};

export default GenerateNominations;
