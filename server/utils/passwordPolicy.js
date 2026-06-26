export const passwordPolicyMessage = '密码需为 8-20 位，且必须包含字母和数字，不能包含空格';

export function validatePasswordPolicy(password) {
  if (typeof password !== 'string') return false;
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\S]{8,20}$/.test(password) && !/\s/.test(password);
}
