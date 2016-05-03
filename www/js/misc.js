/**
 * Created by Martina on 03.05.16.
 */


function KommaPunkt(value) {
  var text = value.toFixed(2).toString().replace(".",",");
  return text;
}
