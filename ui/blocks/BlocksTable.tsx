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

// 컬럼 너비 상수
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

// 최소 너비 상수
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

const isRollup = config.features.rollup.isEnabled;

const BlocksTable = ({ data, isLoading, top, page, showSocketInfo, socketInfoNum, socketInfoAlert }: Props) => {
 return (
   <AddressHighlightProvider>
     <Table w="100%" minWidth="1040px" fontWeight={ 500 }>
       <Thead top={ top }>
         <Tr>
           <Th width={ COLUMN_WIDTHS.BLOCK } minW={ MIN_WIDTHS.BLOCK }>Block</Th>
           <Th width={ COLUMN_WIDTHS.SIZE } minW={ MIN_WIDTHS.SIZE }>Size, bytes</Th>
           { !config.UI.views.block.hiddenFields?.miner &&
             <Th width={ COLUMN_WIDTHS.PROPOSER } minW={ MIN_WIDTHS.PROPOSER }>
               { capitalize(getNetworkValidatorTitle()) }
             </Th>
           }
           { !config.UI.views.block.hiddenFields?.confirmed_validator_count &&
             <Th width={ COLUMN_WIDTHS.CONFIRMED_VALIDATORS } minW={ MIN_WIDTHS.CONFIRMED_VALIDATORS }>
               Confirmed Validators
             </Th>
           }
           <Th width={ COLUMN_WIDTHS.TXS } minW={ MIN_WIDTHS.TXS } isNumeric>Txs</Th>
           <Th width={ COLUMN_WIDTHS.GAS_USED } minW={ MIN_WIDTHS.GAS_USED }>Gas used</Th>
           { !isRollup && !config.UI.views.block.hiddenFields?.total_reward &&
             <Th width={ COLUMN_WIDTHS.REWARD } minW={ MIN_WIDTHS.REWARD }>
               Reward { currencyUnits.ether }
             </Th>
           }
           { !isRollup && !config.UI.views.block.hiddenFields?.burnt_fees &&
             <Th width={ COLUMN_WIDTHS.BURNT_FEES } minW={ MIN_WIDTHS.BURNT_FEES }>
               Burnt fees { currencyUnits.ether }
             </Th>
           }
           { !isRollup && !config.UI.views.block.hiddenFields?.base_fee &&
             <Th width={ COLUMN_WIDTHS.BASE_FEE } minW={ MIN_WIDTHS.BASE_FEE } isNumeric>
               Base fee
             </Th>
           }
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
