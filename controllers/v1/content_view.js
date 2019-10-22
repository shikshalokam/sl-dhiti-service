var config = require('../../config/config');
var rp = require('request-promise');
var request = require('request');
var model = require('../../db')
var helperFunc = require('../../helper/chartData');


exports.contentView = async function (req, res) {
    //get quey from cassandra
    model.MyModel.findOneAsync({ qid: "content_view_query" }, { allow_filtering: true })
        .then(async function (result) {
            var bodyParam = JSON.parse(result.query);
            if (config.druid.telemetry_datasource_name) {
                bodyParam.dataSource = config.druid.telemetry_datasource_name;
            }
            var today = new Date();
            var mm = today.getMonth() + 1;
            var year = today.getFullYear();
            var date = year + "-" + mm + '-01T00:00:00.000Z';
            bodyParam.filter.fields[1].lower = date;
            //pass the query as body param and get the result from druid
            var options = config.druid.options;
            options.method = "POST";
            options.body = bodyParam;
            var data = await rp(options);
            if (!data.length) {
                res.send({ "result": false, "data": [] })
            }
            else {
                res.send({ "result": true, "data": data[0].result });
            }
        })
        .catch(function (err) {
            console.log(err);
            res.status(400);
            var response = {
                result: false,
                message: 'Data not found',
                data: []
            }
            res.send(response);
        })

}



exports.contentViewedByUser = async function (req, res) {
    if (!req.body.userId) {
        res.status(400);
        var response = {
            result: false,
            message: 'userId is a required field',
            data: []
        }
        res.send(response);
    }
    else {
        //get quey from cassandra
        model.MyModel.findOneAsync({ qid: "content_viewed_by_user_query" }, { allow_filtering: true })
            .then(async function (result) {
                var bodyParam = JSON.parse(result.query);
                if (config.druid.telemetry_datasource_name) {
                    bodyParam.dataSource = config.druid.telemetry_datasource_name;
                }
                bodyParam.filter.fields[0].value = req.body.userId;
                var today = new Date();
                var mm = today.getMonth() + 1;
                var year = today.getFullYear();
                var date = year + "-" + mm + '-01T00:00:00.000Z';
                bodyParam.filter.fields[1].fields[1].lower = date;
                //pass the query as body param and get the result from druid
                var options = config.druid.options;
                options.method = "POST";
                options.body = bodyParam;
                var data = await rp(options);
                if (!data.length) {
                    res.send({ "result": false, "data": [] })
                }
                else {
                    console.log(data);
                    res.send({ "result": true, "data": data[0].result });
                }
            })
            .catch(function (err) {
                console.log(err);
                res.status(400);
                var response = {
                    result: false,
                    message: 'Data not found',
                    data: []
                }
                res.send(response);
            })

    }
}