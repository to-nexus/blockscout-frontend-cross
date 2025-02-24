typescriptCopy// BlocksTable.tsx

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

// BlocksListItem.tsx

import { Flex, Text, Box, Tooltip } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import capitalize from 'lodash/capitalize';
import React from 'react';
import type { Block } from 'types/api/block';
import { route } from 'nextjs-routes';
import config from 'configs/app';
import getBlockTotalReward from 'lib/block/getBlockTotalReward';
import { WEI } from 'lib/consts';
import getNetworkValidatorTitle from 'lib/networks/getNetworkValidatorTitle';
import { currencyUnits } from 'lib/units';
import BlockGasUsed from 'ui/shared/block/BlockGasUsed';
import Skeleton from 'ui/shared/chakra/Skeleton';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import BlockEntity from 'ui/shared/entities/block/BlockEntity';
import IconSvg from 'ui/shared/IconSvg';
import LinkInternal from 'ui/shared/links/LinkInternal';
import ListItemMobile from 'ui/shared/ListItemMobile/ListItemMobile';
import TimeAgoWithTooltip from 'ui/shared/TimeAgoWithTooltip';
import Utilization from 'ui/shared/Utilization/Utilization';
import { getBaseFeeValue } from './utils';
import { COLUMN_WIDTHS, MIN_WIDTHS } from './BlocksTable';

interface Props {
 data: Block;
 isLoading?: boolean;
 enableTimeIncrement?: boolean;
}

const isRollup = config.features.rollup.isEnabled;

const BlocksListItem = ({ data, isLoading, enableTimeIncrement }: Props) => {
 const totalReward = getBlockTotalReward(data);
 const burntFees = BigNumber(data.burnt_fees || 0);
 const txFees = BigNumber(data.transaction_fees || 0);
 const baseFeeValue = getBaseFeeValue(data.base_fee_per_gas);

 return (
   <ListItemMobile rowGap={ 3 } key={ String(data.height) } isAnimated>
     <Flex w="100%" flexWrap="wrap" gap={ 4 }>
       <Flex justifyContent="space-between" w="100%">
         <Flex columnGap={ 2 } alignItems="center" width={["100%", null, COLUMN_WIDTHS.BLOCK]} minW={MIN_WIDTHS.BLOCK}>
           <BlockEntity
             isLoading={ isLoading }
             number={ data.height }
             hash={ data.type !== 'block' ? data.hash : undefined }
             noIcon
             fontWeight={ 600 }
           />
           { data.celo?.is_epoch_block && (
             <Tooltip label={ `Finalized epoch #${ data.celo.epoch_number }` }>
               <IconSvg name="checkered_flag" boxSize={ 5 } p="1px" isLoading={ isLoading } flexShrink={ 0 }/>
             </Tooltip>
           ) }
         </Flex>
         <TimeAgoWithTooltip
           timestamp={ data.timestamp }
           enableIncrement={ enableTimeIncrement }
           isLoading={ isLoading }
           color="text_secondary"
           fontWeight={ 400 }
           display="inline-block"
         />
       </Flex>

       <Flex columnGap={ 2 } width={["100%", null, COLUMN_WIDTHS.SIZE]} minW={MIN_WIDTHS.SIZE}>
         <Text fontWeight={ 500 }>Size</Text>
         <Skeleton isLoaded={ !isLoading } display="inline-block" color="text_secondary">
           <span>{ data.size.toLocaleString() } bytes</span>
         </Skeleton>
       </Flex>

       { !config.UI.views.block.hiddenFields?.miner && (
         <Flex columnGap={ 2 } width={["100%", null, COLUMN_WIDTHS.PROPOSER]} minW={MIN_WIDTHS.PROPOSER}>
           <Text fontWeight={ 500 }>{ capitalize(getNetworkValidatorTitle()) }</Text>
           <AddressEntity
             address={ data.miner }
             isLoading={ isLoading }
             truncation="constant"
           />
         </Flex>
       ) }

       { !config.UI.views.block.hiddenFields?.confirmed_validator_count && data.confirmed_validator_count !== undefined && (
         <Flex columnGap={ 2 } width={["100%", null, COLUMN_WIDTHS.CONFIRMED_VALIDATORS]} minW={MIN_WIDTHS.CONFIRMED_VALIDATORS}>
           <Text fontWeight={ 500 }>Confirmed Validators</Text>
           <Skeleton isLoaded={ !isLoading } display="inline-block" color="text_secondary">
             <span>{ data.confirmed_validator_count }</span>
           </Skeleton>
         </Flex>
       ) }

       <Flex columnGap={ 2 } width={["100%", null, COLUMN_WIDTHS.TXS]} minW={MIN_WIDTHS.TXS} justifyContent="flex-end">
         <Text fontWeight={ 500 }>Txs</Text>
         { data.transaction_count > 0 ? (
           <Skeleton isLoaded={ !isLoading } display="inline-block">
             <LinkInternal href={ route({ pathname: '/block/[height_or_hash]', query: { height_or_hash: String(data.height), tab: 'txs' } }) }>
               { data.transaction_count }
             </LinkInternal>
           </Skeleton>
         ) :
           <Text variant="secondary">{ data.transaction_count }</Text>
         }
       </Flex>

       <Box width={["100%", null, COLUMN_WIDTHS.GAS_USED]} minW={MIN_WIDTHS.GAS_USED}>
         <Text fontWeight={ 500 }>Gas used</Text>
         <Flex mt={ 2 } alignItems="center">
           <Skeleton isLoaded={ !isLoading } display="inline-block" color="text_secondary" mr={ 4 }>
             <span>{ BigNumber(data.gas_used || 0).toFormat() }</span>
           </Skeleton>
           <BlockGasUsed
             gasUsed={ data.gas_used }
             gasLimit={ data.gas_limit }
             isLoading={ isLoading }
             gasTarget={ data.gas_target_percentage }
           />
         </Flex>
       </Box>

       { !isRollup && !config.UI.views.block.hiddenFields?.total_reward && (
         <Flex columnGap={ 2 } width={["100%", null, COLUMN_WIDTHS.REWARD]} minW={MIN_WIDTHS.REWARD}>
           <Text fontWeight={ 500 }>Reward { currencyUnits.ether }</Text>
           <Skeleton isLoaded={ !isLoading } display="inline-block" color="text_secondary">
             <span>{ totalReward.toFixed() }</span>
           </Skeleton>
         </Flex>
       ) }

       { !isRollup && !config.UI.views.block.hiddenFields?.burnt_fees && (
         <Box width={["100%", null, COLUMN_WIDTHS.BURNT_FEES]} minW={MIN_WIDTHS.BURNT_FEES}>
           <Text fontWeight={ 500 }>Burnt fees</Text>
           <Flex columnGap={ 4 } mt={ 2 }>
             <Flex>
               <IconSvg name="flame" boxSize={ 5 } color="gray.500" isLoading={ isLoading }/>
               <Skeleton isLoaded={ !isLoading } display="inline-block" color="text_secondary" ml={ 2 }>
                 <span>{ burntFees.div(WEI).toFixed() }</span>
               </Skeleton>
             </Flex>
             <Utilization ml={ 4 } value={ burntFees.div(txFees).toNumber() } isLoading={ isLoading }/>
           </Flex>
         </Box>
       ) }

       { !isRollup && !config.UI.views.block.hiddenFields?.base_fee && baseFeeValue && (
         <Flex columnGap={ 2 } width={["100%", null, COLUMN_WIDTHS.BASE_FEE]} minW={MIN_WIDTHS.BASE_FEE} justifyContent="flex-end">
           <Text fontWeight={ 500 }>Base fee</Text>
           <Skeleton isLoaded={ !isLoading } display="inline-block" color="text_secondary">
             <span>{ baseFeeValue }</span>
           </Skeleton>BlocksListItem
         </Flex>
       ) }
     </Flex>
   </ListItemMobile>
 );
};

export default BlocksListItem;