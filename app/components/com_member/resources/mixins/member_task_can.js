var NE = require('nuby-express');
var util = require('util');
var _DEBUG = false;
var _DEBUG_OPTIONS = false;
var _ = require('underscore');
var Gate = NE.deps.support.Gate;

/* ***************** CLOSURE ******************* */

/**
 * a validation method dependant on a member with privileged tasks
 * listed in member.privs, and a task manifest.
 *
 * This method serves in two modes - as a boolean returning function or as a
 * method that enacts one of two passed callback.
 *
 * @param rs: Req_State
 * @param task Array[String] | String
 * @param member (optional) member data object - see auth controller's mid action.
 * @param if_can (optional) a callback to enact if the user is privileged.
 * @param if_cant (optional) a callback to enact if user is not privileged.
 * @return Boolean | callback result (most likely void).
 * @private
 */

var _DEBUG = false;
function _can(rs, task, member, if_can, if_cant) {

    if (_DEBUG) console.log('CHECKING CAN: %s ###############', util.inspect(task));

    if (_.isFunction(if_can)) {
        if_can = _.bind(if_can, this);
    }
    if (_.isFunction(if_cant)) {
        if_cant = _.bind(if_cant, this);
    }

    if (!task) {
        if (_DEBUG) console.log('no task - doing if can');
        return if_can ? if_can(rs) : true;
    } else {
        if (!member) {
            if (_DEBUG)     console.log(' can: getting session member');
            member = rs.session('member');
            if (_DEBUG)   console.log('can: member = %s', util.inspect(member));
        }

        if (member) {
            if (_.isArray(task)) {
                task = _.uniq(task);
            } else {
                task = [task];
            }

            //   console.log('member: %s', util.inspect(member));
            var privs = _.uniq(member.privs);

            var found = true;
            task.forEach(function (t) {
                console.log('looking for task %s', t);

                if (_.include(member.privs, t)) {
                    console.log(' ..... found');
                } else {
                    console.log(' ....... not found ');
                    found = false;
                }
            });

            if (found) {
                if (_DEBUG)   console.log('can do - doing if_can / returning true');
                return if_can ? if_can(rs) : true;
            } else if (if_cant) {
                if (_DEBUG)  console.log(' - doing if_cant');
                return if_cant(rs);
            } else {
                if (_DEBUG)  console.log(', if_cant - returning false');
                return false;
            }

        } else if (if_cant) {
            if (_DEBUG)  console.log('no member - doing if_cant');
            return if_cant(rs);
        } else {
            if (_DEBUG)  console.log('no member, if_cant - returning false');
            return false;
        }
    }

}
/* ****************** MODULE ***************** */

module.exports = {
    init:function (frame, cb) {

        NE.Action.prototype.can = _can;

        cb();

    }
}

