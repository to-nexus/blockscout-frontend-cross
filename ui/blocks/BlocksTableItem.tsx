import { Tr, Td, Flex, Box, Tooltip, useColorModeValue } from '@chakra-ui/react';
import BigNumber from 'bignumber.js';
import { motion } from 'framer-motion';
import React from 'react';

import type { Block } from 'types/api/block';

import { route } from 'nextjs-routes';

import config from 'configs/app';
import getBlockTotalReward from 'lib/block/getBlockTotalReward';
import { WEI } from 'lib/consts';
import BlockGasUsed from 'ui/shared/block/BlockGasUsed';
import Skeleton from 'ui/shared/chakra/Skeleton';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';
import BlockEntity from 'ui/shared/entities/block/BlockEntity';
import IconSvg from 'ui/shared/IconSvg';
import LinkInternal from 'ui/shared/links/LinkInternal';
import TimeAgoWithTooltip from 'ui/shared/TimeAgoWithTooltip';
import Utilization from 'ui/shared/Utilization/Utilization';
import { COLUMN_WIDTHS, MIN_WIDTHS } from './BlocksTable';
import { getBaseFeeValue } from './utils';

interface Props {
  data: Block;
  isLoading?: boolean;
  enableTimeIncrement?: boolean;
}

const isRollup = config.features.rollup.isEnabled;

const BlocksTableItem = ({ data, isLoading, enableTimeIncrement }: Props) => {
  const totalReward = getBlockTotalReward(data);
  const burntFees = BigNumber(data.burnt_fees || 0);
  const txFees = BigNumber(data.transaction_fees || 0);

  const burntFeesIconColor = useColorModeValue('gray.500', 'inherit');

  const baseFeeValue = getBaseFeeValue(data.base_fee_per_gas);

  return (
    <Tr
      as={ motion.tr }
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transitionDuration="normal"
      transitionTimingFunction="linear"
      key={ data.height }
    >
      <Td fontSize="sm" width={["100%", null, COLUMN_WIDTHS.BLOCK]} minW={MIN_WIDTHS.BLOCK}>
        <Flex columnGap={ 2 } alignItems="center" mb={ 2 }>
          { data.celo?.is_epoch_block && (
            <Tooltip label={ `Finalized epoch #${ data.celo.epoch_number }` }>
              <IconSvg name="checkered_flag" boxSize={ 5 } p="1px" isLoading={ isLoading } flexShrink={ 0 }/>
            </Tooltip>
          ) }
          <Tooltip isDisabled={ data.type !== 'reorg' } label="Chain reorganizations">
            <BlockEntity
              isLoading={ isLoading }
              number={ data.height }
              hash={ data.type !== 'block' ? data.hash : undefined }
              noIcon
              fontSize="sm"
              lineHeight={ 5 }
              fontWeight={ 600 }
            />
          </Tooltip>
        </Flex>
        <TimeAgoWithTooltip
          timestamp={ data.timestamp }
          enableIncrement={ enableTimeIncrement }
          isLoading={ isLoading }
          color="text_secondary"
          fontWeight={ 400 }
          display="inline-block"
        />
      </Td>
      
      <Td fontSize="sm" width={["100%", null, COLUMN_WIDTHS.SIZE]} minW={MIN_WIDTHS.SIZE}>
        <Skeleton isLoaded={ !isLoading } display="inline-block">
          { data.size.toLocaleString() } bytes
        </Skeleton>
      </Td>

      { !config.UI.views.block.hiddenFields?.miner && (
        <Td fontSize="sm" width={["100%", null, COLUMN_WIDTHS.PROPOSER]} minW={MIN_WIDTHS.PROPOSER}>
          <AddressEntity
            address={ data.miner }
            isLoading={ isLoading }
            truncation="constant"
            maxW="min-content"
          />
        </Td>
      ) }

      { !config.UI.views.block.hiddenFields?.confirmed_validator_count && (
        <Td fontSize="sm" width={["100%", null, COLUMN_WIDTHS.CONFIRMED_VALIDATORS]} minW={MIN_WIDTHS.CONFIRMED_VALIDATORS} isNumeric>
          <Skeleton isLoaded={ !isLoading } display="inline-block">
            { data.confirmed_validator_count ?? 0 }
          </Skeleton>
        </Td>
      ) }

      <Td isNumeric fontSize="sm" width={["100%", null, COLUMN_WIDTHS.TXS]} minW={MIN_WIDTHS.TXS}>
        { data.transaction_count > 0 ? (
          <Skeleton isLoaded={ !isLoading } display="inline-block">
            <LinkInternal href={ route({
              pathname: '/block/[height_or_hash]',
              query: { height_or_hash: String(data.height), tab: 'txs' },
            }) }>
              { data.transaction_count }
            </LinkInternal>
          </Skeleton>
        ) : data.transaction_count }
      </Td>

      <Td fontSize="sm" width={["100%", null, COLUMN_WIDTHS.GAS_USED]} minW={MIN_WIDTHS.GAS_USED}>
        <Skeleton isLoaded={ !isLoading } display="inline-block">{ BigNumber(data.gas_used || 0).toFormat() }</Skeleton>
        <Flex mt={ 2 }>
          <BlockGasUsed
            gasUsed={ data.gas_used }
            gasLimit={ data.gas_limit }
            isLoading={ isLoading }
            gasTarget={ data.gas_target_percentage }
          />
        </Flex>
      </Td>

      { !isRollup && !config.UI.views.block.hiddenFields?.total_reward && (
        <Td fontSize="sm" width={["100%", null, COLUMN_WIDTHS.REWARD]} minW={MIN_WIDTHS.REWARD}>
          <Skeleton isLoaded={ !isLoading } display="inline-block">
            { totalReward.toFixed(8) }
          </Skeleton>
        </Td>
      ) }

      { !isRollup && !config.UI.views.block.hiddenFields?.burnt_fees && (
        <Td fontSize="sm" width={["100%", null, COLUMN_WIDTHS.BURNT_FEES]} minW={MIN_WIDTHS.BURNT_FEES}>
          <Flex alignItems="center" columnGap={ 2 }>
            <IconSvg name="flame" boxSize={ 5 } color={ burntFeesIconColor } isLoading={ isLoading }/>
            <Skeleton isLoaded={ !isLoading } display="inline-block">
              { burntFees.dividedBy(WEI).toFixed(8) }
            </Skeleton>
          </Flex>
          <Tooltip label={ isLoading ? undefined : 'Burnt fees / Txn fees * 100%' }>
            <Box w="min-content">
              <Utilization mt={ 2 } value={ burntFees.div(txFees).toNumber() } isLoading={ isLoading }/>
            </Box>
          </Tooltip>
        </Td>
      ) }

      { !isRollup && !config.UI.views.block.hiddenFields?.base_fee && Boolean(baseFeeValue) && (
        <Td fontSize="sm" width={["100%", null, COLUMN_WIDTHS.BASE_FEE]} minW={MIN_WIDTHS.BASE_FEE} isNumeric>
          <Skeleton isLoaded={ !isLoading } display="inline-block" whiteSpace="pre-wrap" wordBreak="break-word">
            { baseFeeValue }
          </Skeleton>
        </Td>
      ) }
    </Tr>
  );
};

export default React.memo(BlocksTableItem);
