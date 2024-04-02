// URLからの画像をBase64に変換.
async function getImageBase64(url: string) {
  const response = await fetch(url);
  const contentType = response.headers.get("content-type");
  const arrayBuffer = await response.arrayBuffer();
  let base64String = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(arrayBuffer))));
  return `data:${contentType};base64,${base64String}`;
}

export default getImageBase64;