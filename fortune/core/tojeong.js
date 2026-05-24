// tojeong.js
// 토정비결(土亭祕訣) 144괘 계산
//
// 전통 방식:
//   상괘(上卦) = (만나이 + 음력 년간지 수) 합 ÷ 8 의 나머지 (0→8)
//   중괘(中卦) = (음력 월수 + 월 큰달/작은달) ÷ 6 의 나머지 (0→6)
//   하괘(下卦) = (음력 일수 + 일진 수) ÷ 3 의 나머지 (0→3)
//
// 간단 버전 (대중적): 한 해 사주의 흐름을 144괘로 보는 운세
//
// 참고: 정통 토정비결은 음력 기반 + 24절기·간지수 보정이 필수.
// 본 구현은 대중판 단순 알고리즘 사용 (음력 입력 가정).

export function calculateTojeong({lunarYear, lunarMonth, lunarDay, isLeapMonth = false, age}) {
  // 정통 방식 근사: 나이 + 년지수, 월 + 월수, 일 + 일진
  // 여기선 단순화: 년/월/일 자체로 모듈러 계산
  const sang = ((age + lunarYear) % 8) || 8;        // 1~8
  let jungBase = lunarMonth + (isLeapMonth ? 1 : 0);
  const jung = (jungBase % 6) || 6;                  // 1~6
  const ha = (lunarDay % 3) || 3;                    // 1~3
  const key = `${sang}${jung}${ha}`;
  return { sang, jung, ha, key, hexNumber: parseInt(key, 10) };
}

// 144괘 lookup (tojeong144.json 로드 후 사용)
export function lookupTojeong(result, tojeongData) {
  const direct = tojeongData.samples.find(s => s.key === result.key);
  if (direct) return direct;
  // sample이 없으면 sang/jung으로 가장 가까운 것 찾기
  const sameSang = tojeongData.samples.filter(s => s.key.startsWith(String(result.sang)));
  if (sameSang.length > 0) return sameSang[0];
  return tojeongData.general.fallback;
}
