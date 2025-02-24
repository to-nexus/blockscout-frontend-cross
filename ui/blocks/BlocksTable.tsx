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

// 컬럼 너비 상수 정의
const COLUMN_WIDTHS = {
 BLOCK: '150px',
 SIZE: '100px',
 PROPOSER: '250px',
 CONFIRMED_VALIDATORS: '200px', 
 TXS: '80px',
 GAS_USED: '200px',
 REWARD: '150px',
 BURNT_FEES: '150px',
 BASE_FEE: '180px'
} as const;

const isRollup = config.features.rollup.isEnabled;

const BlocksTable = ({ data, isLoading, top, page, showSocketInfo, socketInfoNum, socketInfoAlert }: Props) => {
 return (
   <AddressHighlightProvider>
     <Table minWidth="1040px" fontWeight={ 500 }>
       <Thead top={ top }>
         <Tr>
           <Th width={ COLUMN_WIDTHS.BLOCK }>Block</Th>
           <Th width={ COLUMN_WIDTHS.SIZE }>Size, bytes</Th>
           { !config.UI.views.block.hiddenFields?.miner &&
             <Th width={ COLUMN_WIDTHS.PROPOSER }>{ capitalize(getNetworkValidatorTitle()) }</Th> 
           }
           { !config.UI.views.block.hiddenFields?.confirmed_validator_count &&
             <Th width={ COLUMN_WIDTHS.CONFIRMED_VALIDATORS }>Confirmed Validators</Th>
           }
           <Th width={ COLUMN_WIDTHS.TXS } isNumeric>Txs</Th>
           <Th width={ COLUMN_WIDTHS.GAS_USED }>Gas used</Th>
           { !isRollup && !config.UI.views.block.hiddenFields?.total_reward &&
             <Th width={ COLUMN_WIDTHS.REWARD }>Reward { currencyUnits.ether }</Th>
           }
           { !isRollup && !config.UI.views.block.hiddenFields?.burnt_fees &&
             <Th width={ COLUMN_WIDTHS.BURNT_FEES }>Burnt fees { currencyUnits.ether }</Th>
           }
           { !isRollup && !config.UI.views.block.hiddenFields?.base_fee &&
             <Th width={ COLUMN_WIDTHS.BASE_FEE } isNumeric>Base fee</Th>
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
               columnWidths={ COLUMN_WIDTHS }  // 컬럼 너비 props 추가
             />
           )) }
         </AnimatePresence>
       </Tbody>
     </Table>
   </AddressHighlightProvider>
 );
};

export default BlocksTable;