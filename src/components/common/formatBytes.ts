// This has been copied as is from firebase-tools
// https://github.com/FirebasePrivate/firebase-tools/blob/15a582cd2d92ad7477e9364a61bb17a98478fe8e/src/profileReport.js#L77
const formatNumber = function (num: number) {
  var parts = num.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (+parts[1] === 0) {
    return parts[0];
  }
  return parts.join('.');
};

export const formatBytes = function (bytes: number) {
  var threshold = 1000;
  if (Math.round(bytes) < threshold) {
    return bytes + ' B';
  }
  var units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  var u = -1;
  var formattedBytes = bytes;
  do {
    formattedBytes /= threshold;
    u++;
  } while (Math.abs(formattedBytes) >= threshold && u < units.length - 1);
  return formatNumber(formattedBytes) + ' ' + units[u];
};
