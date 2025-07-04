export default function decodeURIComponentFilter(str) {
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
}
