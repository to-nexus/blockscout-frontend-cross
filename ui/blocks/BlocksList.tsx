import { Box } from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';
import React from 'react';
import type { Block } from 'types/api/block';
import BlocksListItem from 'ui/blocks/BlocksListItem';
import { COLUMN_WIDTHS, MIN_WIDTHS, calculateColumnWidths, calculateMinWidths } from './BlocksTable';
import config from 'configs/app';

interface Props {
  data: Array<Block>;
  isLoading: boolean;
  page: number;
}

const BlocksList = ({ data, isLoading, page }: Props) => {
  // 동적으로 컬럼 너비 계산
  const dynamicColumnWidths = calculateColumnWidths();
  const dynamicMinWidths = calculateMinWidths();

  return (
    <Box
      w="100%"
      minW={ dynamicMinWidths.BLOCK }  // 동적 최소 너비 설정
      px={ 4 }  // 좌우 패딩 추가
    >
      <AnimatePresence initial={ false }>
        { data.map((item, index) => (
          <BlocksListItem
            key={ item.height + (isLoading ? String(index) : '') }
            data={ item }
            isLoading={ isLoading }
            enableTimeIncrement={ page === 1 && !isLoading }
            columnWidths={ dynamicColumnWidths }  // 동적 컬럼 너비 전달
          />
        )) }
      </AnimatePresence>
    </Box>
  );
};

export default BlocksList;