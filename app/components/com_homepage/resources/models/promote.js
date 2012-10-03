var util = require('util');
var _ = require('underscore');

var NE = require('nuby-express');
var mm = NE.deps.support.mongoose_model;

var _DEBUG = true;

var _model;

function _parse_date(d) {
    var dp = /(.*)\/(.*)\/(.*)( (.*))?/.exec(d);
    return new Date(dp[3], dp[1], dp[2]);
}

module.exports = function (mongoose_inject) {

    if (!_model) {

        if (!mongoose_inject) {
            mongoose_inject = NE.deps.mongoose;
        }

        var _schema_def = {
            title:'string',
            link:'string',
            image:'string',
            limit_from:'boolean',
            limit_from_date:'date',
            limit_to:'boolean',
            limit_to_date:'date',
            notes:'string',
            weight:{type:'number', default:0},
            access_tasks:['string'],
            basis:{ type:'string', unique:true},
            deleted:{type:'boolean', default:false}
        };

        var schema = new mongoose_inject.Schema(_schema_def);

        _model = mm.create(
            schema,
            {
                name:"promote",
                get_basis:function (basis, cb) {
                    if (_DEBUG) console.log('trying to find basis %s', basis);
                    this.find_one({basis:basis}, cb);
                },
                promote:function (basis, data, cb) {
                    if (_DEBUG) console.log('.... promote .... %s', util.inspect(basis));

                    _model.get_basis(basis, function (err, old_promote) {
                        if (data) {
                            if (_DEBUG) console.log('promoting %s', util.inspect(data));
                            if (old_promote) {
                                if (_DEBUG) console.log('found old promote %s', util.inspect(old_promote));
                                data.deleted = false;
                                _.extend(old_promote, data);
                                old_promote.save(cb);
                            } else {
                                data.basis = basis;
                                if (_DEBUG) console.log('inserting basis: %s', util.inspect(data));
                                if (data.limit_from_date && _.isString(data.limit_from_date)) {
                                    data.limit_from_date = _parse_date(data.limit_from_date);
                                }
                                if (data.limit_to_date && _.isString(data.limit_to_date)) {
                                    data.limit_to_date = _parse_date(data.limit_to_date);
                                }
                                _model.put(data, function (err, data_record) {
                                    if (_DEBUG) console.log('result: %s, %s', util.inspect(err), util.inspect(data_record));
                                    cb(err, data_record);
                                });
                            }
                        } else if (old_promote) {
                            if (_DEBUG) console.log('deleting old promotion');
                                _model.delete(old_promote, cb, true);
                        } else {
                            if (_DEBUG) console.log('... not doing anything in promote');
                            cb();
                        }

                    });
                }
            }, mongoose_inject
        )
    }
    return _model;
}
