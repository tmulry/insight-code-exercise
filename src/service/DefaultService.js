const _ = require('lodash')
const utils = require('../utils/writer.js')
const log = require('loglevel')
log.setLevel(process.env.LOGLEVEL || log.levels.TRACE)

/**
 * Alive check
 *
 * no response value expected for this operation
 **/
exports.alive = function() {
  return new Promise((resolve, reject) => {
    resolve('ok')
  })
}

/**
 * When this Insight Module is added to a new ExoSense, this will get called.
 *
 * solution_id String The solution identifier. Set automatically.
 * no response value expected for this operation
 **/
exports.createSolution = function(solution_id) {
  return new Promise((resolve, reject) => {
    log.info('Added to ExoSense Install ID: ' + solution_id)
    resolve()
  })
}

/**
 * When this Insight Module is removed from an ExoSense, this will get called.
 * Also called if the ExoSense was deleted.
 *
 * solution_id String The solution identifier. Set automatically.
 * no response value expected for this operation
 **/
exports.delSolution = function(solution_id) {
  return new Promise((resolve, reject) => {
    log.info('Removed from ExoSense Install ID: ' + solution_id)
    resolve()
  })
}

/**
 * Get some info about this Insight
 *
 * solution_id String The solution identifier. Set automatically by Murano at service call.
 * returns InsightInfoResults
 **/
exports.info = function(solution_id) {
  return Promise.resolve({
    group_id_required: false,
    name: 'My Example Insight Module',
    description: 'description',
    wants_lifecycle_events: true,
  })
}

/* All of the functions this module supports.
 */
const insightFunctionList = {
  linearGain: {
    constants: [
      {
        name: 'gain',
        type: 'number',
        description: 'Gain',
        default: 1,
        required: true,
      },
      {
        name: 'offset',
        type: 'number',
        description: 'Offset',
        default: 0,
        required: true,
      },
    ],
    description: 'Compute a Linear Gain (result = gain * x + offset)',
    name: 'Linear Gain',
    inlets: [{ primitive_type: 'NUMERIC', tag: 'A', name: 'What goes in' }],
    outlets: [{ primitive_type: 'NUMERIC', name: 'What comes out' }],
    action: {
      // onValue() called for each data value; is passed only the value and constants.
      onValue: (value, constants, solution_id) => {
        return Number(value) * constants.gain + constants.offset
      },
      // onData() called for each data value; is passed entire SignalData object and all function args.
      // onData: (data, args, solution_id) => {}
    },
  },
  temperature: {
    description: 'Return the temperature in °C under certain conditions',
    name: 'Temperature',
    inlets: [
      { primitive_type: 'NUMERIC', tag: 'A', name: 'Temperature in °C' },
      { primitive_type: 'NUMERIC', tag: 'B', name: 'running state' },
    ],
    outlets: [
      {
        primitive_type: 'NUMERIC',
        tag: 'Z',
        name: 'Numeric Temperature in °C if temp is between -20 and 120',
      },
      {
        primitive_type: 'NUMERIC',
        tag: 'Y',
        name: 'Numeric Temperature in °C if state is running',
      },
    ],
    action: {
      // onData() called for each data value; is passed entire SignalData object and all function args.
      onData: (data, args, solution_id) => {
        const res = [
          data.tags,
          {
            Z: +data.tags.A >= -20 && +data.tags.A <= 120 ? +data.tags.A : null,
            Y: +data.tags.B === 1 ? +data.tags.A : null,
          },
        ]
        return res
      },
    },
  },
}

/**
 * Get info about one Insight Function
 *
 * solution_id String The solution identifier. Set automatically by Murano at service call.
 * function_id String Identifier of function
 * returns InsightInfo
 **/
exports.infoInsight = function(solution_id, function_id) {
  return new Promise((resolve, reject) => {
    if (!_.has(insightFunctionList, function_id)) {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject(
        utils.respondWithCode(400, {
          name: 'Not Implemented',
          message: `The function ${function_id} is not implemented`,
        })
      )
      return
    }
    const ifn = insightFunctionList[function_id]
    const result = _.assign(_.omit(ifn, 'action'), { id: function_id })
    resolve(result)
  })
}

/**
 * Notifications of when a linkage that will call the process function is created or deleted.
 *
 * solution_id String The solution identifier. Set automatically by Murano at service call.
 * body LifecycleEvent Lifecycle event
 * no response value expected for this operation
 **/
exports.lifecycle = function(solution_id, body) {
  return new Promise((resolve, reject) => {
    log.debug(body)
    const event = body.event || 'nop'
    const lid = body.id || '--missing--'
    const args = body.args || {}
    log.info(
      `From ExoSense ID: ${solution_id} Linkage ${lid} was ${event} with ${JSON.stringify(
        args
      )}`
    )
    resolve()
  })
}

/**
 * Get a list of available Insight Functions and info about them
 *
 * solution_id String The solution identifier. Set automatically by Murano at service call.
 * body InsightsFilterParams Get a list of available insight functions
 * returns InsightListResults
 **/
exports.listInsights = function(solution_id, body) {
  return new Promise((resolve, reject) => {
    const result = {
      total: _.keys(insightFunctionList).length,
      count: _.keys(insightFunctionList).length,
      insights: _.transform(
        insightFunctionList,
        (res, val, key) => {
          res.push(_.assign(_.omit(val, 'action'), { id: key }))
        },
        []
      ),
    }
    resolve(result)
  })
}

async function processMany(data, args, solutionId, work_fn) {
  // Fan these all out.
  const promises = data.map(i => {
    return work_fn(i, args, solutionId)
  })

  const collected = await Promise.all(promises)

  if (collected.length === 0) {
    return collected
  }
  log.debug('collected', collected)
  // Pull results back into the format we expect
  // TODO: handle multiple outlet functions better
  const returning = collected.reduce(
    (acc, cur) => {
      log.debug('acc', acc, 'cur', cur)
      return [acc[0].concat(cur[0] || []), acc[1].concat(cur[1] || [])]
    },
    [[], []]
  )

  return returning
}

/**
 * For a given function_id, get the implementation function with optional wrapping
 * @param {*} solution_id
 * @param {*} function_id
 */
function build_fn(solution_id, function_id) {
  if (_.has(insightFunctionList, `${function_id}.action.onValue`)) {
    const onValue = _.get(insightFunctionList, `${function_id}.action.onValue`)
    return (data, args, sol_id) => {
      const res_value = onValue(
        _.get(data, 'value', 0),
        _.get(args, 'constants', {}),
        solution_id
      )

      return [[_.assign({}, data, { value: res_value })]]
    }
  } else if (_.has(insightFunctionList, `${function_id}.action.onData`)) {
    return _.get(insightFunctionList, `${function_id}.action.onData`)
  }
  return data => {
    return [[data]]
  }
}

/**
 * Your function to process a bunch of Signal Data.
 *
 * solution_id String The solution identifier. Set automatically by Murano at service call.
 * body SignalDataObjectArray Data to process and arguments on how to process it
 * returns SignalDataArrayArray
 **/
exports.process = function(solution_id, body) {
  return new Promise(async (resolve, reject) => {
    const { data = [], args = {} } = body
    const { function_id = '' } = args
    log.debug(data)

    if (!_.has(insightFunctionList, function_id)) {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject(
        utils.respondWithCode(400, {
          name: 'Not Implemented',
          message: `The function "${function_id}" is not implemented`,
        })
      )
      return
    }
    const work_fn = build_fn(solution_id, function_id)

    const result = await processMany(data, args, solution_id, work_fn)
    resolve(result)
  })
}
