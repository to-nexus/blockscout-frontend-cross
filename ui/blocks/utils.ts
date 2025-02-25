import getValueWithUnit from 'lib/getValueWithUnit';
import { currencyUnits } from 'lib/units';

// 기존 코드 : 
// 기본 수수료 값이 0.0001 Gwei 이상으로 충분히 큰 경우 → Gwei 단위로 표시
// 기본 수수료 값이 매우 작은 경우 → Wei 단위로 표시

// 변경 코드 : 
// 모든 단위 Gwei로 표시 
export const getBaseFeeValue = (baseFee: string | null) => {
  if (!baseFee) {
    return null;
  }
  // 항상 Gwei 단위로 변환
  const valGwei = getValueWithUnit(baseFee, 'gwei');
  
  // 원래 wei 값이 매우 작을 경우 (0.0001 Gwei 미만)
  if (valGwei.isLessThan(0.0001)) {
    const weiValue = getValueWithUnit(baseFee, 'wei').toFormat();
    
    // 후행 0을 제거하는 방식으로 포맷팅
    const formattedValue = valGwei.toNumber().toString();
    
    return `${formattedValue} ${currencyUnits.gwei} (${weiValue} ${currencyUnits.wei})`;
  }
  
  // 일반적인 경우 Gwei만 표시
  return `${valGwei.toFormat(6)} ${currencyUnits.gwei}`;
};

// export const getBaseFeeValue = (baseFee: string | null) => {
//   if (!baseFee) {
//     return null;
//   }
//   const valGwei = getValueWithUnit(baseFee, 'gwei');
//   if (valGwei.isGreaterThanOrEqualTo(0.0001)) {
//     return `${ valGwei.toFormat(4) } ${ currencyUnits.gwei }`;
//   }
//   return `${ getValueWithUnit(baseFee, 'wei').toFormat() } ${ currencyUnits.wei }`;
// };

export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
