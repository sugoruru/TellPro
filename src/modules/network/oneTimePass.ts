// one time pass module
const oneTimePass = new Set<string>();
const oneTimeTimeout = new Map<string, number>();

export const addOneTimePass = (pass: string) => {
  oneTimePass.add(pass);
  oneTimeTimeout.set(pass, new Date().getTime());
}

export const checkOneTimePass = (pass: string) => {
  if (oneTimePass.has(pass)) {
    const currentTime = new Date().getTime();
    const passTime = oneTimeTimeout.get(pass);
    if (!passTime) return false;
    oneTimeTimeout.delete(pass);
    oneTimePass.delete(pass);
    if (currentTime - passTime > 1000 * 60 * 10) {
      return false;
    }
    return true;
  }
  return false;
}

export const deleteOneTimePass = () => {
  const currentTime = new Date().getTime();
  oneTimeTimeout.forEach((time, pass) => {
    if (currentTime - time > 1000 * 60 * 10) {
      oneTimeTimeout.delete(pass);
      oneTimePass.delete(pass);
    }
  });
}

export default { oneTimePass, oneTimeTimeout };