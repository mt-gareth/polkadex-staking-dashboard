// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useApi } from '../../contexts/Api';
import { useUi } from '../../contexts/UI';
import { useBalances } from '../../contexts/Balances';
import { useConnect } from '../../contexts/Connect';
import { planckToUnit, fiatAmount, humanNumber } from '../../Utils';
import { useSize, formatSize } from '../../library/Graphs/Utils';
import { defaultThemes } from '../../theme/default';
import { useTheme } from '../../contexts/Themes';
import { usePrices } from '../../library/Hooks/usePrices';

ChartJS.register(ArcElement, Tooltip, Legend);

export const BalanceGraph = () => {
  const { mode } = useTheme();
  const { network }: any = useApi();
  const { units } = network;
  const { activeAccount }: any = useConnect();
  const { getAccountBalance, getBondOptions }: any = useBalances();
  const balance = getAccountBalance(activeAccount);
  const { services } = useUi();
  const prices = usePrices();
  const { freeToStake, freeToUnbond: staked }: any =
    getBondOptions(activeAccount) || {};

  let { free } = balance;
  const { miscFrozen } = balance;

  // get user's total free balance
  const freeBase = planckToUnit(free.toNumber(), units);
  // convert balance to fiat value
  const freeBalance = fiatAmount(freeBase * prices.lastPrice);

  // convert to currency unit
  free = planckToUnit(free.toNumber(), units);

  // graph data
  let graphStaked = staked;
  let graphFreeToStake = freeToStake;

  let zeroBalance = false;
  if (graphStaked === 0 && graphFreeToStake === 0) {
    graphStaked = -1;
    graphFreeToStake = -1;
    zeroBalance = true;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    spacing: zeroBalance ? 0 : 5,
    plugins: {
      legend: {
        display: true,
        padding: {
          right: 10,
        },
        position: 'left' as const,
        align: 'center' as const,
        labels: {
          padding: 20,
          color: defaultThemes.text.primary[mode],
          font: {
            size: 15,
            weight: '500',
          },
        },
      },
      tooltip: {
        displayColors: false,
        backgroundColor: defaultThemes.graphs.tooltip[mode],
        bodyColor: defaultThemes.text.invert[mode],
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${
              context.parsed === -1 ? 0 : context.parsed
            } ${network.unit}`;
          },
        },
      },
    },
    cutout: '75%',
  };

  const data = {
    labels: ['Available', 'Staking'],
    datasets: [
      {
        label: network.unit,
        data: [graphFreeToStake, graphStaked],
        backgroundColor: [
          defaultThemes.graphs.colors[2][mode],
          zeroBalance
            ? defaultThemes.graphs.inactive[mode]
            : defaultThemes.graphs.colors[0][mode],
        ],
        borderWidth: 0,
      },
    ],
  };

  const ref: any = React.useRef();
  const size = useSize(ref.current);
  const { width, height, minHeight } = formatSize(size, 252);

  return (
    <>
      <div className="head" style={{ paddingTop: '0.5rem' }}>
        <h4>Balance</h4>
        <h2>
          <span className="amount">{freeBase}</span>&nbsp;{network.unit}
          <span className="fiat">
            {services.includes('binance_spot') && (
              <>&nbsp;${humanNumber(freeBalance)}</>
            )}
          </span>
        </h2>
      </div>
      <div style={{ paddingTop: '20px' }} />
      <div className="inner" ref={ref} style={{ minHeight }}>
        <div
          className="graph"
          style={{
            height: `${height}px`,
            width: `${width}px`,
            position: 'absolute',
          }}
        >
          <Doughnut options={options} data={data} />
        </div>
      </div>
      <div style={{ paddingTop: '25px' }} />
    </>
  );
};

export default BalanceGraph;
