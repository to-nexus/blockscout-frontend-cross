import { Table, Tbody, Tr, Th } from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';
import capitalize from 'lodash/capitalize';
import React from 'react';
import type { Block } from 'types/api/block';
import config from 'configs/app';
import { AddressHighlightProvider } from 'lib/contexts/addressHighlight';
import getNetworkValidatorTitle from 'lib/networks/getNetworkValidatorTitle';
import { currencyUnits } from 'lib/units';
import BlocksTableItem from 'ui/blocks/BlocksTableItem';
import * as SocketNewItemsNotice from 'ui/shared/SocketNewItemsNotice';
import { default as Thead } from 'ui/shared/TheadSticky';

interface Props {
  data: Array<Block>;
  isLoading?: boolean;
  top: number;
  page: number;
  socketInfoNum?: number;
  socketInfoAlert?: string;
  showSocketInfo?: boolean;
}

export const COLUMN_WIDTHS = {
  BLOCK: '10%',
  SIZE: '8%',
  PROPOSER: '20%',
  CONFIRMED_VALIDATORS: '15%', 
  TXS: '7%',
  GAS_USED: '15%',
  REWARD: '10%',
  BURNT_FEES: '10%',
  BASE_FEE: '10%'
} as const;

export const MIN_WIDTHS = {
  BLOCK: '100px',
  SIZE: '80px',
  PROPOSER: '160px',
  CONFIRMED_VALIDATORS: '140px',
  TXS: '50px',
  GAS_USED: '120px',
  REWARD: '100px',
  BURNT_FEES: '100px',
  BASE_FEE: '100px'
} as const;

export function calculateColumnWidths() {
  const hiddenFields = Object.entries(config.UI.views.block.hiddenFields || {})
    .filter(([_, isHidden]) => isHidden)
    .map(([field]) => {
      switch(field) {
        case 'total_reward': return 'REWARD';
        case 'burnt_fees': return 'BURNT_FEES';
        case 'miner': return 'PROPOSER';
        case 'confirmed_validator_count': return 'CONFIRMED_VALIDATORS';
        case 'base_fee': return 'BASE_FEE';
        default: return null;
      }
    })
    .filter(Boolean) as Array<keyof typeof COLUMN_WIDTHS>;

  const totalHiddenWidth = hiddenFields.reduce((sum, field) => 
    sum + parseFloat(COLUMN_WIDTHS[field]), 0);
  
  const remainingColumns = (Object.keys(COLUMN_WIDTHS) as Array<keyof typeof COLUMN_WIDTHS>)
    .filter(key => !hiddenFields.includes(key));

  const additionalWidthPerColumn = totalHiddenWidth / remainingColumns.length;

  const newWidths = { ...COLUMN_WIDTHS };
  remainingColumns.forEach(column => {
    const currentWidth = parseFloat(newWidths[column]);
    (newWidths as Record<keyof typeof COLUMN_WIDTHS, string>)[column] = 
      `${currentWidth + additionalWidthPerColumn}%`;
  });

  return newWidths;
}

export function calculateMinWidths() {
  const hiddenFields = Object.entries(config.UI.views.block.hiddenFields || {})
    .filter(([_, isHidden]) => isHidden)
    .map(([field]) => {
      switch(field) {
        case 'total_reward': return 'REWARD';
        case 'burnt_fees': return 'BURNT_FEES';
        case 'miner': return 'PROPOSER';
        case 'confirmed_validator_count': return 'CONFIRMED_VALIDATORS';
        case 'base_fee': return 'BASE_FEE';
        default: return null;
      }
    })
    .filter(Boolean) as Array<keyof typeof MIN_WIDTHS>;

  const totalHiddenWidth = hiddenFields.reduce((sum, field) => 
    sum + parseInt(MIN_WIDTHS[field].replace('px', '')), 0);
  
  const remainingColumns = (Object.keys(MIN_WIDTHS) as Array<keyof typeof MIN_WIDTHS>)
    .filter(key => !hiddenFields.includes(key));

  const additionalWidthPerColumn = Math.floor(totalHiddenWidth / remainingColumns.length);

  const newWidths = { ...MIN_WIDTHS };
  remainingColumns.forEach(column => {
    const currentWidth = parseInt(newWidths[column]);
    (newWidths as Record<keyof typeof MIN_WIDTHS, string>)[column] = 
      `${currentWidth + additionalWidthPerColumn}px`;
  });

  return newWidths;
}

const isRollup = config.features.rollup.isEnabled;

const BlocksTable = ({ data, isLoading, top, page, showSocketInfo, socketInfoNum, socketInfoAlert }: Props) => {
  // 동적으로 컬럼 너비 계산
  const dynamicColumnWidths = calculateColumnWidths();
  const dynamicMinWidths = calculateMinWidths();

  return (
    <AddressHighlightProvider>
      <Table w="100%" minWidth="1040px" fontWeight={ 500 }>
        <Thead top={ top }>
          <Tr>
            (
              <Th width={ dynamicColumnWidths.BLOCK } minW={ dynamicMinWidths.BLOCK }>Block</Th>
            )
            (
              <Th width={ dynamicColumnWidths.SIZE } minW={ dynamicMinWidths.SIZE }>Size, bytes</Th>
            )
            (
              <Th width={ dynamicColumnWidths.PROPOSER } minW={ dynamicMinWidths.PROPOSER }>
                { capitalize(getNetworkValidatorTitle()) }
              </Th>
            )
            {!config.UI.views.block.hiddenFields?.confirmed_validator_count && (
              <Th width={ dynamicColumnWidths.CONFIRMED_VALIDATORS } minW={ dynamicMinWidths.CONFIRMED_VALIDATORS }>
                Confirmed Validators
              </Th>
            )}
            (
              <Th width={ dynamicColumnWidths.TXS } minW={ dynamicMinWidths.TXS } isNumeric>Txs</Th>
            )
            (
              <Th width={ dynamicColumnWidths.GAS_USED } minW={ dynamicMinWidths.GAS_USED }>Gas used</Th>
            )
            {!isRollup && !config.UI.views.block.hiddenFields?.total_reward && (
              <Th width={ dynamicColumnWidths.REWARD } minW={ dynamicMinWidths.REWARD }>
                Reward { currencyUnits.ether }
              </Th>
            )}
            {!isRollup && !config.UI.views.block.hiddenFields?.burnt_fees && (
              <Th width={ dynamicColumnWidths.BURNT_FEES } minW={ dynamicMinWidths.BURNT_FEES }>
                Burnt fees { currencyUnits.ether }
              </Th>
            )}
            (
              <Th width={ dynamicColumnWidths.BASE_FEE } minW={ dynamicMinWidths.BASE_FEE } isNumeric>
                Base fee
              </Th>
            )
          </Tr>
        </Thead>
        <Tbody>
          { showSocketInfo && (
            <SocketNewItemsNotice.Desktop
              url={ window.location.href }
              alert={ socketInfoAlert }
              num={ socketInfoNum }
              type="block"
              isLoading={ isLoading }
            />
          ) }
          <AnimatePresence initial={ false }>
            { data.map((item, index) => (
              <BlocksTableItem
                key={ item.height + (isLoading ? `${ index }_${ page }` : '') }
                data={ item }
                enableTimeIncrement={ page === 1 && !isLoading }
                isLoading={ isLoading }
              />
            )) }
          </AnimatePresence>
        </Tbody>
      </Table>
    </AddressHighlightProvider>
  );
};

export default BlocksTable;