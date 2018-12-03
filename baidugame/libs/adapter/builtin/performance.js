/* eslint-disable */
import isDevtool from './util/isDevtool';

let performance

if (swan.getPerformance) {
  const wxPerf = swan.getPerformance()
  const initTime = wxPerf.now()

  const clientPerfAdapter = Object.assign({}, wxPerf, {
    now: function() {
      return (wxPerf.now() - initTime) / 1000
    }
  })

  performance = isDevtool() ? wxPerf : clientPerfAdapter
}

export default performance
