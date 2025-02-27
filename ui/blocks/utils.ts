import getValueWithUnit from 'lib/getValueWithUnit';
import { currencyUnits } from 'lib/units';
import BigNumber from 'bignumber.js';

export const getBaseFeeValue = (baseFee: string | null) => {
  if (!baseFee) {
    return null;
  }
  
  const valGwei = getValueWithUnit(baseFee, 'gwei');
  const weiValue = getValueWithUnit(baseFee, 'wei');
  
  // Gwei의 정수 부분만 표시
  const integerGwei = valGwei.integerValue(BigNumber.ROUND_DOWN);
  
  // 소수점 이하의 Gwei 값이 있는 경우 (절삭된 부분이 있는 경우)
  if (!valGwei.isEqualTo(integerGwei)) {
    return `${integerGwei.toFormat(0)} ${currencyUnits.gwei} (${weiValue.toFormat()} ${currencyUnits.wei})`;
  }
  
  // 소수점 이하가 없는 경우는 그냥 Gwei만 표시
  return `${integerGwei.toFormat(0)} ${currencyUnits.gwei}`;
};

export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};