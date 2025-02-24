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
 data: Block;  // Block[]에서 다시 Block으로 변경
 isLoading?: boolean;
 enableTimeIncrement?: boolean;
 columnWidths: typeof COLUMN_WIDTHS;  // 컬럼 너비 prop 추가
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
        {/* && data.confirmed_validator_count !== undefined */}
       { !config.UI.views.block.hiddenFields?.confirmed_validator_count && (
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
           </Skeleton>
         </Flex>
       ) }
     </Flex>
   </ListItemMobile>
 );
};

export default BlocksListItem;