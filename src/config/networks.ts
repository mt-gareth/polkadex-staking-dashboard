// Copyright 2022 @paritytech/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Networks } from "types";
import { ReactComponent as PolkadexLogoSVG } from "img/polkadex_logo.svg";
import { ReactComponent as PolkadexIconSVG } from "img/polkadex_icon.svg";

/*
 * Network Configuration
 */
export const NETWORKS: Networks = {
  polkadex: {
    name: "Polkadex",
    colors: {
      primary: {
        light: "rgb(103, 69, 210)",
        dark: "rgb(230, 0, 122)"
      },
      secondary: {
        light: "rgb(230, 0, 122)",
        dark: "rgb(103, 69, 210)"
      },
      transparent: {
        light: "rgb(230, 0, 122, 0.2)",
        dark: "rgb(230, 0, 122, 0.2)"
      }
    },
    endpoint: "wss://mainnet.polkadex.trade",
    subscanEndpoint: "https://polkadex.api.subscan.io",
    unit: "PDEX",
    units: 12,
    ss58: 0,
    icon: PolkadexIconSVG,
    logo: {
      svg: PolkadexLogoSVG,
      width: "8.5rem"
    },
    api: {
      unit: "PDEX",
      priceTicker: "PDEXUSDT"
    },
    features: {
      pools: false
    }
  }
};
